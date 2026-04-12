# Skill: Resumen de Mail a WhatsApp

> SOP reutilizable. Invocar con: "Revisame los mails y mandame el resumen por WhatsApp"

## Objetivo

Revisar la bandeja de entrada de Gmail, identificar los mails importantes (especialmente consultas de clientes y oportunidades), y enviar un resumen conciso al WhatsApp de Rodrigo.

## Procedimiento

### Paso 1: Leer los mails recientes

- Usar la herramienta de Gmail (MCP) para buscar mensajes recientes (ultimas 24 horas o desde la ultima revision)
- Filtros sugeridos: `is:unread` o `newer_than:1d`
- Buscar en la bandeja de entrada principal

### Paso 2: Clasificar por prioridad

Categorizar cada mail en:

1. **URGENTE** — Consultas de clientes, oportunidades de negocio, temas de DM Clinical o AUREA Hub
2. **IMPORTANTE** — Respuestas pendientes, seguimientos, temas de UniverzIA
3. **INFORMATIVO** — Newsletters, notificaciones, actualizaciones generales
4. **IGNORAR** — Spam, promociones irrelevantes

### Paso 3: Armar el resumen

Formato del resumen:

```
RESUMEN DE MAILS — [fecha]

URGENTE (X mails):
- [Remitente]: [Asunto] — [1 linea de contexto]

IMPORTANTE (X mails):
- [Remitente]: [Asunto] — [1 linea de contexto]

INFORMATIVO (X mails):
- [Breve lista]

Total: X mails nuevos
```

### Paso 4: Enviar por WhatsApp

- Usar el sistema de notificaciones de WhatsApp del proyecto (claudio-whatsapp-assistant via Twilio)
- Destinatario: +54 9 11 6571-8894
- Mantener el mensaje conciso (WhatsApp tiene limite de caracteres)

## Notas

- Si no hay mails urgentes, enviar un mensaje corto: "Sin mails urgentes hoy. X mails informativos."
- Si hay algo que requiere accion inmediata, destacarlo al inicio del mensaje
- Este skill se puede programar como tarea automatica diaria (ver Make.com)
