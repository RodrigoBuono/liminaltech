# Paso 3: Entender la App Móvil

## ¿Cómo funciona la app?

La app está hecha con **React Native** (la misma tecnología que usan
Instagram, Facebook, Discord). Usamos **Expo** que simplifica mucho el proceso.

## Flujo de pantallas

```
App se abre
    │
    ├─ No logueado → LoginScreen → RegisterScreen
    │
    ├─ Logueado sin tier → TierSelectionScreen (elegir plan)
    │
    └─ Logueado con tier → MainTabs
                              ├── Miembros (MemberListScreen)
                              ├── Chats (ConversationsScreen)
                              ├── Grupos (GroupsScreen)
                              └── Perfil (ProfileScreen)
                                     │
                                     ├── Chat privado (ChatScreen)
                                     └── Chat grupal (GroupChatScreen)
```

## Archivos de la app

### Pantallas (`src/screens/`)
- **LoginScreen.tsx**: Email + contraseña + botón login
- **RegisterScreen.tsx**: Nombre + email + contraseña + crear cuenta
- **TierSelectionScreen.tsx**: 5 tarjetas con los tiers y precios
- **MemberListScreen.tsx**: Lista de personas de tu tier
- **ConversationsScreen.tsx**: Lista de chats activos
- **ChatScreen.tsx**: Chat 1 a 1 con burbujas de mensaje
- **GroupsScreen.tsx**: Lista de grupos + crear grupo
- **GroupChatScreen.tsx**: Chat grupal
- **ProfileScreen.tsx**: Tu perfil + tier + cerrar sesión

### Componentes (`src/components/`)
- **ChatBubble.tsx**: Burbuja de mensaje (como WhatsApp)
- **MemberItem.tsx**: Un miembro en la lista
- **TierCard.tsx**: Tarjeta de un tier
- **GroupItem.tsx**: Un grupo en la lista

### Servicios (`src/services/`)
- **api.ts**: Configuración de axios (hace las peticiones HTTP)
- **auth.ts**: Funciones de login/registro
- **chat.ts**: Funciones de mensajes y grupos
- **payments.ts**: Funciones de pago

## Cómo probar la app

```bash
cd tierchat/app

# Instalar dependencias
npm install

# Iniciar
npx expo start

# Opciones para probar:
# - Escaneá el QR con Expo Go en tu celular
# - Presioná 'a' para abrir en emulador Android
# - Presioná 'w' para abrir en el navegador
```

## Cómo le decís a Claude Code:
```
> Arrancame la app y mostrá el QR para probar en mi celular
> Cambiame el color principal a azul
> Agregame una animación al logo del login
```
