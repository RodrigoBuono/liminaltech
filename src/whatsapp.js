const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Formatea y envía un mensaje de WhatsApp cuando llega una consulta nueva.
 *
 * @param {string} clientName  - Nombre del cliente que escribió
 * @param {string} subject     - Asunto del email
 * @param {Date}   date        - Fecha/hora del email
 */
async function sendWhatsAppNotification(clientName, subject, date) {
  const hora = date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  });

  const fechaCorta = date.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Argentina/Buenos_Aires',
  });

  const mensaje =
    `🔔 *¡Nueva consulta recibida!*\n\n` +
    `👤 *Cliente:* ${clientName}\n` +
    `📧 *Asunto:* ${subject}\n` +
    `🕐 *Hora:* ${hora} · ${fechaCorta}\n\n` +
    `📬 Revisá tu bandeja para responder.\n` +
    `_— Claudio, tu asistente_`;

  try {
    const result = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: process.env.MY_WHATSAPP_NUMBER,
      body: mensaje,
    });

    console.log(`📲 WhatsApp enviado (SID: ${result.sid})`);
    return result;
  } catch (error) {
    console.error(`❌ Error al enviar WhatsApp: ${error.message}`);
    throw error;
  }
}

module.exports = { sendWhatsAppNotification };
