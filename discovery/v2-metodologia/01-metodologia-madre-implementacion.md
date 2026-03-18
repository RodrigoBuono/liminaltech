# METODOLOGIA MADRE DE IMPLEMENTACION — Prometheo CRM + Agente IA

---

## Analisis previo: Que falla hoy y por que

Antes de disenar la metodologia, hay que nombrar los problemas reales que detecte en los formularios actuales:

* Los templates de discovery mezclan 5 capas distintas de informacion en un solo flujo lineal
  - Negocio (modelo, mercado, ticket)
  - Operacion (canales, tiempos, equipos)
  - Contenido (FAQs, respuestas tipo, catalogo)
  - Calificacion (scoring, criterios, derivacion)
  - Taxonomia CRM (variables, tags, funnel)
* Esto genera un problema muy concreto en consultoria: el consultor queda atrapado entre "seguir el formulario" y "seguir la conversacion"
  - Si sigue el formulario, pierde insights espontaneos que solo salen en la charla
  - Si sigue la charla, despues no sabe donde colocar lo que recolecto
* Las tablas de FAQs y KPIs se presentan todas juntas, como si tuvieran igual prioridad
  - En realidad, el orden correcto es: primero KPI, despues variables, despues tags, despues funnel
  - Porque los KPI determinan que necesitas medir, y eso determina que datos capturar
* No hay distincion entre lo que se releva en vivo vs lo que se pide asincronicamente
  - Pedir una lista de precios en una reunion de discovery es perder 10 minutos mirando como alguien busca un archivo
  - Eso se pide antes, por email
* No hay un modelo de "tipologia macro" por vertical
  - Sin eso, toda la estructura del CRM queda plana y pierde inteligencia

---

## PRINCIPIOS FUNDACIONALES

Estos principios rigen toda la metodologia. No son teoria; son criterios de decision.

* **KPI-first**: Primero se definen los objetivos estrategicos del negocio. Recien despues se disennan las variables y tags que permiten medirlos. Nunca al reves.
* **Variable ≠ Smart Tag**: Una variable es un dato estructural, unico por lead o conversacion (tipo de operacion, presupuesto, proyecto de interes). Un Smart Tag es una situacion, intencion, objecion o patron que puede coexistir con otros dentro de la misma conversacion (pidio precio, menciono competencia, mostro urgencia).
* **Tipologia macro como eje organizador**: Cada vertical tiene una "unidad de negocio principal" que estructura todo lo demas. Sin definirla, el CRM es una libreta digital.
* **El CRM no es un registro de conversaciones; es un sistema de inteligencia comercial**: Si no produce datos accionables, no sirve.
* **El Agente IA no es un chatbot; es un calificador inteligente**: Su funcion principal no es "responder bonito" sino clasificar, calificar y derivar con contexto.
* **Descubrimiento conversacional > formulario rigido**: La mejor informacion sale cuando el cliente habla naturalmente. Pero necesitas estructura para no perder nada.

---

## FASE 1: DESCUBRIMIENTO

* **Objetivo**: Entender al cliente lo suficiente como para disenar una implementacion que funcione desde el dia 1, sin sobre-ingenieria y sin vacios criticos
* **Que informacion se necesita**:
  - Modelo de negocio y propuesta de valor
  - Estructura comercial (equipo, canales, volumen)
  - Proceso de ventas real (no el ideal, el real)
  - Dolor principal y expectativa concreta
  - Criterios de calificacion de leads (explicitos e implicitos)
  - Contenidos disponibles (catalogo, precios, FAQs)
  - Restricciones y limites de autonomia del agente
  - KPIs actuales y deseados
* **Que se decide en esta fase**:
  - Tipologia macro del CRM para ese cliente
  - Variables criticas para MVP
  - Smart Tags iniciales
  - Estructura del funnel
  - Criterios de lead calificado
  - Reglas de derivacion basicas
  - Tono y personalidad del agente
  - Limites de autonomia del agente
* **Entregables**:
  - Documento de Sintesis de Discovery (DSD)
  - Mapa de Variables y Smart Tags v1
  - Funnel validado
  - Criterios de calificacion y derivacion
  - Lista de contenidos a producir/solicitar
  - Spec de personalidad del agente
* **Riesgos que evita**:
  - Configurar un agente que no refleja la realidad del negocio
  - Crear un CRM con variables que nadie usa
  - Lanzar sin criterios de calificacion claros
  - Definir KPIs que no se pueden medir con los datos disponibles
* **Actores**:
  - Consultor de implementacion (Prometheo)
  - Decision-maker del cliente (gerente comercial, dueno, director)
  - Responsable operativo (si es distinto del anterior)
* **Validacion para pasar a Fase 2**: El cliente firma/aprueba el DSD con las definiciones de funnel, variables, tags, criterios de calificacion y limites del agente

---

## FASE 2: DISENO

* **Objetivo**: Traducir todo lo descubierto en especificaciones concretas y configurables
* **Que informacion se necesita**:
  - DSD aprobado de Fase 1
  - Contenidos del cliente (catalogo, precios, brochures, planos, fichas)
  - Acceso a conversaciones reales de WhatsApp/email (para mapear patrones)
  - Confirmacion de equipo comercial y roles
