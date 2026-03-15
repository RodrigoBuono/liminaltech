# Mapeo KPIs Discovery → Configuracion del Agente IA Prometheo

## Objetivo

Este documento traduce los insights recopilados en la Entrevista Discovery (Etapa 1)
a parametros concretos de configuracion del Agente IA en Prometheo.
Es el puente entre lo que el cliente necesita y lo que se configura en la plataforma.

---

## 1. Mapeo Universal (Aplica a Todos los Rubros)

### 1.1 Personalidad del Agente

| Dato del Discovery | Parametro del Agente | Opciones |
|-------------------|---------------------|----------|
| Tono de la empresa | `agent.personality.tone` | formal / profesional / amigable / casual |
| Tipo de cliente (B2B/B2C) | `agent.personality.register` | tecnico / comercial / coloquial |
| Nombre comercial del Agente | `agent.personality.name` | Ej: "Sol" (inmobiliaria), "Marcos" (corralon) |
| Idioma y regionalismo | `agent.personality.locale` | es-AR / es-MX / es-CO / etc |
| Uso de emojis | `agent.personality.emojis` | si / no / moderado |

### 1.2 Base de Conocimiento

| Dato del Discovery | Parametro del Agente | Fuente |
|-------------------|---------------------|--------|
| FAQs del cliente | `agent.knowledge.faqs` | Seccion 4 de la entrevista |
| Catalogo/productos | `agent.knowledge.catalog` | Documentos del cliente |
| Precios y listas | `agent.knowledge.pricing` | Lista de precios actualizada |
| Info de la empresa | `agent.knowledge.company` | Web, brochure, redes |
| Politicas (devolucion, garantia) | `agent.knowledge.policies` | Documentos internos |

### 1.3 Reglas de Escalamiento

| Dato del Discovery | Parametro del Agente | Logica |
|-------------------|---------------------|--------|
| Temas solo para humanos | `agent.escalation.topics` | Lista de topics → derivar |
| Tiempo max sin resolver | `agent.escalation.timeout` | Ej: 3 min sin respuesta satisfactoria |
| Lead calificado detectado | `agent.escalation.qualified_lead` | Score >= umbral → notificar |
| Horario de escalamiento | `agent.escalation.schedule` | Horario humano disponible |
| A quien escalar | `agent.escalation.assignee` | Vendedor, gerente, area |

### 1.4 Calificacion de Leads (Scoring)

| Dato del Discovery | Parametro del Agente | Peso |
|-------------------|---------------------|------|
| Datos de contacto completos | `agent.scoring.contact_info` | +20 pts |
| Presupuesto declarado | `agent.scoring.budget` | +15 pts |
| Urgencia/plazo | `agent.scoring.urgency` | +15 pts |
| Producto especifico identificado | `agent.scoring.product_match` | +10 pts |
| Tipo de comprador (B2B) | `agent.scoring.buyer_type` | +20 pts |
| Interaccion profunda (muchas preguntas) | `agent.scoring.engagement` | +10 pts |
| Solicito contacto humano | `agent.scoring.human_request` | +10 pts |

**Umbral de calificacion:** Score >= 60 → Lead calificado → Escalar

---

## 2. Mapeo por Rubro

### 2.1 Desarrollista Inmobiliario

| KPI del Negocio | KPI del Agente | Config Especifica |
|----------------|---------------|-------------------|
| Conversion consulta → visita a showroom | % visitas agendadas por Agente | Flujo de agendamiento de visita |
| Tiempo de respuesta a lead | Tiempo 1ra respuesta del Agente | Objetivo: <30 seg |
| Consultas sobre financiacion | % consultas de financiacion resueltas | Base de conocimiento: planes de pago |
| Leads de inversores vs usuarios finales | Clasificacion automatica | Pregunta filtro: "¿buscas para invertir o para vivir?" |
| Disponibilidad de unidades | Precision de info de stock | Sync de disponibilidad de unidades |
| Costo por lead calificado | Reduccion de CPL post-Agente | Tracking de leads calificados por Agente |

