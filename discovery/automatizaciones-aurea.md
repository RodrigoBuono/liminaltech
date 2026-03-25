# AUTOMATIZACIONES PARA EL PROCESO INTERNO DE AUREA
## Hub de implementacion y onboarding de Prometheo

---

## FASE 0: PRE-DISCOVERY (Antes de la primera reunion)

### 1. Onboarding Intake Automatizado
Un formulario web (Typeform/Tally/Google Form) que el cliente completa antes de la Reunion 1. Recopila: que vende, a quien, por donde llegan leads, cuantos, equipo comercial, herramientas actuales. Esto es lo que la metodologia llama "lo que se pide asincronicamente" — evita perder 10 min en la reunion buscando un archivo.

### 2. Clasificacion automatica de vertical
Con las respuestas del formulario, un agente IA clasifica automaticamente al cliente en: Desarrollista / Inmobiliaria / Mobiliario / Insumos-Materiales. Precarga el template de entrevista correcto para el consultor.

### 3. Generador automatico de carpeta de cliente
Al ingresar un cliente nuevo (en el CRM interno o en un sheet), se crea automaticamente: carpeta en Google Drive con estructura estandar (Discovery / Diseno / Lanzamiento / Monitoreo), Documento de Sintesis de Discovery (DSD) en blanco precargado con la vertical, checklist pre-configuracion, y Spec de Configuracion del Agente (SCA) en blanco.

### 4. Email/WhatsApp de bienvenida automatizado
Cuando el cliente se asigna a un consultor, se dispara: mensaje de bienvenida con presentacion del consultor, link al formulario de intake (punto 1), lista de documentos que debe preparar (catalogo, precios, brochures, FAQs), y calendario para agendar la Reunion 1.

### 5. Reminder automatico de documentos pendientes
Si a 48h de la Reunion 1 el cliente no envio catalogo/precios/material, se dispara un recordatorio automatico.

---

## FASE 1: DESCUBRIMIENTO (Reuniones 1-3)

### 6. Asistente de entrevista en tiempo real
Un agente IA que escucha la reunion (via transcripcion de Zoom/Meet) y: detecta que preguntas del template ya fueron respondidas, sugiere preguntas faltantes al consultor en tiempo real, marca bloques completados (Negocio, Operacion, Contenido, Calificacion, Taxonomia).

### 7. Transcripcion + Sintesis automatica post-reunion
Despues de cada reunion: transcripcion automatica (Otter.ai, Fireflies, o Whisper), un agente IA genera un resumen estructurado siguiendo los bloques de la metodologia, identifica dolor principal, quick win, criterios de calificacion implicitos y tipologia macro, y pre-llena el DSD con lo descubierto.

### 8. Generador automatico de propuestas v1 post-Reunion 1
Con la transcripcion y el DSD prellenado, un agente genera automaticamente: Variables v1 (usando el catalogo de variables de la vertical correspondiente), Smart Tags v1 (seleccionados del catalogo de tags de la vertical), Funnel v1 (basado en el template de funnel de la vertical), Scoring v1 (con pesos iniciales segun la vertical), Reglas de derivacion v1. El consultor revisa, ajusta y presenta en la Reunion 2.

### 9. Matriz Respuesta a Configuracion automatica
Un sistema que toma cada respuesta del discovery y automaticamente la mapea a su destino en Prometheo. Ejemplo: "Vende departamentos en pozo" se traduce a tipo_negocio: desarrollista, tipologia_macro: proyecto, base de conocimiento necesita planos y planes de pago.

### 10. Detector de gaps automatico
Antes de la Reunion 2, un agente revisa el DSD y detecta: campos vacios o incompletos, inconsistencias (ej: dice que es B2B pero no definio perfil de comprador), contenidos prometidos pero no recibidos. Genera una lista de "lo que falta resolver en la Reunion 2".

### 11. Generador de agenda personalizada para Reunion 2
Basado en los gaps detectados, genera una agenda adaptada: si el funnel esta validado, menos tiempo en funnel y mas en scoring; si faltan contenidos, incluir bloque de revision de materiales; si hay definiciones ambiguas, incluir ejercicio de "lead bueno vs lead malo".

### 12. Comparador de cliente vs clientes similares
Cuando el consultor esta disenando la propuesta, un agente busca en la base de implementaciones anteriores: "Otros desarrollistas con ticket similar configuraron estas variables...", "En inmobiliarias con venta + alquiler, el funnel que mejor funciono fue...". Acelera las decisiones con benchmarks reales.

---

## FASE 2: DISENO (Configuracion pre-lanzamiento)

### 13. Generador automatico de SCA (Spec de Configuracion del Agente)
Con el DSD aprobado, un agente genera automaticamente el documento SCA completo: personalidad del agente (nombre, tono, registro, locale, emojis), base de conocimiento estructurada, flujos conversacionales basados en la vertical, scoring con pesos, reglas de escalamiento, KPIs a medir.

