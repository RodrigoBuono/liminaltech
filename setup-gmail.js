/**
 * Script de configuración inicial para obtener el Refresh Token de Gmail.
 * Corré una sola vez con: npm run setup
 */
require('dotenv').config();

const { google } = require('googleapis');
const http = require('http');
const url = require('url');

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

async function main() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('❌ GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET deben estar en el .env');
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('   Configuración de Gmail — Paso único');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('1. Abrí este link en tu navegador:');
  console.log('');
  console.log('   ' + authUrl);
  console.log('');
  console.log('2. Iniciá sesión con ' + (process.env.GMAIL_USER || 'tu cuenta de Gmail'));
  console.log('3. Aceptá los permisos');
  console.log('4. Esperá — el token se guardará automáticamente');
  console.log('');
  console.log('⏳ Esperando autorización en http://localhost:' + PORT + ' ...');
  console.log('');

  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    if (parsedUrl.pathname !== '/callback') {
      res.end('Not found');
      return;
    }

    const code = parsedUrl.query.code;
    const error = parsedUrl.query.error;

    if (error) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h2>❌ Error: ' + error + '</h2><p>Cerrá esta ventana y revisá el CMD.</p>');
      console.error('❌ Error de autorización:', error);
      server.close();
      process.exit(1);
    }

    try {
      const { tokens } = await oauth2Client.getToken(code);

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <h2>✅ ¡Autorización exitosa!</h2>
        <p>Cerrá esta ventana y mirá el CMD para copiar tu GOOGLE_REFRESH_TOKEN.</p>
      `);

      console.log('✅ ¡Éxito! Agregá esta línea a tu archivo .env:');
      console.log('');
      console.log('GOOGLE_REFRESH_TOKEN=' + tokens.refresh_token);
      console.log('');
      console.log('Después corré: npm start');
      console.log('');

      server.close();
    } catch (err) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h2>❌ Error al obtener el token</h2><p>' + err.message + '</p>');
      console.error('❌ Error al obtener el token:', err.message);
      server.close();
      process.exit(1);
    }
  });

  server.listen(PORT, () => {});
}

main();
