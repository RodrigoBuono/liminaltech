require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { GmailClient } = require('./src/gmail');
const { sendWhatsAppNotification } = require('./src/whatsapp');
const { parseClientName } = require('./src/emailParser');

const STATE_FILE = path.join(__dirname, '.last_checked');
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS) || 60_000;

// ─── Estado ────────────────────────────────────────────────────────────────

function getLastCheckedTime() {
  try {
    return parseInt(fs.readFileSync(STATE_FILE, 'utf8').trim(), 10);
  } catch {
    // Primera vez que corre: revisa desde hace 2 minutos para no perder nada
    return Date.now() - 2 * 60_000;
  }
}

function saveLastCheckedTime(timestamp) {
  fs.writeFileSync(STATE_FILE, String(timestamp));
}

// ─── Ciclo principal ────────────────────────────────────────────────────────

async function checkNewEmails(gmail) {
  const lastChecked = getLastCheckedTime();
  const now = Date.now();

  console.log(`\n[${new Date().toLocaleTimeString('es-AR')}] Revisando Gmail...`);

  try {
    const messages = await gmail.getNewMessages(lastChecked);

    if (messages.length === 0) {
      console.log('  Sin consultas nuevas.');
    }

    for (const message of messages) {
      const clientName = parseClientName(message);
      console.log(`  📩 Nueva consulta de: ${clientName} — "${message.subject}"`);
      await sendWhatsAppNotification(clientName, message.subject, message.date);
    }

    saveLastCheckedTime(now);
  } catch (error) {
    console.error(`  ⚠️  Error: ${error.message}`);
    // No actualizamos el timestamp para reintentar en el siguiente ciclo
  }
}

// ─── Inicio ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║    🤖 Claudio — Asistente Personal     ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');

  // Validar variables de entorno obligatorias
  const required = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REFRESH_TOKEN',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_WHATSAPP_FROM',
    'MY_WHATSAPP_NUMBER',
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error('❌ Faltan variables de entorno obligatorias:');
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error('\n👉 Copiá .env.example a .env y completá los valores.');
    process.exit(1);
  }

  const gmail = new GmailClient();
  await gmail.initialize();

  console.log(`📡 Monitoreando: ${process.env.GMAIL_USER}`);
  console.log(`⏱️  Revisando cada ${POLL_INTERVAL_MS / 1000}s`);
  console.log(`📲 Enviando a: ${process.env.MY_WHATSAPP_NUMBER}`);
  console.log('');

  // Primera revisión inmediata
  await checkNewEmails(gmail);

  // Polling periódico
  setInterval(() => checkNewEmails(gmail), POLL_INTERVAL_MS);
}

main().catch((err) => {
  console.error('💥 Error fatal:', err.message);
  process.exit(1);
});
