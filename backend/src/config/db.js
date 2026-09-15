const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DB_URL;

const pgPool = new Pool({
  connectionString: connectionString,
  ssl: connectionString ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
});

const tablesWithId = new Set([
  'users', 'resources', 'tags', 'comments', 'ratings', 'downloads',
  'roles', 'branches', 'semesters', 'subjects', 'units', 'resource_types'
]);

function convertSql(sql) {
  let converted = sql;

  // Replace IFNULL with COALESCE
  converted = converted.replace(/\bIFNULL\b/gi, 'COALESCE');

  // Replace double-quoted enum/string literals like ="APPROVED" with single quotes ='APPROVED'
  converted = converted.replace(/=\s*"([A-Za-z0-9_ -]+)"/g, "= '$1'");

  // Replace INSERT IGNORE INTO with INSERT INTO ... ON CONFLICT DO NOTHING
  if (/^\s*INSERT\s+IGNORE\s+INTO/i.test(converted)) {
    converted = converted.replace(/^\s*INSERT\s+IGNORE\s+INTO/i, 'INSERT INTO');
    if (!/ON\s+CONFLICT/i.test(converted)) {
      converted += ' ON CONFLICT DO NOTHING';
    }
  }

  // Replace MySQL ON DUPLICATE KEY UPDATE with PostgreSQL ON CONFLICT
  if (/ON\s+DUPLICATE\s+KEY\s+UPDATE/i.test(converted)) {
    if (/ratings/i.test(converted)) {
      converted = converted.replace(
        /ON\s+DUPLICATE\s+KEY\s+UPDATE\s+rating\s*=\s*(?:VALUES\(rating\)|rating)/i,
        'ON CONFLICT (user_id, resource_id) DO UPDATE SET rating = EXCLUDED.rating'
      );
    } else {
      converted = converted.replace(
        /ON\s+DUPLICATE\s+KEY\s+UPDATE\s+([\s\S]+)$/i,
        (match, updates) => {
          const pgUpdates = updates.replace(/VALUES\(([a-zA-Z0-9_]+)\)/gi, 'EXCLUDED.$1');
          return `ON CONFLICT (id) DO UPDATE SET ${pgUpdates}`;
        }
      );
    }
  }

  // Handle RETURNING id for INSERT on tables with an id column
  if (/^\s*INSERT\s+INTO\s+([a-zA-Z0-9_]+)/i.test(converted) && !/RETURNING/i.test(converted) && !/ON\s+CONFLICT\s+DO\s+NOTHING/i.test(converted)) {
    const match = converted.match(/^\s*INSERT\s+INTO\s+([a-zA-Z0-9_]+)/i);
    const tableName = match ? match[1].toLowerCase() : '';
    if (tablesWithId.has(tableName)) {
      converted += ' RETURNING id';
    }
  }

  // Replace ? parameter placeholders with $1, $2, $3 ...
  let paramIndex = 1;
  converted = converted.replace(/\?/g, () => `$${paramIndex++}`);

  return converted;
}

function formatResult(res, sql) {
  const resultRows = res.rows || [];
  if (/^\s*INSERT/i.test(sql)) {
    resultRows.insertId = res.rows[0]?.id || null;
    resultRows.affectedRows = res.rowCount;
  } else if (/^\s*(UPDATE|DELETE)/i.test(sql)) {
    resultRows.affectedRows = res.rowCount;
  }
  return [resultRows, res.fields];
}

const pool = {
  async query(sql, params = []) {
    const convertedSql = convertSql(sql);
    const res = await pgPool.query(convertedSql, params);
    return formatResult(res, sql);
  },

  async getConnection() {
    const client = await pgPool.connect();
    return {
      async query(sql, params = []) {
        const convertedSql = convertSql(sql);
        const res = await client.query(convertedSql, params);
        return formatResult(res, sql);
      },
      async beginTransaction() {
        await client.query('BEGIN');
      },
      async commit() {
        await client.query('COMMIT');
      },
      async rollback() {
        await client.query('ROLLBACK');
      },
      release() {
        client.release();
      }
    };
  }
};

async function testConnection() {
  try {
    const client = await pgPool.connect();
    const res = await client.query('SELECT current_database() as db');
    const dbName = res.rows[0]?.db || 'Supabase PostgreSQL';
    console.log(`[Supabase/PostgreSQL] Connected successfully to database: ${dbName}`);
    client.release();
    return true;
  } catch (error) {
    console.warn(`[Supabase/PostgreSQL] Warning: Could not connect to database (${error.message}).`);
    return false;
  }
}

module.exports = {
  pool,
  testConnection,
};
