const { exec } = require('child_process');
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

/**
 * Executes a Bright Data CLI scraper heal command and captures the output JSON.
 * @param {string} collectorId 
 * @param {string} prompt 
 * @param {string} url 
 * @returns {Promise<Object>} The parsed JSON envelope from Bright Data CLI
 */
function execHealCommand(collectorId, prompt, url) {
  return new Promise((resolve, reject) => {
    // Note: The CLI logs progress to stderr and the final JSON to stdout.
    // It can take several minutes to run.
    const cmd = `cmd /c npx -p @brightdata/cli bdata scraper heal ${collectorId} "${prompt}" --url "${url}"`;
    console.log(`Executing heal command: ${cmd}`);
    
    // Set a very large maxBuffer (e.g., 50MB) and no timeout since heal can take minutes
    const child = exec(cmd, { maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
      // The CLI exits with code 0 on success, or code 1 if it fails.
      // However, even on failure, it outputs the JSON envelope (e.g. status: "heal_trigger_failed")
      try {
        const jsonStart = stdout.indexOf('{');
        const jsonEnd = stdout.lastIndexOf('}') + 1;
        if (jsonStart === -1) {
            console.error("No JSON found in stdout. Stdout:", stdout);
            return reject(new Error("No JSON envelope returned from heal command"));
        }
        const jsonStr = stdout.substring(jsonStart, jsonEnd);
        const data = JSON.parse(jsonStr);
        resolve(data);
      } catch (err) {
        console.error("Failed to parse heal command output. Error:", err, "Stdout:", stdout);
        reject(err);
      }
    });

    // Pipe stderr to process.stdout so we can see progress logs in our console
    child.stderr.on('data', (data) => {
      process.stdout.write(data);
    });
  });
}

/**
 * Orchestrates the healing process.
 * Generates the prompt, triggers the CLI, and logs the result to the database.
 * @param {string} collectorId 
 * @param {string[]} brokenFields 
 */
async function triggerHeal(collectorId, brokenFields) {
  const client = await getDbClient();
  try {
    const colRes = await client.query('SELECT * FROM collectors WHERE id = $1', [collectorId]);
    if (colRes.rows.length === 0) {
      console.error(`Collector config not found for ${collectorId}`);
      return;
    }
    const config = colRes.rows[0];
    const prompt = `The ${brokenFields.join(', ')} fields are returning null since the page redesign. Heal the scraper to recapture them from the new markup, anchored on ${config.target_url}.`;
    
    // Log the break event
    await client.query(
      `INSERT INTO events (collector_id, event_type, details) VALUES ($1, $2, $3)`,
      [collectorId, 'break', JSON.stringify({ brokenFields, generatedPrompt: prompt })]
    );

    console.log(`Triggering heal for ${collectorId}. Fields broken: ${brokenFields.join(', ')}`);
    
    // Log heal started
    await client.query(
      `INSERT INTO events (collector_id, event_type, details) VALUES ($1, $2, $3)`,
      [collectorId, 'heal_started', JSON.stringify({ message: "AI healing job in progress" })]
    );
    
    const resultEnvelope = await execHealCommand(collectorId, prompt, config.target_url);
    
    console.log(`Heal process finished with status: ${resultEnvelope.status}`);

    // Log the appropriate event based on status
    const eventType = resultEnvelope.status === 'awaiting_approval' ? 'heal_pending' : 'heal_error';
    
    await client.query(
      `INSERT INTO events (collector_id, event_type, details) VALUES ($1, $2, $3)`,
      [collectorId, eventType, JSON.stringify({ resultEnvelope })]
    );

    return resultEnvelope;
  } catch (err) {
    console.error(`Error in heal orchestration for ${collectorId}:`, err);
    // Log error event
    await client.query(
      `INSERT INTO events (collector_id, event_type, details) VALUES ($1, $2, $3)`,
      [collectorId, 'heal_error', JSON.stringify({ error: err.message })]
    );
    throw err;
  } finally {
    await client.end();
  }
}

module.exports = { triggerHeal, execHealCommand };
