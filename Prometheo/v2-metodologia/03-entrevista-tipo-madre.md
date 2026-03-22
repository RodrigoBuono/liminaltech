# ENTREVISTA TIPO MADRE — Estructura Universal para Prometheo

---

## Como usar este documento

Esta no es una lista de preguntas para leer en orden. Es una estructura modular con:
* **Preguntas nucleo** (obligatorias, se hacen siempre)
* **Preguntas opcionales** (se hacen si el contexto lo pide)
* **Senales de repregunta** (si el cliente dice X → profundizar con Y)
* **Alertas del entrevistador** (cosas a detectar que el cliente no va a decir espontaneamente)
* **"Que no olvidar relevar"** (al final de cada bloque, checklist mental)

El consultor debe conocer esta estructura de memoria, no leerla en pantalla durante la reunion. La reunion es una conversacion, no un interrogatorio.

---

## BLOQUE 1: APERTURA Y CONTEXTO DE NEGOCIO

### Objetivo del bloque
Entender que vende el cliente, a quien, y cual es su propuesta de valor. Esto determina la tipologia macro del CRM y la personalidad del agente.

### Pregunta nucleo de apertura
> "Contame en tus palabras que hace tu empresa y a quien le vende."

Esta unica pregunta, bien escuchada, te da:
* Tipo de negocio
* Producto/servicio principal
* Perfil de cliente
* Diferencial implicito
* Tono natural de la empresa

### Preguntas de profundizacion (hacer solo las necesarias)
* "¿Cuantos productos/proyectos/propiedades manejan hoy?"
* "¿Cual es el rango de precios?"
* "¿Venden directo o a traves de intermediarios?"
* "¿El equipo de ventas es propio?"
* "¿Tienen presencia digital fuerte o la mayoria viene por otro canal?"

### Senales de repregunta
* Si menciona multiples lineas de producto → "¿hay alguna que sea la estrella o la que mas consultas genera?"
* Si menciona que venden B2B y B2C → "¿el proceso de venta es distinto? ¿el trato es distinto?"
* Si dice "somos los unicos que..." → eso es el diferencial; anotar literalmente, sirve para el agente

### Alerta del entrevistador
* Si el cliente no puede explicar claramente su diferencial, el agente tampoco va a poder. Anotar: "definir diferencial en Fase 2"
* Si tiene demasiados productos/proyectos, preguntar: "¿el agente deberia manejar todos o conviene empezar con un subconjunto?"

### Que no olvidar relevar
- [ ] Tipo de producto/servicio principal
- [ ] Rango de precios
- [ ] Perfil de comprador tipico
- [ ] Zona de cobertura
- [ ] Tamaño del equipo comercial
- [ ] Diferencial de la empresa

### → Variables potenciales
`tipo_negocio`, `tipologia_macro`, `zona_cobertura`, `ticket_promedio`, `modelo_venta`

### → Smart Tags potenciales
`#b2b`, `#b2c`, `#mixto`, `#alta_gama`, `#volumen`, `#premium`, `#economico`

### → KPIs potenciales
Ticket promedio, volumen de operaciones/mes

---

## BLOQUE 2: OPERACION COMERCIAL REAL

### Objetivo del bloque
Mapear como funciona la venta en la practica: canales, equipo, tiempos, cuellos de botella. Esto define donde y como interviene el agente.

### Pregunta nucleo de apertura
> "¿Como es un dia tipico de tu equipo de ventas? Desde que abren hasta que cierran."

### Preguntas de profundizacion
* "¿Por donde les llegan mas consultas?"
* "¿Quien contesta? ¿Hay alguien asignado o contesta el que puede?"
* "¿Cuanto tardan en responder la primera vez?"
* "¿Y fuera de horario? ¿Fines de semana?"
* "¿Cuantas consultas reciben por mes mas o menos?"
* "¿Cuantas de esas se pierden o quedan sin responder?"

### Senales de repregunta
* Si dice "yo contesto todo" (el dueño) → "¿y cuando estas en obra/reunion/viajando?"
* Si dice "tenemos varios vendedores" → "¿como se reparten los leads? ¿hay conflicto por eso?"
* Si dice "usamos WhatsApp Business" → "¿un solo numero o cada vendedor con el suyo?"
* Si dice "recibimos muchas consultas de Instagram" → "¿las manejan desde la app o las pasan a WhatsApp?"

### Alerta del entrevistador
* Si el tiempo de respuesta es >2 horas, ese es el pain point principal. El agente resuelve eso el dia 1.
* Si el dueño atiende todo, hay riesgo de que el agente "no le guste" porque pierde control. Anotar para manejar expectativas.
* Si usan varios numeros de WhatsApp, eso complejiza la implementacion. Anotar.

### Que no olvidar relevar
- [ ] Canales activos (todos, no solo el principal)
- [ ] Quien responde en cada canal
- [ ] Tiempo real de primera respuesta (no el ideal)
- [ ] Horarios de atencion reales
- [ ] Volumen mensual de consultas (aproximado esta bien)
- [ ] Estimacion de consultas perdidas o sin respuesta

