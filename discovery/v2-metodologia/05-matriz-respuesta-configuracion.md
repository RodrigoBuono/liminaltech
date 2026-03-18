# MATRIZ RESPUESTA → CONFIGURACION

---

## Principio

Cada dato que se releva en el discovery debe tener un destino claro en la configuracion. Si un dato no impacta en ninguna configuracion, no deberia preguntarse. Si una configuracion no tiene dato de respaldo del discovery, es una decision al aire.

---

## BLOQUE 1: MODELO DE NEGOCIO

### Dato relevado: "Tipo de negocio y producto/servicio principal"
* Que significa: Define la vertical y la complejidad del catalogo
* Donde impacta:
  - Variable: `tipo_negocio`, `tipologia_macro`
  - Funnel: Determina la estructura (cuantas etapas, velocidad del ciclo)
  - Contenido del agente: Define que tipo de conocimiento necesita (proyectos, propiedades, catalogo, lista de precios)
  - KPI: Define las metricas relevantes (tickets en desarrollista ≠ tickets en corralon)

### Dato relevado: "Rango de precios / ticket promedio"
* Que significa: Nivel de decision del comprador, complejidad de la venta
* Donde impacta:
  - Variable: `ticket_promedio`, `presupuesto_rango`
  - Smart Tag: `#alta_gama`, `#volumen`, `#premium`
  - Prioridad: Ticket alto = cada lead vale mas = mayor urgencia de respuesta
  - Contenido del agente: Si el ticket es alto, el agente necesita mas profundidad y cuidado
  - Restriccion del agente: A mayor ticket, mas probable que el precio exacto requiera humano

### Dato relevado: "Perfil de cliente principal (B2B/B2C/inversor/usuario)"
* Que significa: A quien le habla el agente, que tono, que nivel de tecnicidad
* Donde impacta:
  - Variable: `perfil_comprador`, `tipo_cliente`
  - Smart Tag: `#b2b`, `#b2c`, `#inversor`, `#usuario_final`
  - Funnel: B2B suele tener etapas distintas (cotizacion formal, orden de compra)
  - Derivacion: B2B de alto volumen → vendedor senior
  - Automatizacion: B2C puede cerrarse automaticamente en algunos rubros; B2B casi nunca
  - KPI: Metricas separadas por perfil

### Dato relevado: "Zona de cobertura"
* Que significa: Donde opera, donde entrega, que mercado atiende
* Donde impacta:
  - Variable: `zona_cobertura`, `zona_entrega`
  - Contenido del agente: Debe saber decir "si/no entregamos en tu zona"
  - Derivacion: Puede asignar leads por zona a vendedores especificos
  - KPI: Conversion por zona

---

## BLOQUE 2: OPERACION COMERCIAL

### Dato relevado: "Canales por donde llegan leads"
* Que significa: Fuentes de demanda activas
* Donde impacta:
  - Variable: `canal_origen`
  - Smart Tag: canal especifico si hay diferencias de comportamiento
  - Automatizacion: Cada canal puede tener un mensaje de bienvenida distinto
  - KPI: CPL por canal, conversion por canal, volumen por canal

### Dato relevado: "Quien atiende y como se reparten los leads"
* Que significa: Estructura del equipo y reglas de asignacion
* Donde impacta:
  - Variable: `vendedor_asignado`
  - Derivacion: Reglas de routing (por zona, por tipo de operacion, round-robin, al dueño)
  - Automatizacion: El agente asigna automaticamente segun reglas
  - KPI: Leads por vendedor, conversion por vendedor

### Dato relevado: "Tiempo de primera respuesta actual"
* Que significa: La baseline contra la cual medir el impacto del agente
* Donde impacta:
  - KPI: Tiempo de primera respuesta (antes vs despues del agente)
  - Prioridad: Si hoy tardan >2h, el quick win es la respuesta inmediata
  - Automatizacion: El agente responde en <30 seg; eso solo ya genera impacto

### Dato relevado: "Horario de atencion y cobertura fuera de horario"
* Que significa: Cuando hay humanos disponibles y cuando el agente trabaja solo
* Donde impacta:
  - Automatizacion: Reglas de horario del agente (modo dia vs modo noche)
  - Derivacion: Fuera de horario → el agente atiende solo y guarda para derivar al dia siguiente
  - Smart Tag: `#fuera_horario`
  - KPI: % de consultas fuera de horario atendidas por el agente

### Dato relevado: "Consultas que quedan sin responder"
* Que significa: Perdida directa de oportunidades de venta
* Donde impacta:
  - KPI: Tasa de respuesta (antes vs despues)
  - Prioridad: Cada consulta sin responder es plata que se pierde
  - Automatizacion: El agente elimina este problema por definicion

---

## BLOQUE 3: CALIFICACION DE LEADS

### Dato relevado: "Criterios de lead calificado (explicitos e implicitos)"
* Que significa: La logica de negocio que determina prioridad
* Donde impacta:
  - Variable: `estado_calificacion`, `prioridad_lead`
  - Automatizacion: Scoring automatico del agente
  - Derivacion: Score >= umbral → escalar a humano
  - KPI: Tasa de calificacion, precision de calificacion

### Dato relevado: "Datos que necesitan del lead para considerarlo viable"
* Que significa: Que preguntas debe hacer el agente para calificar
* Donde impacta:
  - Variable: cada dato es una variable (presupuesto, urgencia, tipo de comprador, etc.)
  - Automatizacion: El agente pregunta estos datos de forma natural en la conversacion
  - Funnel: Pasar de "Nuevo" a "Calificado" requiere estos datos completos