* **Que se decide en esta fase**:
  - Flujos conversacionales del agente (arbol de decision)
  - Mensajes especificos por situacion
  - Logica de scoring (pesos, umbrales)
  - Reglas de escalamiento (a quien, cuando, con que contexto)
  - Base de conocimiento a cargar
  - Dashboard y alertas
* **Entregables**:
  - Spec de Configuracion del Agente (SCA)
  - Flujos conversacionales diagramados
  - Base de conocimiento estructurada
  - Reglas de scoring documentadas
  - Reglas de derivacion documentadas
  - Mock de dashboard con KPIs
* **Riesgos que evita**:
  - Un agente que suena generico y no refleja la marca
  - Flujos que no cubren las consultas mas frecuentes
  - Scoring arbitrario que no coincide con lo que el vendedor considera "lead caliente"
  - Derivaciones que llegan al vendedor sin contexto util
* **Actores**:
  - Consultor de implementacion
  - Disenador conversacional (puede ser el mismo consultor)
  - Equipo de contenidos del cliente (para validar respuestas)
* **Validacion para pasar a Fase 3**: El cliente aprueba la SCA, especialmente los flujos conversacionales, el tono de voz y las reglas de derivacion. El consultor valida que todos los contenidos necesarios estan disponibles.

---

## FASE 3: LANZAMIENTO

* **Objetivo**: Poner el agente en produccion de forma controlada, con supervision activa
* **Que informacion se necesita**:
  - SCA aprobada
  - Accesos a la cuenta Prometheo del cliente
  - Accesos a canales (WhatsApp Business, Instagram, portales)
  - Confirmacion de quien recibe las derivaciones
* **Que se decide en esta fase**:
  - Calendario de go-live (fecha, horarios)
  - Modalidad de lanzamiento (soft launch vs full launch)
  - Protocolo de supervision los primeros 7 dias
  - Metricas de corte para decidir si ajustar o escalar
* **Entregables**:
  - Agente configurado y activo en Prometheo
  - CRM configurado con variables, tags, funnel
  - Dashboard activo
  - Protocolo de supervision documentado
  - Capacitacion al equipo comercial del cliente
* **Riesgos que evita**:
  - Lanzar sin que el equipo del cliente sepa como leer el CRM
  - No tener quien supervise las primeras conversaciones del agente
  - No tener metricas baseline para comparar despues
* **Actores**:
  - Consultor de implementacion
  - Equipo comercial del cliente (vendedores que reciben leads)
  - Responsable de supervision (puede ser el consultor o alguien del cliente)
* **Validacion para pasar a Fase 4**: 7 dias de operacion con supervision activa. Se revisan las primeras 50-100 conversaciones. Se identifican ajustes. Se documenta la baseline de KPIs.

---

## FASE 4: MONITOREO Y MEJORA CONTINUA

* **Objetivo**: Optimizar el sistema basandose en datos reales, no en supuestos
* **Que informacion se necesita**:
  - Datos de conversaciones reales (volumen, tipos, resultados)
  - Metricas de KPIs vs objetivos
  - Feedback del equipo comercial del cliente
  - Conversaciones donde el agente fallo o escalo incorrectamente
* **Que se decide en esta fase**:
  - Ajustes a flujos conversacionales
  - Nuevos Smart Tags detectados en conversaciones reales
  - Recalibracion de scoring
  - Ajuste de reglas de derivacion
  - Expansion a nuevos canales o flujos
  - Incorporacion de nuevos contenidos
* **Entregables**:
  - Reporte mensual de performance
  - Log de ajustes realizados
  - Nuevas versiones de flujos si aplica
  - Recomendaciones de expansion
* **Riesgos que evita**:
  - Un agente que queda estatico y se desactualiza
  - Tags o variables que se crearon pero nadie usa
  - KPIs que se definieron pero no se revisan
  - Oportunidades de mejora que nadie ve porque no hay proceso de revision
* **Actores**:
  - Consultor de implementacion (mensual o quincenal)
  - Responsable del CRM en el cliente
  - Decision-maker (para revisiones trimestrales)
* **Ciclos**:
  - Revision semanal (primeras 4 semanas post-launch)
  - Revision quincenal (mes 2-3)
  - Revision mensual (mes 4 en adelante)
  - Revision estrategica trimestral (con decision-maker)

---

## DIAGRAMA DE FASES

```
DESCUBRIMIENTO          DISENO              LANZAMIENTO          MONITOREO
(2-3 reuniones)         (1-2 semanas)       (1 semana setup      (ongoing)
                                             + 1 semana
                                             supervision)

Entender               Especificar          Activar              Optimizar
el negocio             la solucion          con control          con datos

    │                      │                    │                    │
    ▼                      ▼                    ▼                    ▼
  [DSD]               [SCA + Flujos]       [Go-Live]           [Reportes]
  [Variables v1]       [Base Conocim.]      [Dashboard]         [Ajustes]
  [Funnel v1]          [Scoring]            [Capacitacion]      [Expansion]
  [Criterios]          [Derivacion]         [Baseline KPI]      [Recalibracion]

    │                      │                    │                    │
    └──── Aprobacion ──────┘──── Aprobacion ────┘──── 7 dias OK ────┘
           cliente              cliente              supervision
```
