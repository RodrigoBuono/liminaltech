# ADAPTACION POR VERTICAL

---

## PRINCIPIO TRANSVERSAL: Tipologia Macro

Cada vertical necesita un "eje organizador principal" en el CRM. Sin este eje, el CRM es una lista plana de leads sin estructura. Con este eje, cada lead se conecta a un producto/proyecto/propiedad que tiene sus propios datos, su propio estado y su propia logica.

La tipologia macro responde a la pregunta: **"¿Que es lo que este negocio vende como unidad principal?"**

---

## VERTICAL 1: DESARROLLISTA INMOBILIARIO

### Como es su operacion comercial
* Venden unidades dentro de proyectos inmobiliarios propios (departamentos, casas, lotes, locales)
* Tienen entre 1 y 5 proyectos activos simultaneamente, cada uno en distinta etapa (preventa, en construccion, entregando)
* El ciclo de venta es largo: 2 semanas a 6 meses
* El ticket es alto: USD 50k a 500k+
* Combinan venta directa con intermediacion a traves de inmobiliarias
* Suelen ofrecer financiacion propia (anticipo + cuotas en pesos o dolares)
* El lead necesita mucha informacion antes de decidir: planos, renders, financiacion, avance de obra
* Las objeciones principales son: precio, plazo de entrega, confianza en el desarrollista, moneda de cotizacion

### Tipologia macro: EL PROYECTO / DESARROLLO
* Justificacion: Todo el negocio se organiza alrededor de proyectos. Un mismo desarrollista puede tener "Torres del Parque" y "Altos de Belgrano". Cada proyecto tiene sus propias unidades, precios, financiacion, estado de obra y material comercial. El CRM debe permitir que cada lead quede vinculado al proyecto por el que consulto. Sin esa capa, no se puede medir conversion por proyecto, disponibilidad de unidades ni rendimiento de marketing por desarrollo.
* Debajo del proyecto: unidades individuales (1 amb, 2 amb, cochera, local)
* El agente debe conocer cada proyecto y sus unidades

### Funnel de ventas
* **Nuevo** → El lead acaba de consultar. Se identifico el canal de origen.
* **En calificacion** → El agente esta recopilando datos (perfil, presupuesto, tipo de unidad).
* **Calificado** → El lead tiene perfil, presupuesto compatible, e interes real.
* **Visita agendada** → Se programo visita a showroom/obra.
* **Visita realizada** → Se concreto la visita. Se registra feedback.
* **En negociacion** → El lead hizo una reserva verbal, pidio condiciones especiales, o esta evaluando financiacion.
* **Reserva/Seña** → Firmo boleto de reserva o dejo seña.
* **Escriturado/Cerrado** → Se formalizo la operacion.
* **Descartado** → Lead no viable. Se registra motivo.
* **Congelado** → Lead viable pero no ahora. Se programa reactivacion.

### Variables estructurales criticas
* **De negocio**: `proyecto` (nombre), `tipo_desarrollo` (residencial, comercial, lotes, mixto)
* **De producto**: `tipologia_unidad` (monoambiente, 2amb, 3amb, local, cochera), `metraje`, `piso`, `orientacion`, `precio_lista_usd`, `estado_unidad` (disponible, reservada, vendida)
* **Del lead**: `nombre`, `telefono`, `email`, `perfil_comprador` (inversor / usuario_final), `presupuesto_rango`
* **De intencion**: `proyecto_interes`, `tipologia_buscada`, `forma_pago_preferida` (contado, financiado, permuta)
* **De embudo**: `etapa_funnel`, `fecha_primer_contacto`, `fecha_ultima_actividad`
* **De atribucion**: `canal_origen`, `campana_origen`, `referido_por`
* **De routing**: `vendedor_asignado`, `inmobiliaria_intermediaria` (si aplica)
* **De urgencia**: `urgencia` (inmediata, 1-3 meses, 6+ meses, indefinida)
* **De prioridad**: `prioridad` (alta, media, baja) — calculada por scoring