### Dato relevado: "Objeciones mas frecuentes"
* Que significa: Los patrones de resistencia que el agente debe detectar y manejar
* Donde impacta:
  - Smart Tag: cada objecion es un tag (`#objecion_precio`, `#objecion_plazo`, etc.)
  - Contenido del agente: Necesita respuestas preparadas para cada objecion
  - KPI: Frecuencia de objeciones por tipo, conversion post-objecion
  - Derivacion: Ciertas objeciones requieren humano (negociacion de precio)

### Dato relevado: "Tipos de compradores distintos"
* Que significa: Segmentos con comportamiento y necesidades diferentes
* Donde impacta:
  - Variable: `perfil_comprador` con opciones predefinidas
  - Smart Tag: tags por perfil para analisis cruzado
  - Funnel: Puede haber funnels diferenciados (ej: venta vs alquiler en inmobiliaria)
  - Derivacion: Cada perfil puede tener un vendedor asignado distinto
  - KPI: Metricas segmentadas por perfil

---

## BLOQUE 4: CONTENIDO Y CONOCIMIENTO

### Dato relevado: "Top 5 preguntas frecuentes"
* Que significa: El 80% del volumen de consultas del agente
* Donde impacta:
  - Contenido del agente: Estas son las primeras respuestas a configurar
  - Smart Tag: cada tipo de pregunta genera un tag (`#pidio_precio`, `#pidio_disponibilidad`)
  - KPI: Distribucion de tipos de consulta
  - Prioridad: Resolver estas 5 preguntas = resolver el 80% del volumen

### Dato relevado: "Informacion que existe (catalogo, precios, brochure)"
* Que significa: Material disponible para alimentar al agente
* Donde impacta:
  - Contenido del agente: Se carga como base de conocimiento
  - Variable: Si el catalogo tiene atributos (medidas, colores, materiales), esos son variables de producto
  - Automatizacion: El agente puede enviar brochures/fichas automaticamente

### Dato relevado: "Informacion que NO debe dar el agente"
* Que significa: Limites de autonomia — lo mas critico de toda la configuracion
* Donde impacta:
  - Restriccion del agente: Lista negra de temas/datos
  - Derivacion: Si el lead pregunta por algo restringido → escalar
  - Smart Tag: `#consulta_restringida`
  - KPI: Veces que el agente intento responder algo restringido (si se monitorea)

---

## BLOQUE 5: EXPECTATIVAS Y DOLOR

### Dato relevado: "Dolor principal"
* Que significa: La prioridad #1 del cliente para Prometheo
* Donde impacta:
  - Prioridad: Define el quick win y el flujo a configurar primero
  - KPI: Define la metrica de exito principal
  - Automatizacion: Primer flujo que se activa

### Dato relevado: "Expectativa a 30 dias"
* Que significa: Lo que el cliente va a usar para juzgar si Prometheo funciona
* Donde impacta:
  - KPI: Metrica baseline + objetivo a 30 dias
  - Prioridad: Lo que se configura primero en MVP
  - Restriccion: Si la expectativa es irreal, hay que recalibrar antes de Fase 2

### Dato relevado: "Experiencia previa con CRM/chatbot"
* Que significa: Nivel de expectativa y posibles resistencias
* Donde impacta:
  - Automatizacion: Si ya tuvo un chatbot malo, el agente necesita sonar mas humano
  - Derivacion: Si el equipo tuvo mala experiencia con CRM, la capacitacion es mas critica
  - KPI: Adopcion del equipo como metrica adicional

---

## BLOQUE 6: DERIVACION Y LIMITES

### Dato relevado: "Situaciones que requieren humano"
* Que significa: El muro de contencion del agente
* Donde impacta:
  - Derivacion: Lista de triggers de escalamiento
  - Smart Tag: `#requiere_humano`, `#negociacion`, `#reclamo_grave`
  - Restriccion del agente: Lo que no puede hacer
  - KPI: Tasa de escalamiento, motivos de escalamiento

### Dato relevado: "A quien se escala y en cuanto tiempo"
* Que significa: El SLA interno de atencion humana post-agente
* Donde impacta:
  - Derivacion: Reglas de asignacion + tiempo maximo
  - Variable: `vendedor_asignado`, `tiempo_sla`
  - KPI: Tiempo de atencion post-escalamiento
  - Automatizacion: Alertas si el vendedor no atiende dentro del SLA

### Dato relevado: "Informacion que debe llevar la derivacion"
* Que significa: El contexto que recibe el humano para no empezar de cero
* Donde impacta:
  - Automatizacion: El agente genera un resumen de la conversacion al escalar
  - Variable: Las variables recopiladas se muestran en la ficha del lead
  - Smart Tag: Los tags de la conversacion dan contexto rapido

---

## LOGICA DE TRADUCCION SINTETICA

```
DATO DEL DISCOVERY           →    CONFIGURACION EN PROMETHEO
─────────────────                  ─────────────────────────
Que vende                    →    Tipologia macro + base conocimiento
A quien le vende             →    Perfiles de comprador (variable)
Por donde llegan leads       →    Canales activos + atribucion (variable)
Quien atiende                →    Reglas de routing (derivacion)
Cuanto tardan en responder   →    Baseline de KPI
Preguntas frecuentes         →    Respuestas del agente (contenido)
Lead bueno vs lead malo      →    Scoring (automatizacion)
Objeciones                   →    Smart Tags + respuestas preparadas
Dolor principal              →    Quick win (prioridad)
Expectativa                  →    KPI objetivo
Limites                      →    Restricciones del agente
A quien escalar              →    Reglas de derivacion
```
