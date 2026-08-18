const { Client } = require('pg');
async function test() {
  const client = new Client({
    connectionString: 'postgresql://postgres.awxihhptnrxlpjheswju:sUJh%2BneP*%2F%2FcM5t@aws-0-ap-south-1.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'rows';
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  
  // What columns exist in `runs`?
  const res2 = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'runs';
  `);
  console.log("RUNS:", JSON.stringify(res2.rows, null, 2));

  await client.end();
}
test();