### Smart Tags criticas
* **Intencion**: `#consulta_general`, `#consulta_especifica_unidad`, `#quiere_conocer_proyecto`
* **Objeciones**: `#objecion_precio`, `#objecion_plazo_entrega`, `#objecion_moneda`, `#objecion_zona`, `#objecion_confianza`
* **Tipo de consulta**: `#pidio_precio`, `#pidio_plano`, `#pidio_financiacion`, `#pidio_disponibilidad`, `#pidio_visita`
* **Producto**: `#interesa_[nombre_proyecto]`, `#interesa_monoambiente`, `#interesa_2amb`, `#interesa_cochera`
* **Interes alto**: `#listo_para_reservar`, `#ya_visito`, `#vuelve_a_consultar`, `#trajo_referido`
* **Comparacion**: `#menciono_competencia`, `#comparando_proyectos`, `#vio_otro_desarrollo`
* **Financiamiento**: `#consulta_financiacion`, `#necesita_credito_hipotecario`, `#ofrece_permuta`, `#pago_contado`
* **Urgencia**: `#urgente`, `#explorando`, `#para_inversion_largo_plazo`
* **Riesgo**: `#lead_frio_reactivado`, `#no_contesta`, `#pide_condiciones_fuera_rango`
* **Derivacion humana**: `#pide_hablar_persona`, `#negociacion_precio`, `#consulta_legal`

### Senales de lead calificado
* Tiene presupuesto compatible con el rango del proyecto
* Identifico el tipo de unidad que busca
* Confirmo si es inversor o usuario final
* Pregunto por financiacion concreta (no generica)
* Solicito visita
* Volvio a consultar despues de la primera interaccion

### Senales de lead no listo / exploratorio
* Pregunta generica ("¿cuanto salen los departamentos?") sin dar ningún dato propio
* No responde a preguntas del agente
* Presupuesto incompatible
* Dijo "estoy viendo opciones, nada urgente"
* Consulto por un proyecto que no existe o esta agotado

### Reglas de derivacion humana
* Lead calificado con score >= umbral → notificacion inmediata a vendedor asignado
* Consulta sobre contrato, aspectos legales, escrituracion → siempre humano
* Negociacion de precio o condiciones especiales → siempre humano
* Permuta → siempre humano (requiere tasacion)
* Lead que pide explicitamente hablar con una persona
* Lead VIP (referido de cliente existente, inversor recurrente)

### Contenidos que debe manejar el agente
* Brochure/ficha de cada proyecto activo
* Planos de cada tipologia de unidad
* Grilla de precios actualizada (o rangos si los precios exactos son confidenciales)
* Planes de financiacion vigentes
* Avance de obra (porcentaje, fecha estimada entrega)
* Ubicacion y mapa del proyecto
* Amenities y especificaciones

### Cosas que nunca debe responder sin validacion humana
* Precio exacto de una unidad especifica (si el desarrollista lo considera confidencial)
* Condiciones de permuta
* Descuentos sobre precio de lista
* Plazos contractuales
* Clausulas de rescision
* Estado legal del terreno o proyecto

### KPIs estrategicos, operativos y de performance
* **Estrategicos**: Conversion total (lead → escritura), revenue por proyecto, CPL y CPA por canal, velocidad de venta (unidades/mes por proyecto)
* **Operativos**: Tiempo de primera respuesta, tasa de calificacion, visitas agendadas/mes, conversion consulta → visita, conversion visita → reserva
* **De performance del agente**: % consultas resueltas sin humano, precision de calificacion, tasa de escalamiento, tiempo de calificacion promedio

### Diferencias clave vs los demas rubros
* Ciclo de venta el mas largo de los 4 rubros
* Ticket mas alto → decision mas reflexiva, mas objeciones, mas interacciones
* La "unidad de venta" se agota (una vez vendido un depto, no se puede vender de nuevo)
* La financiacion propia es un eje central de la conversacion
* El perfil inversor vs usuario final genera dos logicas de venta distintas

---

## VERTICAL 2: INMOBILIARIA

