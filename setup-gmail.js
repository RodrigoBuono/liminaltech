/**
 * Script de configuración inicial para obtener el Refresh Token de Gmail.
 * Corré una sola vez con: npm run setup
 */
require('dotenv').config();

const { google } = require('googleapis');
const readline = require('readline');

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

async function main() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('❌ GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET deben estar en el .env');
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'urn:ietf:wg:oauth:2.0:oob'
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
  console.log('2. Iniciá sesión con rodri.epb@gmail.com');
  console.log('3. Aceptá los permisos');
  console.log('4. Copiá el código que te da Google');
  console.log('');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Pegá el código aquí: ', async (code) => {
    rl.close();
    try {
      const { tokens } = await oauth2Client.getToken(code.trim());
      console.log('');
      console.log('✅ ¡Éxito! Copiá esta línea en tu archivo .env:');
      console.log('');
      console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
      console.log('');
      console.log('Después de agregarlo al .env, corré: npm start');
    } catch (error) {
      console.error('❌ Error al obtener el token:', error.message);
    }
  });
}

main();