**Flujos conversacionales especificos:**
```
FLUJO 1: Consulta general de proyecto
  Lead pregunta → Agente presenta proyecto → Ofrece brochure/plano
  → Pregunta si inversor o usuario → Califica → Agenda visita o escala

FLUJO 2: Consulta de precios/financiacion
  Lead pregunta precio → Agente da rango → Explica planes de pago
  → Recopila datos → Califica → Escala a vendedor con contexto

FLUJO 3: Consulta de disponibilidad
  Lead pregunta unidad → Agente verifica stock → Informa estado
  → Sugiere alternativas si no hay → Agenda visita
```

---

### 2.2 Inmobiliaria

| KPI del Negocio | KPI del Agente | Config Especifica |
|----------------|---------------|-------------------|
| Conversion consulta → visita | Visitas agendadas por Agente | Integracion calendario de visitas |
| Conversion separada venta/alquiler | Metricas por tipo de operacion | Flujos diferenciados |
| Leads desde portales | Tiempo respuesta a consulta de portal | <1 min post-notificacion |
| Propiedades mas consultadas | Ranking de propiedades por consulta | Reporte semanal |
| No-shows en visitas | Recordatorios enviados por Agente | Follow-up automatico pre-visita |
| Leads asignados a corredores | Distribucion automatica | Reglas por zona/tipo |

**Flujos conversacionales especificos:**
```
FLUJO 1: Consulta de propiedad especifica (desde portal)
  Lead consulta por aviso → Agente confirma disponibilidad
  → Da info adicional → Califica → Agenda visita

FLUJO 2: Busqueda asistida (lead sin propiedad definida)
  Lead dice que busca → Agente pregunta: compra/alquiler, zona, ambientes,
  presupuesto → Sugiere propiedades → Califica → Agenda visita

FLUJO 3: Consulta de alquiler (requisitos)
  Lead pregunta por alquiler → Agente informa requisitos de garantia
  → Verifica si cumple → Califica → Escala a corredor

FLUJO 4: Seguimiento post-visita
  Despues de visita → Agente pregunta como fue → Recopila feedback
  → Si interesado → Escala para oferta
```

---

### 2.3 Mobiliario

| KPI del Negocio | KPI del Agente | Config Especifica |
|----------------|---------------|-------------------|
| Conversion consulta → cotizacion | Cotizaciones auto-generadas | Motor de cotizacion con catalogo |
| Conversion cotizacion → venta | Follow-up automatico post-cotizacion | Secuencia de seguimiento |
| Ticket promedio | Upselling/cross-selling del Agente | Sugerencias de productos complementarios |
| Consultas de Instagram | Respuestas en DM | Integracion Instagram |
| Tiempo de respuesta en ML | Auto-respuesta en Mercado Libre | Integracion marketplace |
| Pedidos de muebles a medida | Recopilacion de medidas por Agente | Formulario guiado de medidas |

**Flujos conversacionales especificos:**
```
FLUJO 1: Consulta de producto estandar
  Lead pregunta → Agente da precio + stock + colores
  → Informa envio + formas de pago → Cierra venta o escala

FLUJO 2: Consulta de mueble a medida
  Lead pide personalizado → Agente recopila: tipo, medidas, material,
  color, presupuesto → Escala a disenador/vendedor con brief completo

FLUJO 3: Consulta post-venta
  Cliente pregunta por pedido → Agente da estado de entrega
  → Si reclamo → Escala a soporte con detalle

FLUJO 4: Proyecto de amoblamiento completo
  Lead quiere amueblar espacio → Agente detecta oportunidad grande
  → Recopila info del proyecto → Escala como lead VIP
```

---

### 2.4 Insumos y Materiales de Construccion

| KPI del Negocio | KPI del Agente | Config Especifica |
|----------------|---------------|-------------------|
| Tiempo de respuesta a consulta de precio | Auto-respuesta de precio | Base de precios actualizable |
| Cotizaciones de listas de materiales | Listas procesadas por Agente | Parseo de listas + cotizacion |
| Conversion cotizacion → pedido | Confirmacion de pedido via Agente | Flujo de confirmacion |
| Clientes nuevos vs recurrentes | Deteccion automatica de recurrentes | Historial de cliente |
| Precision de precios informados | % precios correctos | Validacion contra lista vigente |
| Facturacion por canal | Ventas originadas por Agente | Tracking end-to-end |