### Como es su operacion comercial
* Intermedian operaciones de compra, venta y alquiler de propiedades de terceros
* Manejan carteras de decenas a cientos de propiedades simultaneamente
* Tienen corredores/agentes que se especializan por zona o tipo
* Reciben consultas masivas desde portales (ZonaProp, ArgenProp, ML) ademas de redes y WhatsApp
* El ciclo de venta varía: alquiler (1-4 semanas), venta (1-6 meses)
* La velocidad de respuesta es la ventaja competitiva #1 (el lead consulta en 3 inmobiliarias a la vez)
* La gestion de visitas es critica y costosa (no-shows, coordinacion de llaves)

### Tipologia macro: LA PROPIEDAD
* Justificacion: A diferencia del desarrollista (que organiza por proyecto), la inmobiliaria organiza por propiedad individual. Cada propiedad tiene su propia ficha, su propio estado (disponible, reservada, vendida, alquilada), su propio propietario, y genera sus propias consultas. El CRM debe vincular cada lead a la/las propiedad/es que consulto. Esto permite medir cuales propiedades generan mas interes, cuales estan "dormidas", y optimizar la cartera.
* Una misma propiedad puede tener multiples leads asociados
* Un mismo lead puede estar interesado en multiples propiedades

### Funnel de ventas (VENTA)
* **Nuevo** → Lead llego por portal, redes, o contacto directo
* **En calificacion** → Se identifico tipo de operacion, zona, presupuesto
* **Calificado** → Match con propiedades. Perfil compatible.
* **Visita agendada** → Se coordino visita a propiedad/es
* **Visita realizada** → Se concreto. Feedback registrado.
* **Interesado post-visita** → Le intereso. Pidiendo info adicional o evaluando.
* **Oferta realizada** → Presento oferta formal
* **En negociacion** → Contraoferta, condiciones, acuerdo en proceso
* **Reserva** → Seña depositada
* **Escriturado/Cerrado** → Operacion formalizada
* **Descartado** → No viable
* **Congelado** → Viable pero no ahora

### Funnel de ventas (ALQUILER)
* **Nuevo** → Consulto por alquiler
* **En calificacion** → Se identifico zona, presupuesto, garantia
* **Calificado** → Tiene garantia compatible, presupuesto compatible
* **Visita agendada** → Se coordino visita
* **Visita realizada** → Feedback registrado
* **Documentacion en proceso** → Entrego papeles para evaluacion
* **Aprobado** → Garantia y documentacion OK
* **Contrato firmado** → Operacion cerrada
* **Descartado** → No viable (sin garantia, presupuesto insuficiente)

### Variables estructurales criticas
* **De negocio**: `tipo_operacion` (venta, alquiler, tasacion), `propiedad_id`
* **De producto**: `tipo_propiedad` (depto, casa, PH, local, oficina, terreno, country), `zona_propiedad`, `ambientes`, `metros_cubiertos`, `precio_publicado`, `expensas`, `estado_propiedad` (disponible, reservada, en negociacion, cerrada)
* **Del lead**: `nombre`, `telefono`, `email`, `perfil` (comprador, inquilino, inversor, propietario_vendedor)
* **De intencion**: `tipo_operacion_buscada`, `zona_busqueda`, `ambientes_buscados`, `presupuesto_maximo`, `tiene_garantia` (si/no, tipo)
* **De embudo**: `etapa_funnel`, `fecha_primer_contacto`
* **De atribucion**: `canal_origen`, `portal_origen` (ZonaProp, ArgenProp, ML, web, IG), `aviso_origen` (URL del aviso)
* **De routing**: `corredor_asignado`, `zona_asignacion`

