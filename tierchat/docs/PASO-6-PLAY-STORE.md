# Paso 6: Publicar en Google Play Store

## Requisitos previos

1. **Cuenta de Google Play Console** ($25 USD, pago único)
   - Andá a https://play.google.com/console
   - Registrate como desarrollador

2. **Cuenta de Expo (EAS)** (gratis)
   - Andá a https://expo.dev
   - Creá una cuenta

3. **Backend desplegado** (necesitás un servidor real)
   - Opciones gratis/baratas:
     - **Railway** (railway.app) - Gratis para empezar
     - **Render** (render.com) - Gratis para empezar
     - **Fly.io** (fly.io) - Gratis para empezar

## Paso a paso

### 1. Configurar EAS Build

```bash
cd tierchat/app

# Login en Expo
eas login

# Configurar el build
eas build:configure
```

Esto crea un archivo `eas.json`:
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### 2. Crear los assets de la app

Necesitás estos archivos en la carpeta `assets/`:
- **icon.png** (1024x1024 px) - Ícono de la app
- **splash.png** (1284x2778 px) - Pantalla de carga
- **adaptive-icon.png** (1024x1024 px) - Ícono Android

```
> Creame un ícono para TierChat con fondo oscuro y las letras TC en rojo
```

### 3. Actualizar app.json

Asegurate de que `app.json` tenga:
```json
{
  "expo": {
    "name": "TierChat",
    "android": {
      "package": "com.tuempresa.tierchat",
      "versionCode": 1
    }
  }
}
```

### 4. Compilar el APK para probar

```bash
# APK para probar en tu celular
eas build --platform android --profile preview
```

Esperá unos minutos. Expo compila en la nube y te da un link para descargar.

### 5. Compilar el AAB para Play Store

```bash
# AAB (Android App Bundle) para la tienda
eas build --platform android --profile production
```

### 6. Subir a Google Play Console

1. Andá a https://play.google.com/console
2. "Crear aplicación"
3. Completá la información:
   - **Nombre**: TierChat
   - **Descripción**: Mensajería exclusiva por niveles. Chateá con gente de tu mismo nivel de compromiso.
   - **Categoría**: Social / Comunicación
   - **Clasificación de contenido**: Completar el cuestionario
4. Subí el AAB en "Producción" > "Crear nueva versión"
5. Subí screenshots (mínimo 2)
6. Completá la política de privacidad
7. Enviá para revisión

### 7. Política de Privacidad

Necesitás una página web con tu política de privacidad. Podés usar:
- Una página simple en GitHub Pages
- Un Google Doc público
- Un link de Notion

Debe incluir:
- Qué datos recopilás (email, mensajes)
- Cómo los usás (solo para la app)
- Cómo se pueden borrar (contactando al soporte)

### 8. Ficha de la tienda

#### Título
```
TierChat - Mensajería por Niveles
```

#### Descripción corta (80 chars)
```
Chateá exclusivamente con personas que comparten tu nivel de compromiso.
```

#### Descripción larga
```
TierChat es una app de mensajería única donde solo podés hablar con
personas que pagan lo mismo que vos.

🥉 Tier Bronce ($1/mes) - Acceso básico
🥈 Tier Plata ($10/mes) - Comunidad intermedia
🥇 Tier Oro ($100/mes) - Círculo exclusivo
💎 Tier Diamante ($1,000/mes) - Red premium
👑 Tier Elite ($10,000/mes) - El círculo más exclusivo

Funcionalidades:
• Chat privado 1 a 1
• Grupos dentro de tu tier
• Mensajes en tiempo real
• Indicador de "en línea"
• Notificaciones push

¿Por qué TierChat?
Porque cuando todos invierten lo mismo, la conversación cambia.
Conectá con personas que comparten tu nivel de compromiso.
```

## Deploy del Backend

### Opción 1: Railway (recomendado para empezar)

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Crear proyecto
railway init

# Agregar MongoDB
railway add --plugin mongodb

# Desplegar
railway up
```

### Opción 2: Render

1. Andá a https://render.com
2. Conectá tu repo de GitHub
3. Creá un "Web Service"
4. Configurá las variables de entorno
5. Deploy automático

## Cómo le decís a Claude Code:

```
> Configurame EAS Build para Android
> Compilame un APK de preview para probar
> Desplegame el backend en Railway
> Preparame todos los textos para la ficha de Google Play
> Creame la política de privacidad
```

## Checklist final

- [ ] Backend desplegado y funcionando
- [ ] Stripe configurado en modo producción
- [ ] App compilada como AAB
- [ ] Cuenta de Google Play Console activa ($25)
- [ ] Ícono y screenshots creados
- [ ] Política de privacidad publicada
- [ ] Ficha de la tienda completada
- [ ] Clasificación de contenido completada
- [ ] Enviada para revisión de Google
