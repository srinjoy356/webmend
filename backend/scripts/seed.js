const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const SEED_COLLECTORS = [
  {
    id: process.env.FIXTURE_COLLECTOR_ID || 'c_mswy3fc02128qburqf',
    name: 'Fixture Store (PDP)',
    target_url: 'https://fixture-store.vercel.app',
    expected_schema: [
      'product_name',
      'price',
      'currency',
      'stock_status',
      'image_url',
      'description',
      'last_checked'
    ]
  },
  {
    id: process.env.REAL_TARGET_COLLECTOR_ID || 'c_mswxou59gsluhekiy',
    name: 'Croma (Discovery)',
    target_url: 'https://www.croma.com/campaign/redmi-note-/c/7574',
    expected_schema: [
      'product_name',
      'availability',
      'rating',
      'product_page_url',
      'price' // Added price to match the product's primary use case
    ]
  },
  {
    id: 'c_msx8l409dtxp9fx0w',
    name: 'Zepto (Search)',
    target_url: 'https://www.zeptonow.com/search?q=milk',
    expected_schema: [
      'current_price',
      'pack_size',
      'brand',
      'image_url',
      'product_page_url'
    ]
  }
];

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase Postgres. Seeding collectors...');
    
    for (const col of SEED_COLLECTORS) {
      await client.query(
        `INSERT INTO collectors (id, target_url, expected_schema, name) 
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE 
         SET target_url = EXCLUDED.target_url, 
             expected_schema = EXCLUDED.expected_schema, 
             name = EXCLUDED.name`,
        [col.id, col.target_url, JSON.stringify(col.expected_schema), col.name]
      );
      console.log(`Seeded collector: ${col.name}`);
    }
    
    console.log('Seeding complete.');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await client.end();
  }
}

seed();
