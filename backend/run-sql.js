const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runSqlFile(filePath) {
  const sqlString = fs.readFileSync(path.join(__dirname, '..', filePath), 'utf8');
  const connection = await require('mysql2/promise').createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'studyhub',
    port: Number(process.env.DB_PORT) || 3306,
    multipleStatements: true
  });
  
  try {
    console.log(`Executing ${filePath}...`);
    await connection.query(sqlString);
    console.log(`Successfully executed ${filePath}`);
  } catch (err) {
    console.error(`Error executing ${filePath}:`, err);
  } finally {
    await connection.end();
  }
}

async function main() {
  await runSqlFile('database/schema.sql');
  await runSqlFile('database/seed.sql');
  process.exit(0);
}

main();
