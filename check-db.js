const { Client } = require('pg');

async function checkColumns() {
  const client = new Client({
    connectionString: "postgres://postgres:595a9c1fe8c5776b1879@31.220.87.192:3428/telocomento?sslmode=disable",
  });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    console.log("Columnas en 'users':", res.rows.map(r => r.column_name));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkColumns();