### Smart Tags criticas
* **Intencion**: `#quiere_comprar`, `#quiere_alquilar`, `#quiere_vender`, `#quiere_tasar`
* **Objeciones**: `#objecion_precio`, `#objecion_ubicacion`, `#objecion_estado_propiedad`, `#objecion_expensas`, `#objecion_garantia`
* **Tipo de consulta**: `#consulta_disponibilidad`, `#pidio_precio`, `#pidio_visita`, `#consulta_requisitos_alquiler`, `#consulta_expensas`
* **Producto**: `#interesa_[id_propiedad]`, `#busca_monoambiente`, `#busca_3amb_con_cochera`
* **Interes alto**: `#ya_visito`, `#quiere_segunda_visita`, `#pidio_documentacion`, `#hizo_oferta`
* **Comparacion**: `#viendo_otras_propiedades`, `#menciono_otra_inmobiliaria`
* **Urgencia**: `#necesita_mudarse_ya`, `#contrato_vence_pronto`, `#sin_apuro`
* **Derivacion**: `#pide_hablar_corredor`, `#quiere_negociar_precio`, `#contraoferta`

### Senales de lead calificado
* **Venta**: Tiene presupuesto compatible, zona definida, tipo de propiedad claro, pidio visita
* **Alquiler**: Tiene garantia, presupuesto compatible, fecha de mudanza cercana, pidio visita

### Senales de lead no listo
* Consulto por propiedad no disponible y no acepto alternativas
* Presupuesto muy por debajo del mercado
* No tiene garantia y no sabe como resolver (alquiler)
* "Estoy empezando a buscar, nada urgente"

### Reglas de derivacion
* Negociacion de precio → corredor asignado
* Contraoferta → corredor asignado + supervisor
* Evaluacion de garantia → administracion
* Consulta de propietario (quiere vender/alquilar su propiedad) → captacion
* Reclamo de inquilino existente → administracion, no ventas

### Contenidos del agente
* Fichas de propiedades activas (fotos, datos, precios)
* Requisitos de garantia vigentes
* Zonas de cobertura
* Guia de documentacion necesaria
* Info de expensas por propiedad

### Nunca sin validacion humana
* Precio de contraoferta
* Condiciones fuera del contrato estandar
* Informacion del propietario
* Decisiones sobre aceptacion de garantia

### KPIs
* **Estrategicos**: Operaciones cerradas/mes, facturacion por comisiones, conversion total
* **Operativos**: Visitas agendadas/semana, tasa de no-show, tiempo de respuesta por canal, leads por corredor
* **Performance agente**: Respuestas automaticas vs escalamientos, visitas agendadas por agente, precision de match propiedad

### Diferencias clave
* Volumen de propiedades mucho mayor que desarrollista (decenas/cientos vs unidades)
* Dos logicas de negocio completamente distintas (venta vs alquiler)
* Dependencia fuerte de portales inmobiliarios como fuente de leads
* La visita es el momento clave del funnel (no la cotizacion ni la reserva)
* La velocidad de respuesta es el diferencial #1

---

## VERTICAL 3: MOBILIARIO

### Como es su operacion comercial
* Venden muebles y equipamiento (hogar, oficina, exterior, cocina, bano)
* Pueden fabricar, revender, o ambos
* Combinan local fisico con e-commerce y redes sociales (Instagram es canal clave)
* El ticket es medio: $50k a $2M+ dependiendo del producto
* El ciclo de venta es corto para productos estandar (horas a dias) y medio para a medida (1-4 semanas)
* Las consultas principales son por precio, stock y envio
* Muchos leads llegan por Instagram viendo una foto y preguntando "¿cuanto sale?"

### Tipologia macro: LA LINEA DE PRODUCTO / CATEGORIA
* Justificacion: A diferencia de inmobiliario donde cada propiedad es unica, en mobiliario los productos se agrupan por lineas o categorias. Una empresa puede tener la linea "Escandinavo", la linea "Industrial", la linea "Infantil". Cada linea tiene sus propios productos, materiales, precios y publico. El CRM debe permitir vincular cada lead a la linea/categoria por la que consulto. Esto permite medir que lineas generan mas interes, cuales convierten mejor, y optimizar el catalogo.
* Debajo de la linea: productos individuales (mesa X, sillon Y, combo Z)
* Si hacen a medida, agregar subcategoria "a medida" con sus propias variables (medidas, material, acabado)