### 14. Generador de flujos conversacionales
Toma las FAQs del cliente + la vertical + los criterios de calificacion. Genera automaticamente los arboles de decision del agente: flujo de consulta general, flujo de precio/cotizacion, flujo de calificacion, flujo de derivacion. El consultor ajusta y valida.

### 15. Generador de base de conocimiento estructurada
Toma los documentos del cliente (catalogo PDF, lista de precios, brochures). Los procesa y estructura en formato compatible con Prometheo. Extrae: productos, precios, atributos, politicas, FAQs implicitas.

### 16. Validador automatico de configuracion
Antes de pasar a lanzamiento, un agente revisa que: todas las variables definidas en el DSD esten configuradas, todos los Smart Tags tengan descripcion y criterio de deteccion, el funnel tenga transiciones logicas, el scoring sume correctamente, las reglas de derivacion cubran todos los escenarios criticos, no haya conflictos (ej: una variable y un tag con el mismo nombre).

### 17. Generador de mensajes del agente por tono
Dado el tono definido (formal/profesional/amigable/casual) y la vertical: genera todos los mensajes tipo del agente: bienvenida, preguntas de calificacion, respuestas a FAQs, mensajes de derivacion, fuera de horario, etc. En el locale correcto (es-AR, es-MX, etc.).

### 18. Simulador de conversaciones pre-lanzamiento
Un agente simula ser un lead tipico de la vertical y "conversa" con la configuracion del agente. Detecta: respuestas incorrectas, loops, escenarios no cubiertos, derivaciones fallidas. Genera un reporte de QA antes del go-live.

---

## FASE 3: LANZAMIENTO

### 19. Checklist de go-live automatizado
Un workflow que verifica punto por punto: agente configurado en Prometheo, canal de WhatsApp conectado, base de conocimiento cargada, equipo comercial notificado, dashboard activo, protocolo de supervision documentado, capacitacion completada. No permite "activar" hasta que todo este verde.

### 20. Notificaciones automaticas de lanzamiento
Al activar el agente, se dispara: notificacion al equipo comercial del cliente con instrucciones, notificacion al consultor para iniciar supervision, alerta interna en Aurea de nuevo cliente en produccion.

### 21. Monitor de primeras 48 horas
Un agente que vigila las primeras conversaciones y alerta si: el agente no esta respondiendo, tasa de escalamiento mayor al umbral (posible mala configuracion), hay conversaciones sin respuesta, algun flujo esta generando abandono, el vendedor no atiende las derivaciones.

### 22. Daily digest automatico (primera semana)
Cada dia de la primera semana, genera un reporte para el consultor: conversaciones totales, leads calificados, derivaciones realizadas, conversaciones problematicas (para revision manual), Smart Tags mas frecuentes.

### 23. Capacitacion automatizada al equipo del cliente
Videos/guias generados automaticamente segun la configuracion especifica: "Como leer tu dashboard de Prometheo", "Que hacer cuando recibis una derivacion", "Como interpretar el scoring de un lead". Personalizados con las variables y tags del cliente.

---

## FASE 4: MONITOREO Y MEJORA CONTINUA

### 24. Reporte semanal automatico (primeras 4 semanas)
Genera automaticamente: KPIs vs objetivos definidos en el DSD, tendencias de volumen por canal, top consultas del agente, tasa de calificacion y precision, conversaciones que requirieron intervencion humana, recomendaciones de ajuste.

### 25. Reporte quincenal automatico (mes 2-3)
Mas profundo: comparativo con baseline pre-Prometheo, Smart Tags mas y menos frecuentes, scoring: leads calificados vs leads que realmente convirtieron, sugerencias de recalibracion de scoring.

### 26. Reporte mensual ejecutivo (mes 4+)
Para el decision-maker del cliente: ROI de Prometheo (leads atendidos x valor estimado), tiempo de respuesta antes vs despues, leads que se habrian perdido sin el agente (fuera de horario, fines de semana), recomendaciones de expansion.

### 27. Detector de Smart Tags nuevos
Analiza conversaciones reales y detecta patrones recurrentes que no tienen tag: "Hay 47 conversaciones donde el lead pregunta por garantia extendida y no hay tag para eso". Sugiere nuevos tags al consultor.

### 28. Recalibrador de scoring automatico
Compara los leads que el scoring marco como "calificados" con los que realmente compraron. Sugiere ajustes de pesos: "Los leads con #urgente convierten 3x mas. Sugerir subir el peso de urgencia de 15 a 25 pts".

### 29. Detector de variables no usadas
Identifica variables configuradas que nunca se completan o tags que nunca se asignan. "La variable piso_orientacion tiene 0 registros en 30 dias. Eliminar o investigar?"