### → Variables potenciales
`canal_origen`, `vendedor_asignado`, `horario_consulta`

### → Smart Tags potenciales
`#fuera_horario`, `#sin_respuesta`, `#demora_respuesta`, `#multicanal`

### → KPIs potenciales
Tiempo de primera respuesta, tasa de respuesta, consultas por canal, consultas sin responder

---

## BLOQUE 3: EL LEAD IDEAL Y EL LEAD PERDIDO (Calificacion por narrativa)

### Objetivo del bloque
Extraer los criterios reales de calificacion de leads a traves de ejemplos concretos, no de definiciones abstractas.

### Pregunta nucleo
> "Contame la historia del ultimo lead bueno que cerraron. ¿Como llego, que pregunto, como fue el proceso?"

Seguida de:
> "Y ahora contame uno que se perdio. ¿Que paso?"

### Por que esta tecnica funciona
Cuando le preguntas a un vendedor "¿que es un lead calificado?", te dice "uno que tiene plata y esta apurado". Cuando le pedis que cuente una historia real, te da:
* El canal por donde llego
* La primera pregunta que hizo
* Las senales que lo marcaron como serio
* El momento en que se decidio (o se fue)
* Lo que el vendedor hizo bien (o mal)

Toda esa informacion es oro para configurar el scoring del agente.

### Preguntas de profundizacion
* "¿En que momento te diste cuenta de que era un lead serio?"
* "¿Que preguntas hizo que te marcaron que iba en serio?"
* "¿Cuanto tardo en cerrar desde la primera consulta?"
* "¿El lead perdido: fue por precio, por demora, por que?"
* "¿Hay leads que consultan pero sabes que no van a comprar? ¿Como los identificas?"

### Senales de repregunta
* Si dice "los inversores cierran mas rapido" → "¿como los distinguis? ¿hay algo que dicen o preguntan que los delata?"
* Si dice "se fue con la competencia" → "¿sabes que le ofrecieron? ¿fue precio o velocidad?"
* Si dice "vuelven a consultar despues de meses" → "¿llevan registro de eso? ¿les hacen seguimiento?"

### Alerta del entrevistador
* Si no puede distinguir un lead bueno de uno malo, la calificacion va a requerir mas iteraciones en Fase 4
* Si el criterio principal es "tiene la plata", eso es insuficiente. Buscar criterios complementarios.
* Anotar textualmente las frases que usa el vendedor para describir un buen lead. Sirven para disenar las preguntas del agente.

### Que no olvidar relevar
- [ ] Perfil de comprador ideal (en sus palabras)
- [ ] 3-5 senales de lead calificado
- [ ] 3-5 senales de lead no calificado
- [ ] Objeciones mas frecuentes
- [ ] Tiempo promedio de ciclo de venta
- [ ] Que datos NECESITAN tener para considerar un lead viable

### → Variables potenciales
`perfil_comprador`, `presupuesto_declarado`, `urgencia`, `estado_calificacion`, `motivo_descarte`

### → Smart Tags potenciales
`#inversor`, `#usuario_final`, `#comparando`, `#urgente`, `#exploratorio`
`#objecion_precio`, `#objecion_plazo`, `#objecion_ubicacion`, `#objecion_financiacion`
`#volvio_a_consultar`, `#pidio_visita`, `#pidio_brochure`, `#menciono_competencia`

### → KPIs potenciales
Tasa de calificacion, conversion por perfil, motivos de descarte, tiempo de ciclo por tipo

---

## BLOQUE 4: CONTENIDO Y CONOCIMIENTO DEL AGENTE

### Objetivo del bloque
Entender que informacion necesita el agente para responder, que ya existe y que hay que crear.

### Pregunta nucleo
> "Si yo fuera un lead y te escribo por WhatsApp, ¿cuales son las 5 preguntas que mas me vas a escuchar?"

### Preguntas de profundizacion
* "¿Esas preguntas tienen una respuesta estandar o depende de cada caso?"
* "¿Tienen algo escrito (FAQ, manual, brochure) con esas respuestas?"
* "¿Hay cosas que el lead pregunta y que preferirian que NO conteste un bot?"
* "¿Que pasa si el lead pregunta algo que el agente no sabe? ¿Que deberia hacer?"
* "¿Los precios se pueden compartir abiertamente o hay restricciones?"

### Senales de repregunta
* Si dice "el 80% pregunta por precio" → "¿el precio es fijo o variable? ¿el agente puede darlo?"
* Si dice "depende de muchas cosas" → "¿de cuales? enumeremoslas porque eso lo tiene que saber el agente"
* Si dice "nunca deberia decir el precio de X" → Anotar como limite de autonomia

### Alerta del entrevistador
* Todo lo que el cliente diga que "depende" es una variable o un flujo condicional del agente
* Lo que "nunca deberia decir" es un limite de autonomia. Estos son criticos. Anotar textualmente.
* Si no tienen FAQ ni catalogo digital, hay trabajo de contenido extra en Fase 2