### Funnel de ventas
* **Nuevo** → Consulto por producto/precio
* **En calificacion** → Se identifico producto de interes, presupuesto, tipo de comprador
* **Cotizacion enviada** → Se envio presupuesto formal
* **En seguimiento** → Cotizacion enviada, esperando decision
* **Confirmado/Pagado** → Confirmo compra y pago (total o seña)
* **En produccion** → Si es a medida, el producto se esta fabricando
* **Listo para entrega** → Producto disponible para enviar/retirar
* **Entregado** → Se concreto la entrega
* **Descartado** → No compro. Se registra motivo.

### Variables estructurales criticas
* **De negocio**: `tipo_producto` (estandar, a_medida, combo)
* **De producto**: `linea_producto`, `producto_especifico`, `material`, `color`, `precio_lista`, `stock_disponible` (si/no)
* **Del lead**: `nombre`, `telefono`, `email`, `tipo_comprador` (particular, arquitecto, disenador, empresa)
* **De intencion**: `producto_interes`, `presupuesto_rango`, `espacio_destino` (living, dormitorio, oficina, comercio)
* **De embudo**: `etapa_funnel`, `nro_cotizacion`
* **De atribucion**: `canal_origen` (Instagram, WhatsApp, ML, web, local, referido)
* **De routing**: `vendedor_asignado`
* **De logistica**: `zona_entrega`, `necesita_armado` (si/no), `fecha_entrega_estimada`

### Smart Tags criticas
* **Intencion**: `#quiere_comprar`, `#solo_cotiza`, `#proyecto_amoblamiento`
* **Objeciones**: `#objecion_precio`, `#objecion_plazo_entrega`, `#objecion_envio`, `#no_tiene_medidas`
* **Tipo de consulta**: `#pidio_precio`, `#pidio_catalogo`, `#consulta_stock`, `#consulta_envio`, `#consulta_medida`, `#consulta_color`, `#consulta_armado`
* **Producto**: `#interesa_[linea]`, `#quiere_a_medida`, `#pidio_combo`
* **Interes alto**: `#pidio_cotizacion_formal`, `#pregunto_plazo_pago`, `#volvio_a_consultar`, `#trajo_medidas`
* **Comparacion**: `#menciono_competencia`, `#comparo_precios`
* **Financiamiento**: `#pregunto_cuotas`, `#pregunto_mercadopago`, `#necesita_factura`
* **Urgencia**: `#necesita_rapido`, `#tiene_fecha_mudanza`, `#sin_apuro`
* **Postventa**: `#tracking_pedido`, `#reclamo_entrega`, `#reclamo_calidad`, `#devolucion`
* **Derivacion**: `#medida_compleja`, `#proyecto_grande`, `#descuento_mayorista`

### Senales de lead calificado
* Identifico producto especifico
* Pregunto por forma de pago o plazo de entrega
* Tiene medidas del espacio (si es a medida)
* Volvio a consultar despues de recibir cotizacion
* Pidio factura (senal B2B)

### Senales de lead no listo
* Solo pregunto "¿cuanto sale?" y no interactuo mas
* Presupuesto declarado muy por debajo del rango
* "Estoy viendo opciones para mas adelante"
* No responde al follow-up de cotizacion

### Reglas de derivacion
* Medida a medida compleja → diseñador/vendedor especializado
* Proyecto de amoblamiento completo → vendedor senior
* Descuento por volumen → gerente comercial
* Reclamo de calidad → soporte/postventa
* Devolucion → administracion

### Contenidos del agente
* Catalogo con fotos, medidas, materiales, colores, precios
* Info de envio (zonas, costos, tiempos)
* Formas de pago aceptadas
* Politica de devolucion/garantia
* Combos y promociones vigentes
* Guia "como tomar medidas" (para a medida)

### Nunca sin validacion humana
* Descuento fuera de tabla
* Compromiso de fecha de entrega exacta para a medida
* Aceptacion de devolucion fuera de politica
* Presupuesto de proyecto grande (amoblamiento completo)