**Flujos conversacionales especificos:**
```
FLUJO 1: Consulta de precio unitario
  Lead pregunta precio → Agente responde con precio actualizado
  → Informa stock → Ofrece envio → Cierra o escala

FLUJO 2: Cotizacion de lista de materiales
  Lead envia lista (texto o foto) → Agente parsea items
  → Busca precios → Genera presupuesto → Envia cotizacion
  → Confirma o ajusta → Escala para cerrar

FLUJO 3: Cliente recurrente / cuenta corriente
  Cliente conocido consulta → Agente identifica historial
  → Aplica condiciones de cuenta → Procesa pedido
  → Confirma entrega

FLUJO 4: Deteccion de cliente de obra grande
  Lead consulta volumen alto → Agente detecta oportunidad
  → Recopila datos de obra → Escala a vendedor senior / gerente
```

---

## 3. Matriz de Prioridad de Configuracion

### Quick Wins por Rubro (Primeros 7 dias)

| Rubro | Quick Win #1 | Quick Win #2 | Quick Win #3 |
|-------|-------------|-------------|-------------|
| Desarrollista | Responder consultas de proyecto 24/7 | Agenda de visitas automatica | Calificacion inversor vs usuario |
| Inmobiliaria | Confirmar disponibilidad al instante | Agendar visitas automaticamente | Derivar a corredor correcto |
| Mobiliario | Responder precio + stock al instante | Enviar catalogo automatico | Cotizacion de productos estandar |
| Insumos/Materiales | Auto-responder precios | Procesar listas de materiales | Detectar clientes de obra |

### Configuracion Completa (30 dias)

| Semana | Actividad |
|--------|-----------|
| Semana 1 | Quick wins + base de conocimiento basica + FAQs |
| Semana 2 | Flujos conversacionales completos + scoring de leads |
| Semana 3 | Integraciones (portales, calendario, stock) + reglas de escalamiento |
| Semana 4 | Dashboard de KPIs + alertas + fine-tuning basado en datos reales |

---

## 4. Template de Spec de Configuracion (Output de Etapa 1)

Despues de completar la entrevista y este mapeo, generar este documento:

```
SPEC DE CONFIGURACION — [NOMBRE DEL CLIENTE]
=============================================

RUBRO: [desarrollista / inmobiliaria / mobiliario / materiales]
FECHA: [fecha]
RESPONSABLE: [nombre]

1. PERSONALIDAD DEL AGENTE
   - Nombre: ___
   - Tono: ___
   - Idioma/region: ___

2. BASE DE CONOCIMIENTO
   - FAQs cargadas: ___
   - Catalogo: ___
   - Precios: ___
   - Documentos adicionales: ___

3. FLUJOS ACTIVOS
   - Flujo 1: ___
   - Flujo 2: ___
   - Flujo 3: ___

4. SCORING DE LEADS
   - Criterios: ___
   - Umbral de calificacion: ___
   - Accion al calificar: ___

5. REGLAS DE ESCALAMIENTO
   - Escalar cuando: ___
   - Escalar a quien: ___
   - En que horario: ___

6. KPIs A MEDIR
   - KPI 1: ___ (objetivo: ___)
   - KPI 2: ___ (objetivo: ___)
   - KPI 3: ___ (objetivo: ___)

7. INTEGRACIONES REQUERIDAS
   - WhatsApp: si/no
   - Instagram: si/no
   - Portales: si/no (cuales)
   - E-commerce: si/no
   - Calendario: si/no
   - Stock/ERP: si/no
```

---

## 5. Checklist Pre-Configuracion

Antes de pasar a Etapa 2, verificar:

- [ ] Entrevista completada y documentada
- [ ] FAQs recopiladas y validadas
- [ ] Catalogo/lista de precios recibida
- [ ] Criterios de scoring definidos
- [ ] Reglas de escalamiento acordadas
- [ ] KPIs objetivo establecidos con valores numericos
- [ ] Spec de configuracion aprobada por el cliente
- [ ] Accesos a la cuenta Prometheo del cliente
