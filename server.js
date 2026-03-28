require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const { google } = require('googleapis');
const { v4: uuidv4 } = require('uuid');
const db = require('./src/db');
const BotManager = require('./src/botManager');

const app = express();
const PORT = process.env.PORT || 3000;

const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
const REDIRECT_URI = `${APP_URL}/auth/callback`;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'claudio-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 }
}));

// ─── OAuth helpers ────────────────────────────────────────────────────────────

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );
}

// ─── Páginas HTML ────────────────────────────────────────────────────────────

app.get('/setup', (req, res) => res.sendFile(path.join(__dirname, 'public', 'setup.html')));
app.get('/listo', (req, res) => res.sendFile(path.join(__dirname, 'public', 'listo.html')));

// ─── Rutas de setup ──────────────────────────────────────────────────────────

app.post('/setup/start', (req, res) => {
  const { whatsapp, twilio_sid, twilio_token, keywords } = req.body;

  if (!whatsapp || !twilio_sid || !twilio_token) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  req.session.setup = {
    whatsapp: whatsapp.trim(),
    twilio_sid: twilio_sid.trim(),
    twilio_token: twilio_token.trim(),
    keywords: keywords || 'consulta,cotización,pregunta,info,quiero,necesito'
  };

  const oauth2Client = getOAuthClient();
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    prompt: 'consent'
  });

  res.json({ authUrl });
});

app.get('/auth/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect('/setup?error=cancelado');
  }

  if (!req.session.setup) {
    return res.redirect('/setup?error=sesion_expirada');
  }

  try {
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const gmailAddress = profile.data.emailAddress;

    const userId = uuidv4();
    const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    await db.query(
      `INSERT INTO users (id, access_code, gmail_address, whatsapp_number, twilio_sid, twilio_token, refresh_token, keywords, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)`,
      [userId, accessCode, gmailAddress, req.session.setup.whatsapp,
       req.session.setup.twilio_sid, req.session.setup.twilio_token,
       tokens.refresh_token, req.session.setup.keywords]
    );

    req.session.setup = null;

    await BotManager.startUser(userId);

    res.redirect(`/listo?code=${accessCode}&gmail=${gmailAddress}`);
  } catch (err) {
    console.error('Error en OAuth callback:', err.message);
    res.redirect('/setup?error=gmail_fallido');
  }
});

// ─── API ─────────────────────────────────────────────────────────────────────

app.get('/api/status/:code', async (req, res) => {
  const result = await db.query(
    'SELECT gmail_address, whatsapp_number, is_active, created_at FROM users WHERE access_code = $1',
    [req.params.code]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
  res.json(result.rows[0]);
});

app.post('/api/pause/:code', async (req, res) => {
  await db.query('UPDATE users SET is_active = NOT is_active WHERE access_code = $1', [req.params.code]);
  await BotManager.reload();
  res.json({ ok: true });
});

// ─── Inicio ──────────────────────────────────────────────────────────────────

async function main() {
  await db.init();
  await BotManager.startAll();

  app.listen(PORT, () => {
    console.log(`\n🌐 Claudio Web corriendo en ${APP_URL}`);
    console.log(`📡 Bot manager activo para todos los usuarios\n`);
  });
}

main().catch(err => {
  console.error('Error fatal:', err.message);
  process.exit(1);
});
