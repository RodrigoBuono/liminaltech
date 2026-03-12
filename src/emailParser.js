/**
 * Extrae el nombre legible de un header "From" de email.
 *
 * Ejemplos de input:
 *   "Juan Pérez <juan@empresa.com>"  → "Juan Pérez"
 *   "juan@empresa.com"               → "juan"
 *   "<maria@cliente.com>"            → "maria"
 */
function parseClientName(message) {
  const from = message.from || '';

  // Formato: "Nombre Apellido <email@dominio.com>"
  const nameMatch = from.match(/^"?([^"<]+?)"?\s*</);
  if (nameMatch) {
    return nameMatch[1].trim();
  }

  // Solo email sin nombre: "email@dominio.com" o "<email@dominio.com>"
  const emailMatch = from.match(/<?([^@<>\s]+)@/);
  if (emailMatch) {
    // Capitalizar el username del email
    const username = emailMatch[1].replace(/[._-]/g, ' ');
    return capitalizeWords(username);
  }

  return 'Cliente';
}

function capitalizeWords(str) {
  return str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

module.exports = { parseClientName };
