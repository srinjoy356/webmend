const { Client } = require('pg');

async function test() {
  const client = new Client({
    connectionString: 'postgresql://postgres.awxihhptnrxlpjheswju:sUJh%2BneP*%2F%2FcM5t@aws-0-ap-south-1.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });
  
  // try with ssl rejection if local requires it or we check process.env
  try {
    await client.connect();
    
    // Check Zepto rows
    const res = await client.query(`SELECT run_id, collector_id, data FROM rows LIMIT 5`);
    console.log(JSON.stringify(res.rows, null, 2));
    
    // Check how many rows per run
    const res2 = await client.query(`SELECT run_id, count(*) FROM rows GROUP BY run_id`);
    console.log(JSON.stringify(res2.rows, null, 2));

  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

test();
