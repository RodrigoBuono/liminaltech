# IA Weekly - Newsletter Semanal de Inteligencia Artificial

## Descripción

Sistema automatizado con N8N que cada viernes:
1. Recolecta noticias de IA de 10 fuentes confiables (inglés y español)
2. Usa IA para seleccionar las 10 más relevantes y redactarlas en español
3. Genera un email con diseño tecnológico oscuro
4. Envía a todos los suscriptores activos

Incluye una landing page para que la gente se registre y un webhook que guarda los emails en Google Sheets.

---

## Estructura de archivos

```
newsletter/
├── n8n-workflows/
│   ├── ai-newsletter-semanal.json    ← Flujo principal (importar en N8N)
│   └── registro-suscriptores.json    ← Registro + desuscripción (importar en N8N)
├── templates/
│   └── newsletter-preview.html       ← Preview visual del email
├── landing/
│   └── registro.html                 ← Landing page de registro
└── CONFIGURACION.md                  ← Este archivo
```

---

## Paso a paso para configurar

### 1. Requisitos previos

- **N8N** instalado (self-hosted o N8N Cloud)
- **Cuenta de OpenAI** con API key (o Anthropic/Claude)
- **Google Sheets** (para la base de suscriptores)
- **Servidor SMTP** para enviar emails (Gmail, SendGrid, Mailgun, etc.)

### 2. Crear la hoja de Google Sheets

Creá una Google Spreadsheet con el nombre **"Newsletter IA - Suscriptores"** y una pestaña llamada **"suscriptores"** con estas columnas en la fila 1:

| email | nombre | tipo | activo | fecha_registro |
|-------|--------|------|--------|----------------|
| rodri.epb@gmail.com | Rodrigo | muestra | true | 2026-04-08 |
| test@example.com | Test | muestra | true | 2026-04-08 |

**Tipos disponibles:**
- `muestra` → emails de prueba/preview (vos y quien quieras)
- `lista` → suscriptores reales que se registraron

**Campo activo:**
- `true` → recibe el newsletter
- `false` → no recibe (desuscripto)

### 3. Configurar credenciales en N8N

Entrá a N8N → Settings → Credentials y creá:

#### a) OpenAI API
- Tipo: `OpenAI API`
- API Key: tu clave de OpenAI
- (Opcional: podés usar Anthropic/Claude cambiando el nodo de IA)

#### b) Google Sheets OAuth2
- Tipo: `Google Sheets OAuth2 API`
- Seguí el flujo de OAuth con tu cuenta de Google
- Necesita permisos de lectura/escritura en Sheets

#### c) SMTP (Email)
- Tipo: `SMTP`
- Configuración según tu proveedor:

**Gmail SMTP:**
```
Host: smtp.gmail.com
Port: 465
SSL/TLS: true
User: tu@gmail.com
Password: contraseña de aplicación (no la normal)
```

**SendGrid SMTP:**
```
Host: smtp.sendgrid.net
Port: 465
SSL/TLS: true
User: apikey
Password: tu SendGrid API key
```

### 4. Configurar variables de entorno en N8N

Entrá a N8N → Settings → Variables y creá:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `GOOGLE_SHEET_NEWSLETTER_URL` | `https://docs.google.com/spreadsheets/d/TU_ID/edit` | URL de tu Google Sheet |
| `NEWSLETTER_FROM_EMAIL` | `newsletter@tudominio.com` | Email remitente |
| `NEWSLETTER_REPLY_TO` | `contacto@tudominio.com` | Email de respuesta |
| `NEWSLETTER_ENVIAR_A` | `todos` | Ver sección "Control de envío" |

### 5. Importar los workflows en N8N

1. Ir a N8N → Workflows → Import from file
2. Importar `ai-newsletter-semanal.json`
3. Importar `registro-suscriptores.json`
4. En cada workflow, vincular las credenciales creadas en el paso 3
5. Activar ambos workflows

