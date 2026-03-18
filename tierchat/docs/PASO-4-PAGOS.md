# Paso 4: Configurar Pagos con Stripe

## ¿Cómo funcionan los pagos?

1. El usuario elige un tier ($1, $10, $100, $1000, $10000)
2. Se abre Stripe Checkout (una página segura de Stripe)
3. El usuario pone su tarjeta de crédito
4. Stripe procesa el pago
5. Stripe nos avisa (webhook) que el pago fue exitoso
6. Activamos la suscripción del usuario
7. El usuario ya puede chatear con gente de su tier

## Configurar Stripe

### 1. Crear cuenta en Stripe
- Andá a https://stripe.com
- Creá una cuenta (es gratis para probar)

### 2. Obtener tus API Keys
- Andá a Developers > API Keys
- Copiá la **Secret Key** (empieza con `sk_test_...`)
- Pegala en tu `.env` como `STRIPE_SECRET_KEY`

### 3. Crear los productos (una sola vez)
```bash
cd tierchat/backend

# Ejecutar el script que crea los productos
node -e "
  require('dotenv').config();
  const { setupStripeProducts } = require('./src/services/stripe');
  setupStripeProducts().then(() => process.exit(0));
"
```

Esto va a imprimir los Price IDs. Copialos al `.env`:
```
STRIPE_PRICE_BRONCE=price_xxxxx
STRIPE_PRICE_PLATA=price_xxxxx
STRIPE_PRICE_ORO=price_xxxxx
STRIPE_PRICE_DIAMANTE=price_xxxxx
STRIPE_PRICE_ELITE=price_xxxxx
```

### 4. Configurar Webhooks
- En Stripe Dashboard > Developers > Webhooks
- Agregá un endpoint: `https://tu-servidor.com/api/payments/webhook`
- Seleccioná estos eventos:
  - `checkout.session.completed`
  - `invoice.paid`
  - `invoice.payment_failed`
  - `customer.subscription.deleted`
- Copiá el Webhook Secret al `.env`

### 5. Para probar sin tarjeta real
Stripe tiene tarjetas de prueba:
- **Pago exitoso**: `4242 4242 4242 4242`
- **Pago rechazado**: `4000 0000 0000 0002`
- Cualquier fecha futura y cualquier CVC

## Cómo le decís a Claude Code:
```
> Configurame Stripe con los productos de TierChat
> Probame el flujo de pago con la tarjeta de test
> Mostrá los logs cuando llega un webhook
```
