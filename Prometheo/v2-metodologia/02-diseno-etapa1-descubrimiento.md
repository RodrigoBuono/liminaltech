# DISENO DE LA ETAPA 1 — DESCUBRIMIENTO

---

## Por que el formulario rigido falla (Diagnostico metodologico)

El formulario actual tiene 7 secciones con ~60 preguntas. Funciona bien como checklist post-reunion. Falla como guia de entrevista en vivo. Estas son las razones concretas:

### Problema 1: Mezcla de capas de informacion

El formulario actual trata todo al mismo nivel. Pero en realidad hay 5 capas de descubrimiento completamente distintas:

* **Descubrimiento de negocio**: Modelo, mercado, propuesta de valor, ticket, ciclo. Es lo que te permite entender *que* vende el cliente y *a quien*.
  - Se releva en los primeros 15 minutos de reunion 1
  - Sale natural porque al cliente le gusta hablar de su negocio
* **Descubrimiento operativo**: Canales, equipo, tiempos de respuesta, cuellos de botella. Es lo que te permite entender *como* vende el cliente hoy.
  - Sale mejor cuando preguntas "contame como es un dia tipico de tu equipo de ventas"
  - Si lo metes en una tabla, el cliente te da respuestas idealizadas, no reales
* **Descubrimiento de contenidos**: FAQs, catalogo, precios, materiales comerciales. Es lo que necesitas para alimentar al agente.
  - El 80% de esto NO se releva en la reunion; se pide por email antes o despues
  - Pedir esto en vivo es perder tiempo ("dejame que busco el PDF...")
* **Descubrimiento de criterios de calificacion**: Que es un lead bueno, que datos importan, cuando derivar. Es la logica de negocio del vendedor.
  - Esto se releva mejor con ejemplos: "contame el ultimo lead que cerraron, como fue?"
  - Las tablas de scoring no funcionan en entrevista; funcionan en la sintesis posterior
* **Descubrimiento de taxonomia CRM**: Variables, tags, funnel, KPIs. Esto NO lo dice el cliente; lo DISEÑA el consultor a partir de lo anterior.
  - Error comun: preguntarle al cliente "que variables queres?" (no sabe, no es su trabajo)
  - Correcto: el consultor escucha, procesa, y propone la taxonomia despues

### Problema 2: El formulario asume orden lineal

Una conversacion real no sigue el orden Contexto → Funnel → Atencion → FAQs → Calificacion → Dolores → KPIs.

Lo que pasa en la realidad:
* El cliente empieza hablando de su dolor ("me llegan 200 WhatsApp y no damos abasto")
* De ahi salta al equipo ("tengo 3 vendedores y un dueño que hace todo")
* De ahi al producto ("vendemos departamentos de pozo de USD 80k a 250k")
* De ahi a una anecdota de un lead que se perdio ("el mes pasado un inversor nos escribio un sabado y nadie le contesto hasta el lunes")

Esa anecdota es oro puro para el discovery. Te da: tipo de cliente (inversor), canal (WhatsApp), dolor (demora en respuesta), criterio de calificacion implicito (inversor = alta prioridad), regla de derivacion (los sabados no hay nadie). Pero si estas leyendo la seccion 4 del formulario ("FAQs"), esa anecdota se pierde.

### Problema 3: El formulario no distingue entre "obligatorio" y "condicional"

No todas las preguntas aplican a todos los clientes. Ejemplo:
* "¿Trabajan con MLS?" — solo inmobiliarias
* "¿Los precios cambian frecuentemente?" — critico en materiales, irrelevante en desarrollistas
* "¿Hacen muebles a medida?" — solo mobiliario

Un buen sistema de discovery tiene preguntas nucleo (siempre), preguntas condicionales (si aplica) y senales de repregunta (si el cliente dice X, profundizar en Y).

### Solucion: Sistema hibrido de discovery

```
PRE-WORK (asincrono)     REUNION 1              REUNION 2              REUNION 3
antes de reunirse        (conversacional)        (estructurada)         (solo si hace
                                                                         falta)

Pedir:                   Entender:               Validar:               Cerrar:
- Catalogo/brochure      - Negocio               - Variables propuestas - Gaps pendientes
- Lista precios          - Operacion             - Tags propuestos      - Contenidos
- Web/redes              - Dolores               - Funnel propuesto       faltantes
- WhatsApp screenshots   - Expectativas          - Criterios scoring    - Firmar DSD
  (si quieren)           - Calificacion          - Reglas derivacion      final
- FAQs si las tienen       (via ejemplos)        - Limites del agente
                         - Quick wins            - KPIs a monitorear

Output:                  Output:                 Output:                Output:
Carpeta de insumos       Notas brutas +          DSD completo           DSD firmado
                         grabacion               Variables/Tags v1      Todo listo
                         + primer mapeo          Funnel v1              para Fase 2
                         mental del consultor
```

