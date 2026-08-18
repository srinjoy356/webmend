const { execFile } = require('child_process');
const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const { Client } = require('pg');
// DB driven now
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

async function getDbClient() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  return client;
}

// DB driven now

function runScraperCli(collectorId, url) {
  return new Promise((resolve, reject) => {
    console.log(`Triggering collector ${collectorId} for ${url}...`);
    // We use the CLI because it cleanly handles trigger + poll for us
    const args = ['-p', '@brightdata/cli', 'bdata', 'scraper', 'run', collectorId, '--urls', url, '--json'];
    
    // Increased maxBuffer for large JSON payloads
    execFile(npxCmd, args, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`CLI Error:`, stderr);
        return reject(error);
      }
      try {
        // Bright Data CLI prints logs to stderr (or we just parse JSON from stdout)
        // Find the JSON array boundary
        const jsonStart = stdout.indexOf('[');
        const jsonEnd = stdout.lastIndexOf(']') + 1;
        if (jsonStart === -1) throw new Error("No JSON found in output");
        
        const jsonStr = stdout.substring(jsonStart, jsonEnd);
        const data = JSON.parse(jsonStr);
        resolve(data);
      } catch (e) {
        console.error('Failed to parse output:', stdout);
        reject(e);
      }
    });
  });
}

async function runAndStore(collectorId, overrideUrl = null) {
  const client = await getDbClient();
  let runId = `run_${Date.now()}_${collectorId}`;
  
  try {
    const colRes = await client.query('SELECT * FROM collectors WHERE id = $1', [collectorId]);
    if (colRes.rows.length === 0) {
      console.error(`Collector config not found for ${collectorId}`);
      return;
    }
    const config = colRes.rows[0];

    // 1. Create run record
    await client.query(
      `INSERT INTO runs (id, collector_id, status) VALUES ($1, $2, $3)`,
      [runId, collectorId, 'running']
    );

    // 2. Trigger and Poll via CLI
    const targetUrl = overrideUrl || config.target_url;
    const rows = await runScraperCli(collectorId, targetUrl);

    // 3. Store rows
    for (const row of rows) {
      await client.query(
        `INSERT INTO rows (run_id, collector_id, data) VALUES ($1, $2, $3)`,
        [runId, collectorId, JSON.stringify(row)]
      );
    }

    // 4. Mark run complete
    await client.query(
      `UPDATE runs SET status = $1, completed_at = CURRENT_TIMESTAMP WHERE id = $2`,
      ['success', runId]
    );

    // Log the run event
    await client.query(
      `INSERT INTO events (collector_id, event_type, details) VALUES ($1, $2, $3)`,
      [collectorId, 'run', JSON.stringify({ runId, rowsExtracted: rows.length })]
    );

    console.log(`Successfully completed run for ${config.name}. Extracted ${rows.length} rows.`);
    
    // 5. Trigger Health Check
    const { checkRun } = require('./health_checker');
    await checkRun(runId, collectorId);

    return { success: true, rows: rows.length };
  } catch (error) {
    console.error(`Run failed for ${collectorId}:`, error);
    await client.query(
      `UPDATE runs SET status = $1, completed_at = CURRENT_TIMESTAMP WHERE id = $2`,
      ['failed', runId]
    );
    return { success: false, error: error.message };
  } finally {
    await client.end();
  }
}

// If invoked directly, run tests
if (require.main === module) {
  const colId = process.argv[2];
  if (colId) {
    runAndStore(colId).then(() => process.exit(0));
  } else {
    console.log("Usage: node runner.js <collector_id>");
    process.exit(1);
  }
}

module.exports = { runAndStore, runScraperCli };