### KPIs
* **Estrategicos**: Facturacion/mes, ticket promedio, conversion total, productos mas vendidos
* **Operativos**: Cotizaciones enviadas/mes, conversion cotizacion → venta, tiempo de respuesta, consultas por canal
* **Performance agente**: % consultas de precio resueltas, cotizaciones auto-generadas, tasa de escalamiento, follow-ups enviados

### Diferencias clave
* Canal Instagram mucho mas relevante que en los otros rubros
* El catalogo es visual (fotos importan mas que texto)
* Coexistencia de venta estandar (rapida) y a medida (lenta) genera dos flujos distintos
* La postventa es mas activa (seguimiento de entrega, armado, reclamos)
* Marketplace (ML) tiene sus propias reglas de comunicacion

---

## VERTICAL 4: VENTA DE INSUMOS Y MATERIALES DE CONSTRUCCION

### Como es su operacion comercial
* Venden materiales de construccion (cemento, hierro, sanitarios, electricos, pintura, herramientas)
* Pueden ser corralon generalista, distribuidora especializada, o ferreteria industrial
* Manejan miles de SKUs con precios que cambian frecuentemente
* Los clientes son mixtos: particulares (B2C) y profesionales/constructoras (B2B)
* El canal principal es WhatsApp (lejos el #1)
* El ciclo de venta es el mas corto de los 4 rubros: minutos a horas para venta unitaria
* Los clientes B2B compran recurrentemente y muchos tienen cuenta corriente
* La consulta mas frecuente del universo: "¿a cuanto esta el bolson de cemento?"

### Tipologia macro: LA CATEGORIA DE PRODUCTO / FAMILIA
* Justificacion: Un corralon no se organiza por "proyecto" ni por "propiedad". Se organiza por familias de productos: obra gruesa (cemento, hierro, ladrillos), sanitarios, electricos, pinturas, terminaciones, herramientas. Cada familia tiene su propia dinamica de precios, sus propios proveedores, y sus propios compradores tipicos. El CRM debe permitir que cada consulta/lead quede vinculado a la familia/categoria de producto. Esto permite medir cuales familias generan mas consultas, cuales convierten mejor, y donde estan los margenes.
* Debajo de la familia: productos individuales (bolson Portland, hierro del 8, ceramica X)
* Los precios de algunas familias (hierro, cemento) fluctuan semanalmente; otras son mas estables

### Funnel de ventas
* **Nuevo** → Consulto por precio/producto
* **En calificacion** → Se identifico tipo de comprador, producto, volumen
* **Cotizacion enviada** → Se paso precio o presupuesto de lista
* **Confirmado** → Confirmo el pedido
* **En preparacion** → Pedido en proceso de armado
* **En entrega / Para retiro** → Listo para despachar
* **Entregado** → Se concreto
* **Descartado** → No compro (fue a otro corralon, solo cotizaba)

*Nota: El funnel es mas corto y rapido que en los otros rubros. Muchas veces la venta se cierra en la misma conversacion.*

### Variables estructurales criticas
* **De negocio**: `tipo_cliente` (particular, contratista, constructora, arquitecto, reventa)
* **De producto**: `familia_producto`, `producto_especifico`, `marca`, `unidad_medida`, `precio_unitario`, `precio_por_cantidad` (escalas)
* **Del lead**: `nombre`, `telefono`, `empresa_obra`, `tiene_cuenta_corriente` (si/no)
* **De intencion**: `productos_solicitados`, `cantidad`, `tipo_compra` (unitaria, lista, proyecto_obra)
* **De embudo**: `etapa_funnel`
* **De atribucion**: `canal_origen` (WhatsApp, telefono, mostrador, web)
* **De routing**: `vendedor_asignado`
* **De logistica**: `zona_entrega`, `tipo_entrega` (retira, envio), `direccion_obra`
* **De urgencia**: `urgencia` (para hoy, esta semana, sin fecha)
* **De recurrencia**: `es_cliente_recurrente` (si/no), `frecuencia_compra`

### Smart Tags criticas
* **Intencion**: `#consulta_precio`, `#pide_cotizacion_lista`, `#quiere_comprar_ya`, `#solo_averigua`
* **Objeciones**: `#objecion_precio`, `#pide_descuento`, `#comparo_con_otro_corralon`, `#objecion_flete`
* **Tipo de consulta**: `#precio_unitario`, `#precio_por_cantidad`, `#consulta_stock`, `#consulta_marca`, `#consulta_envio`, `#consulta_cuenta_corriente`, `#consulta_horario`
* **Producto**: `#familia_obra_gruesa`, `#familia_sanitarios`, `#familia_electricos`, `#familia_pintura`, `#familia_herramientas`
* **Interes alto**: `#lista_materiales`, `#volumen_grande`, `#obra_en_curso`, `#compra_recurrente`
* **Comparacion**: `#precio_competencia`, `#cotizo_en_otro_corralon`
* **Financiamiento**: `#consulta_cta_corriente`, `#pide_plazo`, `#pago_transferencia`, `#pago_efectivo`
* **Urgencia**: `#necesita_hoy`, `#obra_parada`, `#pedido_programado`
* **Postventa**: `#tracking_envio`, `#reclamo_faltante`, `#reclamo_producto_danado`, `#devolucion`
* **Derivacion**: `#descuento_especial`, `#apertura_cta_cte`, `#credito`, `#reclamo_grave`

### Senales de lead calificado (alta prioridad)
* Es contratista o constructora (B2B = mayor ticket y recurrencia)
* Envio lista de materiales (no solo pregunta por un producto)
* Menciono obra en curso o direccion de entrega
* Compra volumen significativo
* Pidio abrir cuenta corriente
* Es cliente recurrente que vuelve a comprar

### Senales de lead de baja prioridad
* Pregunto precio de un solo producto y no interactuo mas
* Particular que "esta viendo" sin urgencia
* Presupuesto incompatible con minimos
* Pidio un producto que no manejan

### Reglas de derivacion
* Descuento fuera de tabla → dueño/gerente
* Apertura de cuenta corriente → administracion
* Pedido de obra grande (>$X monto) → vendedor senior
* Reclamo por faltante o daño → logistica/administracion
* Consulta tecnica especializada → vendedor de rubro especifico

### Contenidos del agente
* Lista de precios actualizada (por familia de producto)
* Stock disponible (al menos de los productos estrella)
* Zonas de entrega y costos de flete
* Horarios de atencion
* Formas de pago aceptadas
* Marcas que manejan
* Escalas de precio por volumen

### Nunca sin validacion humana
* Descuento sobre precio de lista
* Aprobacion de credito en cuenta corriente
* Compromiso de entrega en fecha/hora exacta para obra
* Precios de productos con cotizacion volatil (hierro, aluminio) si el cliente pide "congelar"
* Cotizacion de proyecto completo de obra (>50 items)

### KPIs
* **Estrategicos**: Facturacion diaria/mensual, ticket promedio (B2B vs B2C), clientes activos, tasa de recompra
* **Operativos**: Consultas/dia, cotizaciones/dia, conversion cotizacion → pedido, tiempo de respuesta, entregas/dia
* **Performance agente**: % consultas de precio auto-resueltas, precision de precios, listas procesadas, tasa de escalamiento, deteccion de clientes B2B

### Diferencias clave
* Ciclo de venta mas corto de los 4 rubros (minutos a horas, no semanas)
* Precios dinamicos: el agente necesita datos actualizados constantemente
* Volumen de consultas el mas alto (cientos por dia en un corralon activo)
* B2B vs B2C requiere logicas de precio y atencion completamente distintas
* La recurrencia es alta: el mismo cliente vuelve cada semana
* El "lead" clasico (persona nueva que entra al funnel) convive con el "cliente recurrente" (ya compro antes)
* WhatsApp domina absolutamente; casi no hay portales ni redes como fuente principal