---

## Bloques tematicos y orden recomendado

### BLOQUE A: "Contame tu negocio" (15 min — Reunion 1)

* **Objetivo**: Entender el modelo de negocio, la propuesta de valor y el mercado
* **Insight que busca**: La tipologia macro, el nivel de complejidad del catalogo, el perfil del comprador
* **Por que importa**: Sin esto, toda la configuracion es generica
* **Impacto en Agente**: Define el tono, la personalidad, el nivel de tecnicidad
* **Impacto en CRM**: Define la tipologia macro (el eje organizador de todo)
* **Variables que pueden salir**:
  - `tipo_negocio` (desarrollista / inmobiliaria / mobiliario / materiales)
  - `tipologia_macro` (proyecto, propiedad, linea de producto, categoria)
  - `modelo_venta` (directo, intermediado, mixto)
  - `ticket_promedio`
  - `zona_cobertura`
* **Smart Tags que pueden salir**:
  - `#b2b`, `#b2c`, `#mixto`
  - `#alta_gama`, `#volumen`, `#especializado`
* **KPIs que se pueden medir**: Ticket promedio, volumen de operaciones, cobertura geografica
* **Repreguntas segun respuesta**:
  - Si dice "vendemos directo y por inmobiliarias" → "¿como manejan la atribucion? ¿saben de donde vienen los leads?"
  - Si dice "tenemos 3 proyectos activos" → "¿el agente deberia manejar los 3 o solo los que estan en venta activa?"
  - Si dice "nuestro ticket es de USD 200k" → "¿tu lead tipico compara mucho? ¿cuanto tarda en decidir?"

### BLOQUE B: "Como es un dia tipico de tu equipo de ventas" (15 min — Reunion 1)

* **Objetivo**: Mapear la operacion real, no la ideal
* **Insight que busca**: Canales reales, cuellos de botella, quien hace que, donde se pierden leads
* **Por que importa**: El agente tiene que encajar en la operacion tal como es, no como deberia ser
* **Impacto en Agente**: Define canales activos, horarios de cobertura, reglas de asignacion
* **Impacto en CRM**: Define atribucion de canal, estructura de equipo, reglas de routing
* **Variables que pueden salir**:
  - `canal_origen` (WhatsApp, Instagram, portal, web, referido, presencial)
  - `vendedor_asignado`
  - `horario_consulta` (horario comercial / fuera de horario / fin de semana)
* **Smart Tags que pueden salir**:
  - `#consulta_fuera_horario`
  - `#sin_respuesta_24h`
  - `#consulta_repetida`
  - `#multicanal` (el mismo lead escribe por WA e IG)
* **KPIs**: Tiempo de primera respuesta, tasa de respuesta, consultas sin responder, distribucion por canal
* **Repreguntas segun respuesta**:
  - Si dice "el dueño atiende todo" → "¿y cuando no esta? ¿que pasa con esos leads?"
  - Si dice "tenemos 5 vendedores" → "¿cada uno atiende sus propios leads o hay un pool comun?"
  - Si dice "recibimos 300 consultas por mes" → "¿cuantas de esas son consultas serias y cuantas son ruido?"

### BLOQUE C: "Contame de un lead que cerraron y uno que se perdio" (15 min — Reunion 1)

* **Objetivo**: Extraer criterios de calificacion implicitos a traves de narrativas reales
* **Insight que busca**: Que hace a un lead "bueno" en la practica (no en teoria), y que senales indican que un lead no va a comprar
* **Por que importa**: Los criterios de calificacion mas valiosos no estan en un manual; estan en la cabeza del vendedor. Se extraen con historias.
* **Impacto en Agente**: Reglas de scoring, preguntas de calificacion, triggers de escalamiento
* **Impacto en CRM**: Variables de calificacion, etapas del funnel, criterios de lead calificado
* **Variables que pueden salir**:
  - `perfil_comprador` (inversor, usuario final, contratista, arquitecto, particular...)
  - `presupuesto_declarado`
  - `urgencia` (inmediata, 30 dias, explorando, indefinida)
  - `estado_calificacion` (nuevo, en calificacion, calificado, no calificado, descartado)
