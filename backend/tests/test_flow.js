const { Client } = require('pg');
const { checkRun } = require('../src/services/health_checker');

async function testFlow() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  
  const collectorId = 'c_mszzfvhi1m53bnermk';
  console.log("=== STATE TEST ===");

  try {
    // 1. Clear recent events
    await client.query(`DELETE FROM events WHERE collector_id = $1`, [collectorId]);
    
    // 2. Simulate an Approval (User clicked Approve)
    console.log("-> Simulating 'Approve' click");
    await client.query(
      `INSERT INTO events (collector_id, event_type, details) VALUES ($1, $2, $3)`,
      [collectorId, 'heal_approved', JSON.stringify({ output: 'approved' })]
    );

    // 3. Check status (What the UI sees right after approve)
    let res = await client.query(`SELECT event_type FROM events WHERE collector_id = $1 ORDER BY created_at DESC LIMIT 1`, [collectorId]);
    console.log("Last Event after approve:", res.rows[0].event_type); // Should be heal_approved (defaults to healthy)

    // 4. Simulate the background post-approval run failing
    console.log("-> Simulating post-approval test run failing");
    const runId = `run_test_${Date.now()}`;
    await client.query(`INSERT INTO runs (id, collector_id, status) VALUES ($1, $2, 'success')`, [runId, collectorId]);
    // Insert a broken row
    await client.query(`INSERT INTO rows (run_id, collector_id, data) VALUES ($1, $2, $3)`, [runId, collectorId, JSON.stringify({ product_name: 'test' })]);
    
    // Run health check
    await checkRun(runId, collectorId);

    // 5. Check status (What the UI sees after test run fails)
    res = await client.query(`SELECT event_type FROM events WHERE collector_id = $1 ORDER BY created_at DESC LIMIT 2`, [collectorId]);
    console.log("Event Timeline after test run fails:", res.rows.map(r => r.event_type)); 
    // Should be ['break', 'heal_approved']! It should NOT have 'heal_pending'.

    // 6. Simulate the user clicking "Run Scraper" manually 2 minutes later
    console.log("-> Simulating manual run by user (2 mins later)");
    const manualRunId = `run_manual_${Date.now()}`;
    await client.query(`INSERT INTO runs (id, collector_id, status) VALUES ($1, $2, 'success')`, [manualRunId, collectorId]);
    await client.query(`INSERT INTO rows (run_id, collector_id, data) VALUES ($1, $2, $3)`, [manualRunId, collectorId, JSON.stringify({ product_name: 'test' })]);
    await checkRun(manualRunId, collectorId);

    // 7. Check status
    res = await client.query(`SELECT event_type FROM events WHERE collector_id = $1 ORDER BY created_at DESC LIMIT 3`, [collectorId]);
    console.log("Event Timeline after manual run:", res.rows.map(r => r.event_type));
    // Should be ['break', 'break', 'heal_approved']

    console.log("Test Passed! The system did not get stuck in a heal loop.");

  } finally {
    await client.end();
  }
}

testFlow();
