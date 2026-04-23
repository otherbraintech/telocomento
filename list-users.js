const { Client } = require('pg');

async function checkUsers() {
  const client = new Client({
    connectionString: "postgres://postgres:595a9c1fe8c5776b1879@31.220.87.192:3428/telocomento?sslmode=disable",
  });
  try {
    await client.connect();
    const res = await client.query(`SELECT id, email, username FROM users`);
    console.log("Usuarios en la base de datos:", res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkUsers();
