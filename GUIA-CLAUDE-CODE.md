# Guía para Principiantes: Claude Code
## Aprende construyendo TierChat - Una app de mensajería por niveles de pago

---

## ¿Qué es Claude Code?

Claude Code es una herramienta de línea de comandos (CLI) que te permite programar
con la ayuda de inteligencia artificial. Vos le decís qué querés hacer y Claude lo
hace por vos: crea archivos, escribe código, ejecuta comandos, y hasta hace commits
de Git.

**No necesitás saber programar para empezar.** Claude Code te guía en cada paso.

---

## Parte 1: Comandos Esenciales de Claude Code

### 1.1 Cómo hablarle a Claude Code

Simplemente escribís en lenguaje natural. Ejemplos:

```
> Creame un archivo que diga "Hola Mundo"
> Instalame las dependencias del proyecto
> Explicame qué hace este código
> Corregí el error que aparece
```

### 1.2 Comandos Slash (atajos útiles)

| Comando | Qué hace |
|---------|----------|
| `/help` | Muestra ayuda |
| `/commit` | Crea un commit de Git con los cambios |
| `/clear` | Limpia la conversación |

### 1.3 Cómo Claude Code trabaja con archivos

- **Leer**: Claude lee cualquier archivo del proyecto automáticamente
- **Crear**: Claude puede crear archivos nuevos
- **Editar**: Claude modifica archivos existentes mostrándote los cambios
- **Buscar**: Claude busca en todo el proyecto por texto o patrones

### 1.4 Flujo de trabajo típico

```
1. Le decís a Claude qué querés hacer
2. Claude analiza el proyecto
3. Claude propone cambios (te pide permiso)
4. Vos aprobás o le pedís cambios
5. Claude ejecuta y te muestra el resultado
```

---

## Parte 2: El Proyecto - TierChat

### ¿Qué vamos a construir?

**TierChat**: Una app de mensajería donde solo podés hablar con gente que paga lo
mismo que vos.

### Niveles de pago (mensuales):
| Tier | Precio | Nombre |
|------|--------|--------|
| 🥉 | $1/mes | Bronce |
| 🥈 | $10/mes | Plata |
| 🥇 | $100/mes | Oro |
| 💎 | $1,000/mes | Diamante |
| 👑 | $10,000/mes | Elite |

### Funcionalidades:
- ✅ Registro e inicio de sesión
- ✅ Selección y pago de tier (con Stripe)
- ✅ Ver lista de personas en tu mismo tier
- ✅ Chat privado 1 a 1
- ✅ Crear grupos dentro de tu tier
- ✅ Notificaciones push
- ✅ Publicar en Google Play Store

---

## Parte 3: Estructura del Proyecto

```
tierchat/
├── app/                          # App móvil (React Native + Expo)
│   ├── src/
│   │   ├── screens/              # Pantallas
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── TierSelectionScreen.tsx
│   │   │   ├── MemberListScreen.tsx
│   │   │   ├── ChatScreen.tsx
│   │   │   ├── GroupChatScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   ├── components/           # Componentes reutilizables
│   │   │   ├── TierCard.tsx
│   │   │   ├── ChatBubble.tsx
│   │   │   ├── MemberItem.tsx
│   │   │   └── GroupItem.tsx
│   │   ├── services/             # Conexiones a APIs
│   │   │   ├── auth.ts
│   │   │   ├── chat.ts
│   │   │   ├── payments.ts
│   │   │   └── api.ts
│   │   ├── hooks/                # Hooks personalizados
│   │   │   ├── useAuth.ts
│   │   │   └── useChat.ts
│   │   ├── context/              # Estado global
│   │   │   └── AuthContext.tsx
│   │   └── utils/                # Utilidades
│   │       ├── constants.ts
│   │       └── types.ts
│   ├── app.json
│   └── package.json
│
├── backend/                      # Servidor (Node.js + Express)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── chat.js
│   │   │   ├── payments.js
│   │   │   └── groups.js
│   │   ├── models/               # Modelos de base de datos
│   │   │   ├── User.js
│   │   │   ├── Message.js
│   │   │   └── Group.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── tierCheck.js
│   │   ├── services/
│   │   │   ├── stripe.js
│   │   │   └── firebase.js
│   │   └── socket/               # Chat en tiempo real
│   │       └── chatHandler.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── docs/                         # Documentación
    ├── PASO-1-SETUP.md
    ├── PASO-2-BACKEND.md
    ├── PASO-3-APP.md
    ├── PASO-4-PAGOS.md
    ├── PASO-5-CHAT.md
    └── PASO-6-PLAY-STORE.md
```

