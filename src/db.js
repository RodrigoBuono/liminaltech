const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      access_code VARCHAR(10) UNIQUE NOT NULL,
      gmail_address VARCHAR(100) NOT NULL,
      whatsapp_number VARCHAR(30) NOT NULL,
      twilio_sid VARCHAR(50) NOT NULL,
      twilio_token VARCHAR(50) NOT NULL,
      refresh_token TEXT NOT NULL,
      keywords TEXT DEFAULT 'consulta,cotización,pregunta,info,quiero,necesito',
      is_active BOOLEAN DEFAULT true,
      last_checked BIGINT DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('✅ Base de datos lista');
}

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = { init, query };
