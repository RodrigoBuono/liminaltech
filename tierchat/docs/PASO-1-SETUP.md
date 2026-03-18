# Paso 1: Configurar el Entorno

## Lo que necesitás instalar

### 1. Node.js (el motor de JavaScript)
```bash
# Verificar si ya lo tenés:
node --version

# Si no lo tenés, descargalo de: https://nodejs.org
# Elegí la versión LTS (Long Term Support)
```

### 2. Expo CLI (para la app móvil)
```bash
npm install -g expo-cli
npm install -g eas-cli
```

### 3. MongoDB (base de datos)
- Andá a https://mongodb.com/atlas
- Creá una cuenta gratis
- Creá un cluster gratuito (M0 Free)
- Obtené tu connection string (se ve así: `mongodb+srv://...`)

### 4. Stripe (pagos)
- Andá a https://stripe.com
- Creá una cuenta
- Andá a Developers > API Keys
- Copiá tu Secret Key (empieza con `sk_test_...`)

## Cómo le decís a Claude Code que haga esto:

```
> Instalame Node.js y verificá que está bien instalado
> Instalame expo-cli y eas-cli globalmente
> Configurame el proyecto backend con las dependencias
> Configurame el proyecto app con Expo
```

## Configurar el Backend

```bash
# 1. Ir a la carpeta del backend
cd tierchat/backend

# 2. Instalar dependencias
npm install

# 3. Copiar el archivo de configuración
cp .env.example .env

# 4. Editar .env con tus datos reales
# (MongoDB URI, Stripe keys, JWT secret)
```

## Configurar la App

```bash
# 1. Ir a la carpeta de la app
cd tierchat/app

# 2. Instalar dependencias
npm install

# 3. Verificar que funciona
npx expo start
```

## Verificación
Si todo está bien, deberías poder:
- Ejecutar `node --version` y ver un número
- Ejecutar `npx expo --version` y ver un número
- Tener tu MongoDB URI y Stripe keys listos