### 6. Configurar la landing page

Abrí el archivo `landing/registro.html` y cambiá la URL del webhook:

```javascript
// Línea ~230 del archivo
const WEBHOOK_URL = 'https://TU-INSTANCIA-N8N.com/webhook/registro-newsletter';
```

Reemplazá con la URL real de tu webhook de N8N (la ves en el nodo "Webhook - Registro" cuando lo activás).

Subí el archivo a tu web o hosting.

---

## Control de envío (a quién mandar)

La variable `NEWSLETTER_ENVIAR_A` controla a quién se envía:

| Valor | Comportamiento |
|-------|---------------|
| `muestra` | Solo envía a emails con tipo "muestra" (para probar) |
| `lista` | Solo envía a suscriptores reales |
| `todos` | Envía a todos los activos (muestra + lista) |

**Flujo recomendado:**
1. Primero configurá `NEWSLETTER_ENVIAR_A = muestra`
2. Ejecutá el workflow manualmente para probar
3. Revisá que el email llegue y se vea bien
4. Cambiá a `NEWSLETTER_ENVIAR_A = todos` y activá el trigger semanal

---

## Fuentes de noticias

### En inglés
| Fuente | Especialidad |
|--------|-------------|
| TechCrunch AI | Startups, productos, funding |
| The Verge AI | Tecnología de consumo, análisis |
| MIT Technology Review | Investigación, papers, tendencias |
| VentureBeat AI | Enterprise AI, negocios |
| Wired AI | Cultura tech, impacto social |
| Ars Technica | Análisis técnico profundo |

### En español
| Fuente | Especialidad |
|--------|-------------|
| Xataka | Tecnología general, reviews |
| Hipertextual | Ciencia y tecnología |
| Genbeta | Software, desarrollo |
| WWWhat's New | Herramientas, apps, tendencias |

### Agregar/quitar fuentes

En el workflow `ai-newsletter-semanal.json`, podés:
- **Agregar fuentes:** Duplicar un nodo RSS, cambiar la URL, y conectarlo al Merge
- **Quitar fuentes:** Eliminar el nodo RSS y su conexión

---

## Personalización

### Cambiar el día/hora de envío
En el nodo "Trigger Semanal":
- `triggerAtDay`: 1=Lun, 2=Mar, 3=Mié, 4=Jue, **5=Vie**, 6=Sáb, 0=Dom
- `triggerAtHour`: hora en formato 24h (9 = 9am)

### Cambiar el modelo de IA
En el nodo "AI - Curar y Redactar Newsletter":
- Cambiar `model` de `gpt-4o` a otro (gpt-4-turbo, etc.)
- Para usar Claude: reemplazar el nodo OpenAI por un nodo HTTP Request a la API de Anthropic

### Cambiar el estilo del email
El template HTML está dentro del nodo "Generar HTML del Newsletter".
Colores principales:
- Fondo: `#0A0A0A` (negro)
- Acento 1: `#00D4FF` (cyan)
- Acento 2: `#7B2FFF` (violeta)
- Texto: `#E0E0E0` (gris claro)

### Cambiar el tono editorial
En el nodo de IA, modificá el prompt del sistema. Actualmente usa español rioplatense profesional.

---

## Testeo rápido

1. Asegurate de tener al menos 1 email de tipo "muestra" en la hoja
2. Configurá `NEWSLETTER_ENVIAR_A = muestra`
3. Abrí el workflow principal y hacé click en "Execute Workflow" (trigger manual)
4. Revisá tu inbox

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| No llegan emails | Verificar credenciales SMTP y revisar spam |
| La IA no responde | Verificar API key de OpenAI y créditos |
| RSS no trae datos | Algunos feeds cambian URLs; verificar manualmente |
| Webhook no responde | Asegurate de que el workflow esté activado |
| Emails duplicados | El flujo de registro ya verifica duplicados |
| Google Sheets no conecta | Re-autorizar credenciales OAuth2 |