* **Smart Tags que pueden salir**:
  - `#inversor`, `#usuario_final`, `#solo_precio`, `#comparando`
  - `#urgente`, `#exploratorio`, `#volvio_a_consultar`
  - `#pidio_visita`, `#pidio_financiacion`, `#menciono_competencia`
  - `#objecion_precio`, `#objecion_plazo`, `#objecion_ubicacion`
* **KPIs**: Tasa de calificacion, conversion por perfil, tiempo de ciclo por tipo de comprador
* **Repreguntas segun respuesta**:
  - Si cuenta un cierre: "¿en que momento te diste cuenta de que iba en serio? ¿que pregunto primero?"
  - Si cuenta una perdida: "¿lo perdieron por demora, por precio o porque no era el momento?"
  - Si dice "los inversores cierran mas rapido": "¿como los identifican? ¿el agente deberia preguntar eso directamente?"

### BLOQUE D: "Que queres que cambie" (10 min — Reunion 1)

* **Objetivo**: Alinear expectativas concretas y definir metrica de exito
* **Insight que busca**: El dolor principal (no todos los dolores), la expectativa realista a 30/90 dias
* **Por que importa**: Si no sabes que dolor prioriza el cliente, vas a configurar para lo que vos crees que importa
* **Impacto en Agente**: Prioridad de flujos, quick wins
* **Impacto en CRM**: KPIs principales a monitorear
* **Variables que pueden salir**:
  - `objetivo_primario` (mas velocidad, mas calificacion, cobertura 24/7, liberar equipo)
* **Smart Tags**: No aplica directamente
* **KPIs**: Los que el cliente defina como "exito"
* **Repreguntas**:
  - Si dice "quiero responder mas rapido" → "¿hoy cuanto tardan? ¿en que canal es peor?"
  - Si dice "quiero calificar mejor" → "¿hoy cuantos leads les pasan que son basura? ¿que porcentaje?"
  - Si dice "quiero vender mas" → "¿el cuello de botella esta en la generacion de leads o en la conversion?"

---

## Que conviene hacer en vivo vs asincrono vs post-reunion

### En vivo (reunion)
* Entender el negocio y la operacion (Bloques A y B)
* Extraer criterios de calificacion por historias (Bloque C)
* Alinear expectativas y dolor principal (Bloque D)
* Validar variables, tags y funnel propuestos (Reunion 2)

### Asincrono (pre-work o post-reunion)
* Solicitar catalogo, lista de precios, brochures, fichas tecnicas
* Solicitar capturas de conversaciones reales (con permiso)
* Solicitar FAQs existentes o base de conocimiento
* Solicitar metricas de marketing (CPL, volumen, canales)
* Solicitar organigrama comercial

### Post-reunion (trabajo del consultor)
* Disenar la taxonomia (variables + tags + funnel)
* Proponer scoring y reglas de derivacion
* Mapear los flujos conversacionales del agente
* Documentar limites de autonomia del agente
* Armar el DSD para validacion

---

## Senales que indican que hace falta una 2da o 3ra reunion

### Hace falta Reunion 2 (casi siempre)
* El consultor necesita validar la taxonomia que diseño
* Hay variables o criterios que no quedaron claros
* El cliente no tenia a mano cierta informacion en la Reunion 1
* Hay mas de un decision-maker y no todos participaron

### Hace falta Reunion 3 (a veces)
* El negocio es complejo (multiples proyectos, operaciones mixtas)
* Hay conflicto interno sobre criterios de calificacion
* El cliente no entrego los contenidos necesarios y hay que repasar juntos
* Se necesita involucrar al equipo de ventas para validar flujos
* Cambiaron las prioridades entre la Reunion 1 y la 2

---

## Preguntas obligatorias vs condicionales

### Obligatorias (siempre, en todo rubro)
* ¿Que venden y a quien?
* ¿Como llegan los leads hoy?
* ¿Cuantas consultas reciben por mes?
* ¿Quien atiende y en cuanto tiempo?
* ¿Que es un lead bueno para ustedes?
* ¿Que resultado esperan en 30 dias?
* ¿Que informacion nunca deberia dar el agente sin autorizacion?

### Condicionales (segun rubro o situacion)
* "¿Ofrecen financiacion?" → solo si venden high-ticket (desarrollistas, mobiliario premium)
* "¿Tienen cuenta corriente?" → solo si son B2B (materiales, mobiliario a empresas)
* "¿Trabajan con portales?" → solo inmobiliarias
* "¿Los precios cambian frecuentemente?" → critico en materiales, menor en inmobiliarias
* "¿Hacen productos a medida?" → solo mobiliario
* "¿Cuantos proyectos tienen activos?" → solo desarrollistas
* "¿Distinguen venta y alquiler?" → solo inmobiliarias
