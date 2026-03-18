# Paso 2: Entender y Configurar el Backend

## ¿Qué es el backend?
Es el "cerebro" que vive en un servidor. Se encarga de:
- Guardar los usuarios en la base de datos
- Verificar quién está logueado
- Procesar pagos
- Enviar y recibir mensajes

## Archivos importantes

### `server.js` - El punto de entrada
Acá arranca todo. Conecta a la base de datos y configura las rutas.

### `src/models/` - Los modelos de datos
Definen cómo se guarda la información:
- **User.js**: Nombre, email, contraseña (encriptada), tier, suscripción
- **Message.js**: Quién envió, a quién, contenido, fecha
- **Group.js**: Nombre, tier, miembros, último mensaje

### `src/routes/` - Las rutas de la API
Definen qué puede hacer la app:
- **auth.js**: Registro, login, perfil
- **payments.js**: Crear checkout, webhooks, cancelar
- **chat.js**: Ver miembros, enviar/recibir mensajes
- **groups.js**: Crear, unirse, salir, mensajear

### `src/middleware/` - Verificaciones
- **auth.js**: Verifica que estés logueado
- **tierCheck.js**: Verifica que tengas suscripción activa

### `src/socket/chatHandler.js` - Chat en tiempo real
Maneja Socket.io para mensajes instantáneos.

## Cómo probarlo

```bash
# Iniciar el backend
cd tierchat/backend
npm run dev

# Debería mostrar:
# ✅ Conectado a MongoDB
# 🚀 Servidor TierChat corriendo en puerto 3000
```

## Cómo le decís a Claude Code:
```
> Arrancame el backend y verificá que funciona
> Creame los productos de Stripe ejecutando el script de setup
> Probame la ruta de registro con curl
```

## Probar con curl (opcional)
```bash
# Registrar un usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","displayName":"Test"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```