### 30. Alertas de anomalias
Dispara alertas automaticas si: el volumen cae mas de 30% respecto a la semana anterior, la tasa de escalamiento sube abruptamente, hay leads sin atender por mas de 2h en horario laboral, un vendedor no atiende derivaciones consistentemente.

### 31. Follow-up automatico de leads frios
Identifica leads que quedaron en lead_congelado o lead_inactivo. Dispara secuencia de reactivacion: Dia 7: "Seguis interesado en [proyecto]?", Dia 14: Envio de novedad/promocion, Dia 30: Ultimo intento.

---

## PROCESOS TRANSVERSALES DE AUREA

### 32. Pipeline de clientes de Aurea (CRM interno)
Automatizacion del propio pipeline de Aurea: Prospect, Discovery en curso, Diseno, Lanzamiento, Activo, En renovacion. Alertas si un cliente esta estancado en una fase por mas de X dias.

### 33. Asignacion automatica de consultor
Basado en: vertical del cliente, carga actual del consultor, experiencia en el rubro. Round-robin inteligente con reglas de afinidad.

### 34. Time tracking automatico por cliente
Registra automaticamente horas del consultor por fase: Discovery X horas, Diseno X horas, Lanzamiento X horas, Monitoreo X horas/mes. Sirve para pricing y rentabilidad interna.

### 35. Template library versionada
Repositorio centralizado con: templates de entrevista por vertical, templates de DSD, SCA, reportes, catalogos de variables y tags por vertical, funnels tipo por vertical. Versionado: cuando se mejora un template, se aplica a las futuras implementaciones.

### 36. Base de conocimiento de implementaciones pasadas
Cada implementacion completada alimenta una base: que variables funcionaron y cuales se descartaron, que tags fueron utiles, que scoring convirtio mejor, problemas comunes por vertical. El consultor puede consultar: "Como configuraron X para un corralon similar?"

### 37. Onboarding automatico de nuevos consultores
Cuando se suma alguien a Aurea: acceso automatico a la base de conocimiento, asignacion de los documentos de metodologia, flujo de certificacion: simula un discovery, un diseno y un lanzamiento, mentor asignado automaticamente.

### 38. Generador de propuestas comerciales
Para el equipo comercial de Aurea que vende implementaciones: input: vertical, tamano del equipo, canales, complejidad. Output: propuesta con scope, timeline, precio estimado, deliverables. Basado en promedios reales de implementaciones pasadas.

### 39. NPS / Satisfaction survey automatico
Encuesta automatica al cliente: post-Reunion 2 (el discovery fue util?), post-Lanzamiento dia 7 (como fue la primera semana?), Mes 1 (se cumplio la expectativa a 30 dias?), trimestral (NPS general).

### 40. Renovacion y upsell automatico
Al acercarse el vencimiento del contrato: genera reporte de valor entregado (ROI automatico), sugiere expansiones basadas en datos: "Tiene 30% de leads desde Instagram sin atender, expandir canal", dispara secuencia de renovacion.

---

## AUTOMATIZACIONES DE IA AVANZADAS

### 41. Agente de QA continuo
Un agente que revisa conversaciones aleatorias del agente Prometheo del cliente y evalua: califico correctamente?, derivo cuando debia?, el tono fue adecuado?, dio informacion incorrecta? Genera un "score de calidad" del agente por semana.

### 42. Entrenador automatico del agente
Cuando detecta respuestas incorrectas o suboptimas: genera sugerencia de mejora, propone nuevo contenido para la base de conocimiento, sugiere ajuste de flujo conversacional.

### 43. Benchmark automatico entre clientes
Compara KPIs entre clientes de la misma vertical: "Tu tasa de calificacion es 23%. El promedio en desarrollistas es 35%. Sugerimos revisar los criterios." Anonimizado, solo promedios.

### 44. Predictor de churn de clientes de Aurea
Analiza senales de riesgo: cliente no responde a reportes, baja en el volumen de uso de Prometheo, NPS decreciente. Alerta al consultor para intervenir proactivamente.

### 45. Generador de casos de exito
Toma los datos de un cliente exitoso y genera automaticamente: caso de estudio con metricas reales, before/after. Util para el equipo comercial de Aurea.

---

## RESUMEN DE IMPACTO POR PRIORIDAD

**INMEDIATA**: Intake (#1), Email bienvenida (#4), Transcripcion (#7), Generador propuestas v1 (#8) — Ahorra 3-5h por cliente en discovery

**ALTA**: SCA automatico (#13), Simulador (#18), Checklist go-live (#19), Reportes (#24) — Reduce errores y tiempo en diseno/lanzamiento

**MEDIA**: Recalibrador scoring (#28), Detector tags (#27), Base implementaciones (#36) — Mejora calidad con cada implementacion

**ESTRATEGICA**: Propuestas comerciales (#38), Benchmark (#43), Predictor churn (#44) — Escala el negocio de Aurea