---

## Parte 4: Paso a Paso para Construir TierChat

### PASO 1: Preparar el entorno

**Lo que le decís a Claude Code:**
```
> Inicializame un proyecto Expo con TypeScript para una app llamada TierChat
```

Claude va a:
1. Crear la carpeta del proyecto
2. Instalar Expo y React Native
3. Configurar TypeScript
4. Crear la estructura de carpetas

### PASO 2: Crear el Backend

**Lo que le decís a Claude Code:**
```
> Creame el backend con Express, MongoDB, Socket.io y Stripe
```

Claude va a:
1. Crear el servidor Express
2. Configurar la base de datos MongoDB
3. Crear los modelos (User, Message, Group)
4. Configurar Socket.io para chat en tiempo real
5. Integrar Stripe para pagos

### PASO 3: Pantallas de la App

**Lo que le decís a Claude Code:**
```
> Creame la pantalla de login con email y contraseña, que se vea moderna
```

Y así con cada pantalla. Claude crea el diseño, la lógica, y conecta todo.

### PASO 4: Integrar Pagos con Stripe

**Lo que le decís a Claude Code:**
```
> Integrá Stripe para que el usuario pueda elegir su tier y pagar mensualmente
```

Claude va a:
1. Crear los productos en Stripe
2. Implementar el checkout
3. Manejar webhooks para confirmar pagos
4. Actualizar el tier del usuario automáticamente

### PASO 5: Chat en Tiempo Real

**Lo que le decís a Claude Code:**
```
> Implementá el chat en tiempo real con Socket.io, solo entre usuarios del mismo tier
```

Claude va a:
1. Crear las salas por tier
2. Implementar mensajes privados
3. Crear funcionalidad de grupos
4. Agregar notificaciones

### PASO 6: Publicar en Play Store

**Lo que le decís a Claude Code:**
```
> Preparame la app para publicar en Google Play Store
```

Claude va a:
1. Generar el APK/AAB
2. Crear los assets (ícono, screenshots)
3. Guiarte con la cuenta de desarrollador de Google
4. Preparar la ficha de la tienda

---

## Parte 5: Tecnologías Utilizadas

| Tecnología | Para qué |
|------------|----------|
| **React Native + Expo** | App móvil multiplataforma |
| **TypeScript** | Código más seguro y claro |
| **Node.js + Express** | Servidor backend |
| **MongoDB** | Base de datos |
| **Socket.io** | Chat en tiempo real |
| **Stripe** | Procesamiento de pagos |
| **Firebase** | Notificaciones push + Auth |
| **Google Play Console** | Publicar en la tienda |

---

## Parte 6: Cuentas que Necesitás Crear

Antes de empezar, necesitás estas cuentas (todas gratuitas para empezar):

1. **Stripe** (stripe.com) - Para procesar pagos
2. **MongoDB Atlas** (mongodb.com) - Base de datos en la nube (free tier)
3. **Firebase** (firebase.google.com) - Auth y notificaciones
4. **Google Play Console** ($25 USD una vez) - Para publicar la app
5. **Expo** (expo.dev) - Para compilar la app (free tier)

---

## Parte 7: Resumen Visual del Flujo

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Usuario   │────▶│   Registro   │────▶│  Elegir     │
│   abre app  │     │   / Login    │     │  Tier       │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                │
                                    ┌───────────▼──────────┐
                                    │   Pagar con Stripe   │
                                    │   ($1/$10/$100/etc)   │
                                    └───────────┬──────────┘
                                                │
                              ┌─────────────────▼─────────────────┐
                              │     Ver miembros de tu tier       │
                              │  (solo los que pagan lo mismo)    │
                              └────────┬──────────────┬───────────┘
                                       │              │
                              ┌────────▼────┐  ┌──────▼──────┐
                              │ Chat 1 a 1  │  │ Crear Grupo │
                              │  privado    │  │  en tu tier │
                              └─────────────┘  └─────────────┘
```

---

## ¡Empecemos a construir!

La guía continúa en los archivos de código. Cada archivo tiene comentarios
explicando qué hace cada parte. Seguí leyendo los pasos en la carpeta `docs/`.
