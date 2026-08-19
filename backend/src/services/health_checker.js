const { Client } = require('pg');
// DB driven now
const { triggerHeal } = require('./heal_orchestrator');
const socket = require('../socket');
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

async function generateBreakSummary(brokenFields) {
  const fallback = `${brokenFields.join(', ')} returned null.`;
  if (!process.env.OPENAI_API_KEY) {
    return fallback;
  }
  
  try {
    const fetchFn = typeof fetch !== 'undefined' ? fetch : (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const response = await fetchFn('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `Draft a short, plain-English one-line summary (max 15 words) stating that the following fields broke and returned null: ${brokenFields.join(', ')}.`
        }],
        max_tokens: 50,
        temperature: 0.3
      })
    });
    
    if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.warn("Failed to generate LLM summary, falling back to basic string.", error.message);
    return fallback;
  }
}

/**
 * Checks a specific run for missing data against the expected schema.
 * @param {string} runId 
 * @param {string} collectorId 
 */
async function checkRun(runId, collectorId) {
  const client = await getDbClient();
  try {
    const colRes = await client.query('SELECT * FROM collectors WHERE id = $1', [collectorId]);
    if (colRes.rows.length === 0) {
      console.error(`Collector config not found for ${collectorId}`);
      return { status: 'error', reason: 'config_missing' };
    }
    const config = colRes.rows[0];
    const res = await client.query(`SELECT data FROM rows WHERE run_id = $1`, [runId]);
    const rows = res.rows.map(r => r.data);

    if (rows.length === 0) {
      console.log(`No rows extracted in run ${runId}, cannot perform health check.`);
      return { status: 'no_data' };
    }

    // Filter out rows that represent crawler errors (e.g., navigation timeouts)
    const validRows = rows.filter(r => !r.error && !r.error_code);

    if (validRows.length === 0) {
      console.log(`No valid rows extracted in run ${runId} (all rows were errors), cannot perform health check.`);
      return { status: 'no_data' };
    }

    const missingCounts = {};
    config.expected_schema.forEach(field => missingCounts[field] = 0);

    for (const row of validRows) {
      for (const field of config.expected_schema) {
        if (row[field] === undefined || row[field] === null || row[field] === '') {
          missingCounts[field]++;
        }
      }
    }

    const brokenFields = [];
    const totalRows = validRows.length;

    for (const [field, count] of Object.entries(missingCounts)) {
      const nullRate = count / totalRows;
      // >50% threshold for real-world sites
      if (nullRate >= 0.5) {
        brokenFields.push(field);
      }
    }

    if (brokenFields.length > 0) {
      console.warn(`Health check failed for run ${runId}. Broken fields: ${brokenFields.join(', ')}`);
      
      const dashboardSummary = await generateBreakSummary(brokenFields);
      console.log(`Dashboard Summary: ${dashboardSummary}`);
      // Dispatch Webhook alert (Stretch Goal)
      try {
        const webhookUrl = process.env.ALERT_WEBHOOK_URL || 'https://webhook.site/webmend-demo-alert';
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'scraper_broken',
            collectorId,
            runId,
            brokenFields,
            summary: dashboardSummary,
            timestamp: new Date().toISOString()
          })
        }).catch(() => {}); // fire and forget
        console.log(`Dispatched broken-scraper alert to webhook.`);
      } catch (e) {
        console.error("Webhook dispatch failed", e);
      }
      
      // LOG THE BREAK EVENT
      const prompt = `The ${brokenFields.join(', ')} fields are returning null since the page redesign. Heal the scraper to recapture them from the new markup, anchored on ${config.target_url}.`;
      await client.query(
        `INSERT INTO events (collector_id, event_type, details) VALUES ($1, $2, $3)`,
        [collectorId, 'break', JSON.stringify({ brokenFields, generatedPrompt: prompt })]
      );
      try { socket.getIO().emit('COLLECTOR_STATUS_CHANGED', { collectorId }); } catch(e) {}

      // Check if we just approved a heal recently to prevent infinite heal loops
      const lastEventsRes = await client.query(
        `SELECT event_type, created_at FROM events WHERE collector_id = $1 ORDER BY created_at DESC LIMIT 5`,
        [collectorId]
      );
      const recentApproval = lastEventsRes.rows.find(e => 
        e.event_type === 'heal_approved' && 
        (new Date() - new Date(e.created_at)) < 5 * 60 * 1000
      );

      if (recentApproval) {
        console.warn(`Skipping heal trigger because a heal was approved less than 5 minutes ago.`);
      } else {
        // We will await the heal orchestrator so the runner process stays alive
        // until the AI finishes proposing a template.
        await triggerHeal(collectorId, brokenFields);
      }
      
      return { status: 'broken', brokenFields, dashboardSummary };
    } else {
      console.log(`Health check passed for run ${runId}.`);
      return { status: 'healthy' };
    }
  } catch (error) {
    console.error(`Error during health check for ${runId}:`, error);
    throw error;
  } finally {
    await client.end();
  }
}

module.exports = { checkRun };