### Que no olvidar relevar
- [ ] Top 5 preguntas mas frecuentes (en sus palabras)
- [ ] Cuales tienen respuesta estandar y cuales no
- [ ] Que contenido existe (catalogo, brochure, lista precios, web)
- [ ] Que contenido falta crear
- [ ] Que cosas el agente NO debe responder sin autorizacion
- [ ] Que debe hacer el agente cuando no sabe la respuesta

### → Variables potenciales
`producto_consultado`, `tipo_consulta` (precio, disponibilidad, info general, reclamo)

### → Smart Tags potenciales
`#pidio_precio`, `#pidio_catalogo`, `#pidio_visita`, `#pidio_brochure`
`#consulta_postventa`, `#reclamo`, `#consulta_financiacion`, `#consulta_envio`

### → KPIs potenciales
% consultas resueltas por el agente, tipos de consulta mas frecuentes, tasa de "no se" del agente

---

## BLOQUE 5: EXPECTATIVAS, DOLOR Y EXITO

### Objetivo del bloque
Alinear que quiere el cliente, que considera exito, y cual es su dolor mas urgente.

### Pregunta nucleo
> "Si todo funciona bien con Prometheo, ¿que cambia para tu equipo en 30 dias?"

### Preguntas de profundizacion
* "¿Cual es el dolor mas grande hoy?"
* "¿Han probado algo antes? ¿Que salio mal?"
* "¿Hay alguien en el equipo que no confie en que un bot pueda hacer esto?"
* "¿Que es lo primero que necesitan que funcione? ¿Cual es el quick win?"
* "¿Y a 90 dias, que deberia estar pasando?"

### Senales de repregunta
* Si dice "no quiero perder mas leads" → "¿cuantos estimas que pierden? ¿por semana, por mes?"
* Si dice "quiero liberar al equipo" → "¿cuantas horas por dia estiman que pierden en consultas repetitivas?"
* Si dice "probamos otro CRM y no funciono" → "¿que paso? ¿era complicado, nadie lo usaba, no se configuro bien?"

### Alerta del entrevistador
* Si la expectativa es irreal ("quiero duplicar ventas en 30 dias"), hay que recalibrar ahora. No despues.
* Si hay resistencia del equipo al cambio, anotar. La capacitacion en Fase 3 es critica.
* El dolor principal determina el quick win. El quick win determina la primera impresion. La primera impresion determina la adopcion.

### Que no olvidar relevar
- [ ] Dolor principal (uno, no cinco)
- [ ] Expectativa a 30 dias (concreta)
- [ ] Expectativa a 90 dias (concreta)
- [ ] Experiencia previa con CRM/chatbot
- [ ] Nivel de resistencia al cambio en el equipo
- [ ] Quick win acordado

### → Variables potenciales
`objetivo_primario`, `experiencia_previa_crm`

### → Smart Tags potenciales: No aplica (esto informa la estrategia, no la conversacion con leads)

### → KPIs potenciales: Los que el cliente defina como exito

---

## BLOQUE 6: REGLAS DE DERIVACION Y LIMITES DE AUTONOMIA

### Objetivo del bloque
Definir con precision cuando el agente debe escalar a un humano, a quien, y con que informacion.

### Pregunta nucleo
> "¿En que situacion te molestaria que un bot le conteste a un lead en vez de una persona?"

### Preguntas de profundizacion
* "¿Hay negociaciones de precio que solo maneja el dueño/gerente?"
* "¿Hay clientes VIP que deberian saltar directamente a un humano?"
* "¿Cuando el agente detecta un lead calificado, a quien le avisa? ¿Por donde?"
* "¿Que informacion deberia recibir el vendedor cuando le llega un lead derivado?"
* "¿En cuanto tiempo deberia atender el vendedor un lead derivado?"

### Senales de repregunta
* Si dice "las contraofertas las manejo yo" → "¿pero el agente puede decir el precio de lista?"
* Si dice "depende del monto" → "¿a partir de que monto escala?"
* Si dice "los clientes grandes quieren hablar con una persona" → "¿como sabe el agente que es un cliente grande?"

### Alerta del entrevistador
* Los limites de autonomia mal definidos son la causa #1 de insatisfaccion con agentes IA
* Es mejor que el agente escale de mas que de menos al principio. Se puede aflojar despues.
* Anotar literalmente todo lo que "nunca" deberia hacer el agente. Son las reglas mas importantes.

### Que no olvidar relevar
- [ ] Situaciones que siempre requieren humano
- [ ] A quien se escala (nombre/rol, no solo "al vendedor")
- [ ] Que informacion debe llevar la derivacion
- [ ] Tiempo maximo de atencion post-derivacion
- [ ] Si hay VIPs con trato diferencial
- [ ] Que puede decir el agente sobre precios y que no

### → Variables potenciales
`vendedor_asignado`, `regla_derivacion`, `prioridad_lead`

### → Smart Tags potenciales
`#requiere_humano`, `#negociacion`, `#cliente_vip`, `#reclamo_sensible`, `#contrapropuesta`

### → KPIs potenciales
Tasa de escalamiento, tiempo de atencion post-escalamiento, motivos de escalamiento
