const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function cleanup() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Delete rows, runs, and events for the old collector
    await client.query("DELETE FROM rows WHERE collector_id = 'c_mswy3fc02128qburqf'");
    await client.query("DELETE FROM runs WHERE collector_id = 'c_mswy3fc02128qburqf'");
    await client.query("DELETE FROM events WHERE collector_id = 'c_mswy3fc02128qburqf'");
    await client.query("DELETE FROM collectors WHERE id = 'c_mswy3fc02128qburqf'");
    console.log('Deleted old fixture collector');

    // Reset Croma healing state by deleting the 'heal_started' event
    // Croma ID: c_mswxou59gsluhekiy
    await client.query("DELETE FROM events WHERE collector_id = 'c_mswxou59gsluhekiy' AND event_type = 'heal_started'");
    console.log('Reset Croma healing state');

    const res = await client.query('SELECT id, name FROM collectors');
    console.log('Current Collectors:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

cleanup();
