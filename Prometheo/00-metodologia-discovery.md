# Metodologia Discovery Etapa 1 — Prometheo CRM + Agente IA

## Objetivo General

Recopilar informacion critica del cliente para configurar el Agente IA de Prometheo
de forma personalizada por rubro, alineando la atencion automatizada con los KPIs
de negocio que realmente importan.

---

## Rubros Cubiertos

| # | Rubro | Template |
|---|-------|----------|
| 1 | Desarrollista Inmobiliario | `templates/01-desarrollista-inmobiliario.md` |
| 2 | Inmobiliaria | `templates/02-inmobiliaria.md` |
| 3 | Mobiliario | `templates/03-mobiliario.md` |
| 4 | Insumos y Materiales de Construccion | `templates/04-insumos-materiales.md` |

---

## Etapas del Proceso Discovery

### ETAPA 1 — Relevamiento Inicial (Esta metodologia)
**Duracion estimada:** 1 sesion de 45-60 min por cliente
**Formato:** Entrevista semiestructurada (presencial, videollamada o formulario)

**Fases de la entrevista:**

1. **Contexto del Negocio** — Entender el modelo de negocio, tamano, mercado
2. **Proceso de Ventas Actual** — Mapear el funnel existente, desde lead hasta cierre
3. **Atencion al Cliente Actual** — Canales, tiempos de respuesta, cuellos de botella
4. **Consultas Frecuentes (FAQs)** — Que preguntan los leads, con que frecuencia
5. **Calificacion de Leads** — Criterios actuales, como distinguen lead caliente de frio
6. **Dolores y Expectativas** — Que quieren resolver, que resultado esperan
7. **KPIs y Metricas** — Que miden hoy, que deberian medir

### ETAPA 2 — Configuracion del Agente (Siguiente paso)
- Mapeo de datos de Etapa 1 a parametros del Agente IA
- Definicion de flujos conversacionales por rubro
- Configuracion de reglas de calificacion de leads
- Setup de KPIs en dashboard

### ETAPA 3 — Validacion y Ajuste
- Testing del Agente con casos reales
- Ajuste de respuestas y flujos
- Calibracion de scoring de leads
- Go-live supervisado

---

## Accesos Necesarios para Ejecutar el Discovery

| Acceso | Para que | Quien lo da |
|--------|----------|-------------|
| Contacto del decision-maker del cliente | Agendar la entrevista | Equipo comercial Prometheo |
| Acceso a WhatsApp Business del cliente (lectura) | Analizar conversaciones reales con leads | Cliente |
| Acceso a CRM actual o planilla de ventas | Entender funnel actual y metricas | Cliente |
| Catalogo/brochure de productos/proyectos | Entrenar al Agente con info real | Cliente |
| Lista de precios o rangos de precios | Configurar respuestas del Agente | Cliente |
| FAQs existentes o base de conocimiento | Alimentar al Agente | Cliente |
| Metricas de marketing (Meta Ads, Google Ads) | Entender volumen y costo de leads | Cliente / Agencia |
| Acceso a la cuenta Prometheo del cliente | Configurar el Agente post-discovery | Equipo Prometheo |

---

## Proceso Paso a Paso

```
PASO 1: Pre-Entrevista
  ├── Identificar rubro del cliente
  ├── Seleccionar template correspondiente
  ├── Solicitar accesos previos (catalogo, precios, FAQs)
  └── Agendar sesion de 60 min

PASO 2: Entrevista Discovery
  ├── Ejecutar template de entrevista (7 secciones)
  ├── Grabar la sesion (con permiso)
  ├── Tomar notas en el template
  └── Identificar quick wins

PASO 3: Procesamiento de Datos
  ├── Completar el mapeo de KPIs (ver kpi-mapping/)
  ├── Clasificar consultas por tipo y frecuencia
  ├── Definir criterios de calificacion de leads
  └── Priorizar flujos conversacionales

PASO 4: Documento de Configuracion
  ├── Generar spec de configuracion del Agente
  ├── Definir mensajes, tonos y personalidad
  ├── Establecer reglas de escalamiento a humano
  └── Validar con el cliente antes de implementar

PASO 5: Handoff a Configuracion (Etapa 2)
  ├── Entregar spec al equipo de implementacion
  ├── Configurar Agente en Prometheo
  ├── Cargar base de conocimiento
  └── Activar KPIs en dashboard
```

---

## Relacion Discovery → Agente IA

```
ENTREVISTA                    CONFIGURACION AGENTE
─────────────                 ─────────────────────
Contexto Negocio          →   Personalidad y tono del Agente
Proceso de Ventas         →   Flujos conversacionales
Atencion Actual           →   Reglas de escalamiento
FAQs                      →   Base de conocimiento
Calificacion de Leads     →   Scoring automatico
Dolores y Expectativas    →   Metricas de exito
KPIs                      →   Dashboard y reportes
```

---

## Archivos de este Discovery

```
discovery/
├── 00-metodologia-discovery.md          ← Este archivo
├── templates/
│   ├── 01-desarrollista-inmobiliario.md ← Entrevista tipo
│   ├── 02-inmobiliaria.md               ← Entrevista tipo
│   ├── 03-mobiliario.md                 ← Entrevista tipo
│   └── 04-insumos-materiales.md         ← Entrevista tipo
└── kpi-mapping/
    └── kpi-agent-mapping.md             ← Mapeo KPI → Config Agente
```
