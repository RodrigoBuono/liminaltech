# Paso 5: Chat en Tiempo Real

## ¿Cómo funciona el chat?

Usamos **Socket.io**, que mantiene una conexión abierta entre la app y el
servidor. Así los mensajes llegan instantáneamente (no hay que refrescar).

### Flujo de un mensaje:

```
Usuario A escribe → Socket.io → Servidor → Socket.io → Usuario B ve el mensaje
         ↓                          ↓
    (instantáneo)            (guarda en MongoDB)
```

## Regla de oro: SOLO TU TIER

La verificación más importante de la app:

```javascript
// Antes de enviar cualquier mensaje, verificamos:
if (recipient.tier !== sender.tier) {
  // ❌ BLOQUEADO - No son del mismo tier
  return error('Solo podés chatear con personas de tu mismo tier');
}
```

Esto se verifica en:
1. El middleware `tierCheck.js` (verifica que tengas suscripción)
2. Las rutas de chat (verifica que el destinatario sea del mismo tier)
3. El socket handler (verifica en tiempo real)

## Funcionalidades del chat

### Chat Privado (1 a 1)
- Ves la lista de miembros de tu tier
- Tocás a uno → se abre el chat
- Mensajes en tiempo real
- Indicador de "está escribiendo..."
- Indicador online/offline

### Grupos
- Crear grupo (automáticamente se asigna a tu tier)
- Unirse a grupos existentes de tu tier
- Chat grupal en tiempo real
- Ver quién envió cada mensaje

## Cómo le decís a Claude Code:
```
> Agregame emojis al chat
> Que se pueda enviar imágenes
> Agregame un indicador de "mensaje leído" (doble check)
> Que suene una notificación cuando llega un mensaje
```
