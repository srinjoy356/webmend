require('dotenv').config({path: '../.env'});
const {Client} = require('pg');
const c = new Client({connectionString: process.env.DATABASE_URL, ssl: {rejectUnauthorized: false}});
c.connect().then(() => c.query("SELECT details FROM events WHERE event_type = 'heal_pending' LIMIT 1"))
  .then(r => console.log(JSON.stringify(r.rows[0], null, 2)))
  .catch(console.error)
  .finally(() => c.end());
