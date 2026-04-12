# Memoria Persistente — Rodrigo Pedernera

> Este archivo se actualiza automaticamente cuando Claude aprende algo nuevo sobre las preferencias, correcciones o decisiones de Rodrigo. Se carga al inicio de cada sesion para mantener continuidad.

## Preferencias confirmadas

- Idioma: siempre espanhol
- Tono: cercano, claro, didactico
- Nivel tecnico: principiante en programacion — necesita explicaciones claras
- Accuracy-first: precision sobre velocidad
- Entregables a clientes: profesional, pulido

## Correcciones recibidas

- 2026-04-12: El nombre correcto es **UniverzIA** (con Z), no "UnivezIA". Tambien es URGENTE, no IMPORTANTE — es su proyecto propio.

## Decisiones tecnicas tomadas

- 2026-04-12: Setup inicial de CLAUDE.md, memory.md, skills/ y .claude/settings.json siguiendo el framework del video de Remy Gaskell sobre agentes de IA
- 2026-04-12: Make.com NO puede usar Gmail con cuentas @gmail.com (restricted scopes de Google). Usar N8N para automatizaciones con Gmail en su lugar

## Patrones de trabajo aprendidos

_(Se actualiza a medida que se identifican patrones)_

## Herramientas y configuraciones

- MCP conectado: Gmail, Google Calendar, Make.com, Miro, GitHub
- Proyecto principal: claudio-whatsapp-assistant (notificaciones de WhatsApp cuando llegan consultas de clientes al mail)
- Automatizacion principal: N8N + Claude API

## Notas de sesiones anteriores

- 2026-04-12: Se creo workflow N8N para briefing matutino (skills/N8N-briefing-matutino-workflow.json). Rodrigo necesita importarlo en su N8N y configurar la credencial de Gmail OAuth2. El workflow corre todos los dias a las 8 AM hora Argentina, lee mails no leidos, los clasifica por prioridad (urgente/importante/informativo) y envia un resumen por mail.
