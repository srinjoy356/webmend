const express = require('express');
const { execCliCommand } = require('../utils/spawnHelper');
const { Client } = require('pg');
const router = express.Router();

async function getDbClient() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  return client;
}

// GET /api/collectors - List all configured collectors with their latest status
router.get('/collectors', async (req, res) => {
  const client = await getDbClient();
  try {
    const collectorsRes = await client.query('SELECT * FROM collectors');
    const dbCollectors = collectorsRes.rows;
    
    const collectorsWithStatus = await Promise.all(dbCollectors.map(async (collector) => {
      // Get the latest event for status
      const eventsRes = await client.query(
        `SELECT event_type, details, created_at FROM events WHERE collector_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [collector.id]
      );
      
      let status = 'healthy';
      let dashboardSummary = null;
      let lastEventTime = null;
      
      if (eventsRes.rows.length > 0) {
        const lastEvent = eventsRes.rows[0];
        lastEventTime = lastEvent.created_at;
        
        if (lastEvent.event_type === 'break') {
          status = 'broken';
          const details = lastEvent.details || {};
          dashboardSummary = details.generatedPrompt || "Fields returning null.";
        } else if (lastEvent.event_type === 'heal_pending') {
          status = 'awaiting_approval';
        } else if (lastEvent.event_type === 'heal_error') {
          status = 'heal_error';
        } else if (lastEvent.event_type === 'run') {
          // You could also check if the last run was healthy, but events usually record 'break'
          status = 'healthy';
        }
      }
      
      // Get latest run
      const runsRes = await client.query(
        `SELECT started_at, status FROM runs WHERE collector_id = $1 ORDER BY started_at DESC LIMIT 1`,
        [collector.id]
      );
      
      const statsRes = await client.query(
        `SELECT 
          COUNT(*) as total, 
          SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success 
         FROM runs WHERE collector_id = $1`,
        [collector.id]
      );
      
      const totalRuns = parseInt(statsRes.rows[0].total, 10) || 0;
      const successRuns = parseInt(statsRes.rows[0].success, 10) || 0;
      const uptime = totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 100;
      
      return {
        ...collector,
        status,
        dashboardSummary,
        last_event_time: lastEventTime,
        last_run: runsRes.rows[0] || null,
        runCount: totalRuns,
        uptime
      };
    }));
    
    res.json(collectorsWithStatus);
  } catch (error) {
    console.error("Error fetching collectors:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await client.end();
  }
});

// GET /api/collectors/:id - Get specific collector details and recent extracted rows
router.get('/collectors/:id', async (req, res) => {
  const collectorId = req.params.id;
  const client = await getDbClient();
  try {
    const colRes = await client.query('SELECT * FROM collectors WHERE id = $1', [collectorId]);
    if (colRes.rows.length === 0) return res.status(404).json({ error: 'Collector not found' });
    const config = colRes.rows[0];
    
    // Get latest run ID
    const runRes = await client.query(
      `SELECT id, started_at, status FROM runs WHERE collector_id = $1 ORDER BY started_at DESC LIMIT 1`,
      [collectorId]
    );
    
    // Fetch all historical rows
    const dataRes = await client.query(
      `SELECT data, extracted_at FROM rows WHERE collector_id = $1 ORDER BY extracted_at ASC LIMIT 50`,
      [collectorId]
    );
    
    let rows = dataRes.rows.map(r => ({ ...r.data, _scraped_at: r.extracted_at }));
    
    res.json({
      ...config,
      latest_run: runRes.rows[0] || null,
      rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.end();
  }
});

// GET /api/collectors/:id/events - Get event timeline
router.get('/collectors/:id/events', async (req, res) => {
  const collectorId = req.params.id;
  const client = await getDbClient();
  try {
    const eventsRes = await client.query(
      `SELECT id, event_type, details, created_at FROM events WHERE collector_id = $1 ORDER BY created_at DESC LIMIT 100`,
      [collectorId]
    );
    res.json(eventsRes.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.end();
  }
});
// POST /api/collectors/create - Dynamically build a scraper
router.post('/collectors/create', async (req, res) => {
  const { url, description, name } = req.body;
  if (!url || !description || !name) {
    return res.status(400).json({ error: 'url, description, and name are required' });
  }

  // We use execCliCommand with an args array to avoid command injection
  const args = ['-p', '@brightdata/cli', 'bdata', 'scraper', 'create', url, description, '--name', name, '--json'];
  console.log(`Executing create command via cross-spawn: npx ${args.join(' ')}`);
  
  execCliCommand('npx', args)
    .then(async ({ stdout }) => {
      const client = await getDbClient();
      try {
        const jsonStart = stdout.indexOf('{');
        const jsonEnd = stdout.lastIndexOf('}') + 1;
        if (jsonStart === -1) throw new Error("No JSON found");
        const jsonStr = stdout.substring(jsonStart, jsonEnd);
        const data = JSON.parse(jsonStr);
        
        const collectorId = data.collector_id;
        if (collectorId) {
          const schema = data.schema || [];
          await client.query(
            `INSERT INTO collectors (id, target_url, expected_schema, name) VALUES ($1, $2, $3, $4)`,
            [collectorId, url, JSON.stringify(schema), name]
          );
          console.log(`Onboarded new collector ${collectorId} into DB.`);
        }
      } catch(err) {
        console.error("Failed to parse create output", err);
      } finally {
        await client.end();
      }
    })
    .catch((error) => {
      console.error("Create failed", error);
    });

  // Return immediately to not block the frontend for 10 minutes
  res.json({ message: 'Scraper creation job started. It will appear in the dashboard in ~5-10 minutes.' });
});

// POST /api/collectors/:id/heal/approve
router.post('/collectors/:id/heal/approve', async (req, res) => {
  const collectorId = req.params.id;
  const action = req.body?.action || 'approve'; // 'approve' or 'reject'
  
  const client = await getDbClient();
  try {
    // We execute the bright data CLI for 'approve' or 'reject' using execCliCommand
    const args = ['-p', '@brightdata/cli', 'bdata', 'scraper', action, collectorId];
    console.log(`Executing: npx ${args.join(' ')}`);
    
    execCliCommand('npx', args)
      .then(async ({ stdout }) => {
        console.log(`Command stdout: ${stdout}`);
        
        // Clear the broken run status now that we've approved the fix
        await client.query(`UPDATE runs SET status = 'success' WHERE collector_id = $1 AND status = 'broken'`, [collectorId]);
        await client.query(`DELETE FROM events WHERE event_type = 'heal_pending' AND collector_id = $1`, [collectorId]);
        
        // Log event
        await client.query(
          `INSERT INTO events (collector_id, event_type, details) VALUES ($1, $2, $3)`,
          [collectorId, action === 'approve' ? 'heal_approved' : 'heal_rejected', JSON.stringify({ output: stdout })]
        );
        
        // Automatically trigger a fresh run to verify and pull the recovered data
        if (action === 'approve') {
          const configRes = await client.query('SELECT target_url FROM collectors WHERE id = $1', [collectorId]);
          if (configRes.rows.length > 0) {
            const { runAndStore } = require('../services/runner');
            console.log(`Automatically running a fresh scrape for ${collectorId} post-approval...`);
            runAndStore(collectorId, configRes.rows[0].target_url).catch(e => console.error("Post-heal run failed", e));
          }
        }
        
        client.end();
        res.json({ success: true, stdout });
      })
      .catch(async (error) => {
        console.error(`Exec error: ${error.message}`);
        await client.query(
          `INSERT INTO events (collector_id, event_type, details) VALUES ($1, $2, $3)`,
          [collectorId, 'heal_error', JSON.stringify({ error: error.message })]
        );
        client.end();
        return res.status(500).json({ error: error.message });
      });
  } catch (error) {
    await client.end();
    res.status(500).json({ error: error.message });
  }
});

// POST /api/collectors/:id/run
router.post('/collectors/:id/run', async (req, res) => {
  const collectorId = req.params.id;
  const client = await getDbClient();
  try {
    const configRes = await client.query('SELECT target_url FROM collectors WHERE id = $1', [collectorId]);
    if (configRes.rows.length === 0) {
      return res.status(404).json({ error: 'Collector not found' });
    }

    const config = configRes.rows[0];
    const { runAndStore } = require('../services/runner');
    
    // Run it asynchronously (don't wait for the entire scraping cycle)
    runAndStore(collectorId, config.target_url).catch(err => console.error("Run failed:", err));
    res.json({ success: true, message: 'Scraper run triggered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await client.end();
  }
});

// POST /api/collectors/:id/simulate-break
router.post('/collectors/:id/simulate-break', async (req, res) => {
  const collectorId = req.params.id;
  
  if (collectorId !== process.env.FIXTURE_COLLECTOR_ID) {
    return res.status(403).json({ error: 'Break simulation is only allowed on the fixture store target.' });
  }

  const client = await getDbClient();
  try {
    const configRes = await client.query('SELECT target_url FROM collectors WHERE id = $1', [collectorId]);
    if (configRes.rows.length === 0) {
      return res.status(404).json({ error: 'Collector not found' });
    }

    const config = configRes.rows[0];

    // We intentionally append /?simulate_break=true to the URL
    // The trailing slash is required by Bright Data's URL validator
    let baseUrl = config.target_url;
    if (!baseUrl.endsWith('/')) {
      baseUrl += '/';
    }
    const overrideUrl = baseUrl + '?simulate_break=true';
    
    // runAndStore requires importing the runner, let's require it locally to avoid circular dependency issues
    const { runAndStore } = require('../services/runner');
    
    // Run it asynchronously (don't wait for the entire scraping cycle)
    // We just return success that it was triggered
    runAndStore(collectorId, overrideUrl).catch(err => console.error("Simulated break run failed:", err));
    res.json({ success: true, message: 'Simulated break triggered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await client.end();
  }
});

module.exports = router;
