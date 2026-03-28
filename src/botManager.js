const { google } = require('googleapis');
const twilio = require('twilio');
const db = require('./db');

const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS) || 60_000;
const intervals = new Map();

function getGmailClient(refreshToken) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/callback'
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

async function checkUser(user) {
  const gmail = getGmailClient(user.refresh_token);
  const lastChecked = user.last_checked || (Date.now() - 2 * 60_000);
  const sinceSeconds = Math.floor(lastChecked / 1000);
  const now = Date.now();

  const keywords = (user.keywords || '').split(',').map(k => k.trim()).filter(Boolean);
  let query = `in:inbox after:${sinceSeconds}`;
  if (keywords.length > 0) {
    query += ` (${keywords.map(k => `subject:${k}`).join(' OR ')})`;
  }

  try {
    const response = await gmail.users.messages.list({ userId: 'me', q: query, maxResults: 10 });
    const messages = response.data.messages || [];

    for (const msg of messages) {
      const full = await gmail.users.messages.get({
        userId: 'me', id: msg.id, format: 'metadata',
        metadataHeaders: ['From', 'Subject', 'Date']
      });
      const headers = full.data.payload.headers;
      const from = headers.find(h => h.name === 'From')?.value || '';
      const subject = headers.find(h => h.name === 'Subject')?.value || '(sin asunto)';

      const ignore = ['no-reply', 'noreply', 'newsletter', 'notifications'];
      if (ignore.some(t => from.toLowerCase().includes(t))) continue;

      const senderName = from.includes('<') ? from.split('<')[0].trim().replace(/"/g, '') : from;
      await sendWhatsApp(user, senderName, subject);
    }

    await db.query('UPDATE users SET last_checked = $1 WHERE id = $2', [now, user.id]);
  } catch (err) {
    console.error(`[${user.gmail_address}] Error: ${err.message}`);
  }
}

async function sendWhatsApp(user, senderName, subject) {
  try {
    const client = twilio(user.twilio_sid, user.twilio_token);
    const nombre = senderName || 'Alguien';
    await client.messages.create({
      from: 'whatsapp:+14155238886',
      to: user.whatsapp_number.startsWith('whatsapp:') ? user.whatsapp_number : `whatsapp:${user.whatsapp_number}`,
      body: `📩 *Nueva consulta de ${nombre}*\n\n📋 Asunto: _${subject}_\n\n_— Claudio, tu asistente_`
    });
    console.log(`[${user.gmail_address}] WhatsApp enviado a ${user.whatsapp_number}`);
  } catch (err) {
    console.error(`[${user.gmail_address}] Error WhatsApp: ${err.message}`);
  }
}

async function startUser(userId) {
  if (intervals.has(userId)) clearInterval(intervals.get(userId));

  const result = await db.query('SELECT * FROM users WHERE id = $1 AND is_active = true', [userId]);
  if (result.rows.length === 0) return;

  const user = result.rows[0];
  console.log(`▶ Bot iniciado para ${user.gmail_address}`);

  await checkUser(user);
  const interval = setInterval(async () => {
    const fresh = await db.query('SELECT * FROM users WHERE id = $1 AND is_active = true', [userId]);
    if (fresh.rows.length === 0) { clearInterval(interval); intervals.delete(userId); return; }
    await checkUser(fresh.rows[0]);
  }, POLL_INTERVAL_MS);

  intervals.set(userId, interval);
}

async function startAll() {
  const result = await db.query('SELECT * FROM users WHERE is_active = true');
  console.log(`▶ Iniciando bots para ${result.rows.length} usuarios`);
  for (const user of result.rows) {
    await startUser(user.id);
  }
}

async function reload() {
  for (const [id, interval] of intervals) {
    clearInterval(interval);
    intervals.delete(id);
  }
  await startAll();
}

module.exports = { startUser, startAll, reload };
