const { google } = require('googleapis');

class GmailClient {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/callback'
    );

    this.oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  async initialize() {
    try {
      const profile = await this.gmail.users.getProfile({ userId: 'me' });
      console.log(`✅ Gmail conectado: ${profile.data.emailAddress}`);
    } catch (error) {
      throw new Error(
        `No se pudo conectar a Gmail. Verifica tus credenciales.\nDetalle: ${error.message}`
      );
    }
  }

  /**
   * Busca mensajes nuevos recibidos después del timestamp dado.
   * Retorna un array de objetos con la info del email.
   */
  async getNewMessages(sinceTimestampMs) {
    const sinceSeconds = Math.floor(sinceTimestampMs / 1000);

    // Construir query de búsqueda
    let query = `in:inbox after:${sinceSeconds}`;

    // Filtrar por palabras clave en asunto (si están configuradas)
    const keywords = process.env.SUBJECT_KEYWORDS
      ? process.env.SUBJECT_KEYWORDS.split(',').map((k) => k.trim()).filter(Boolean)
      : [];

    if (keywords.length > 0) {
      const keywordQuery = keywords.map((k) => `subject:${k}`).join(' OR ');
      query += ` (${keywordQuery})`;
    }

    const response = await this.gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 20,
    });

    const messages = response.data.messages || [];
    if (messages.length === 0) return [];

    const parsed = [];
    for (const msg of messages) {
      const full = await this.gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'metadata',
        metadataHeaders: ['From', 'Subject', 'Date'],
      });

      const headers = full.data.payload.headers;
      const from = this.getHeader(headers, 'From') || '';
      const subject = this.getHeader(headers, 'Subject') || '(sin asunto)';
      const date = this.getHeader(headers, 'Date') || new Date().toISOString();

      // Ignorar remitentes en la lista de exclusión
      const ignoreList = process.env.IGNORE_FROM
        ? process.env.IGNORE_FROM.split(',').map((i) => i.trim().toLowerCase())
        : [];

      const fromLower = from.toLowerCase();
      const shouldIgnore = ignoreList.some((term) => fromLower.includes(term));
      if (shouldIgnore) continue;

      parsed.push({
        id: msg.id,
        from,
        subject,
        date: new Date(date),
      });
    }

    return parsed;
  }

  getHeader(headers, name) {
    const header = headers.find(
      (h) => h.name.toLowerCase() === name.toLowerCase()
    );
    return header ? header.value : null;
  }
}

module.exports = { GmailClient };
