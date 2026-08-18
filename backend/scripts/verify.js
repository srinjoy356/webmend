const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function verify() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    const runs = await client.query('SELECT collector_id, status FROM runs');
    console.log(`Runs:`, runs.rows);
    
    const rows = await client.query('SELECT COUNT(*) as count, collector_id FROM rows GROUP BY collector_id');
    console.log(`Rows Extracted:`, rows.rows);

    const events = await client.query('SELECT collector_id, event_type FROM events');
    console.log(`Events Logged:`, events.rows);
    
  } catch (err) {
    console.error('Verification failed:', err);
  } finally {
    await client.end();
  }
}

verify();
