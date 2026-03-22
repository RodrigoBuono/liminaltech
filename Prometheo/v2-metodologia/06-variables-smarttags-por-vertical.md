# DISENO DE VARIABLES Y SMART TAGS POR VERTICAL

---

## Criterio: Por que algo es Variable y no Smart Tag (y viceversa)

### Variable
* Es un dato **estructural, unico y principal** por lead o conversacion
* Solo puede tener **un valor a la vez** (o un valor vacio)
* Es **estable**: una vez asignado, no cambia con frecuencia
* Sirve para **segmentar, filtrar y agrupar** en reportes
* Ejemplos: nombre, presupuesto, tipo de comprador, proyecto de interes, canal de origen
* Analogia: Es la "columna de un Excel". Cada lead tiene un valor en esa columna.

### Smart Tag
* Es una **situacion, intencion, objecion o patron** detectado en la conversacion
* Puede haber **multiples tags** en una misma conversacion
* Es **dinamico**: se agrega cada vez que se detecta el patron
* Sirve para **analizar patrones, frecuencias y correlaciones**
* Ejemplos: pidio precio, menciono competencia, objecion de plazo, consulto financiacion
* Analogia: Es una "etiqueta de Gmail". Un email puede tener varias etiquetas a la vez.

### Regla de decision rapida
* ¿El dato identifica o segmenta al lead? → **Variable**
* ¿El dato describe algo que paso en la conversacion? → **Smart Tag**
* ¿Puede tener solo un valor? → **Variable**
* ¿Pueden coexistir varios en la misma conversacion? → **Smart Tag**
* ¿Lo necesito para filtrar "dame todos los leads de X"? → **Variable**
* ¿Lo necesito para entender "que pasa en las conversaciones"? → **Smart Tag**

---

## DESARROLLISTA INMOBILIARIO

### Variables

**De negocio**
* `proyecto` — Nombre del desarrollo por el que consulto (ej: "Torres del Parque", "Altos de Belgrano"). Es la tipologia macro. Justificacion: permite medir conversion, interes y rendimiento por proyecto.
* `tipo_desarrollo` — Residencial, comercial, lotes, mixto. Justificacion: segmenta la cartera por tipo.

**De producto**
* `tipologia_unidad` — Monoambiente, 1 dormitorio, 2 dormitorios, 3 dormitorios, local, cochera, baulera. Justificacion: dato critico para match y disponibilidad.
* `piso_orientacion` — Si aplica. Algunas unidades valen mas por esto.
* `precio_lista_usd` — Precio publicado de la unidad de interes. Justificacion: permite calcular desviacion de presupuesto.

**Del lead**
* `nombre` — Nombre completo
* `telefono` — Numero de contacto principal
* `email` — Correo electronico
* `perfil_comprador` — Inversor / Usuario final / Indefinido. Justificacion: Variable porque define la logica de venta completa. No es tag porque un lead no es inversor Y usuario final a la vez.

**De intencion**
* `presupuesto_rango` — Rango de inversion declarado (ej: USD 80-120k). Justificacion: Variable porque es un dato unico del lead que determina match.
* `forma_pago_preferida` — Contado / Financiado / Permuta / Credito hipotecario. Justificacion: impacta directamente en la cotizacion y el flujo.
* `proyecto_interes` — Cual proyecto le interesa (redundante con `proyecto` pero puede diferir si el lead cambio de interes).

**De embudo**
* `etapa_funnel` — Nuevo, En calificacion, Calificado, Visita agendada, Visita realizada, En negociacion, Reserva, Escriturado, Descartado, Congelado
* `fecha_primer_contacto` — Timestamp
* `fecha_ultima_actividad` — Timestamp
* `motivo_descarte` — Si aplica: sin presupuesto, sin interes, compro en otro lado, no contesta

**De atribucion**
* `canal_origen` — WhatsApp, Instagram, Web, Portal, Google Ads, Meta Ads, Referido, Sala de ventas
* `campana_origen` — Nombre de campana si viene de paid media

**De routing**
* `vendedor_asignado` — Nombre del comercial responsable
* `inmobiliaria_intermediaria` — Si llego por una inmobiliaria aliada

**De urgencia**
* `urgencia` — Inmediata (<30 dias), Corto plazo (1-3 meses), Mediano plazo (3-6 meses), Largo plazo (6+ meses), Explorando

**De prioridad**
* `prioridad` — Alta, Media, Baja (calculada por scoring)

### Smart Tags

**Intencion**
* `#consulta_general` — Pregunta generica sobre el proyecto
* `#consulta_unidad_especifica` — Pregunta por una unidad puntual
* `#quiere_conocer_proyecto` — Expresó interes en informarse

**Objeciones**
* `#objecion_precio` — "Es caro", "no me da el presupuesto"
* `#objecion_plazo_entrega` — "Tarda mucho", "cuando entregan?"
* `#objecion_moneda` — "Solo tengo pesos", "no quiero en dolares"
* `#objecion_zona` — "Esa zona no me convence"
* `#objecion_confianza` — "No conozco la empresa", "que garantia tengo?"
* `#objecion_financiacion` — "Las cuotas son muy altas", "necesito mas plazo"

**Tipo de consulta**
* `#pidio_precio` — Pregunto por el precio
* `#pidio_plano` — Pidio plano de planta
* `#pidio_financiacion` — Consulto por planes de pago
* `#pidio_disponibilidad` — Pregunto que unidades hay
* `#pidio_visita` — Quiere visitar showroom/obra
* `#pidio_brochure` — Pidio material comercial
* `#pidio_avance_obra` — Consulto estado de construccion

**Producto / Proyecto**
* `#interesa_[nombre_proyecto]` — Un tag por proyecto activo
* `#interesa_monoambiente`, `#interesa_2amb`, `#interesa_3amb`, `#interesa_cochera`

**Interes alto**
* `#listo_para_reservar` — Señales claras de decision
* `#ya_visito` — Ya fue al showroom/obra
* `#volvio_a_consultar` — Retomo contacto despues de dias/semanas
* `#trajo_referido` — Recomendo a alguien

**Comparacion**
* `#menciono_competencia` — Nombro otro desarrollo
* `#comparando_proyectos` — Esta evaluando opciones
* `#pregunto_diferencial` — Quiere saber por que elegirlos

**Financiamiento**
* `#consulta_anticipo` — Pregunto cuanto es el anticipo
* `#consulta_cuotas` — Pregunto cantidad y monto de cuotas
* `#necesita_credito` — Necesita financiacion bancaria
* `#ofrece_permuta` — Ofrece propiedad a cuenta
* `#pago_contado` — Puede pagar todo de contado

**Urgencia**
* `#urgente` — Necesita resolver rapido
* `#explorando` — Solo esta mirando
* `#para_inversion` — Busca renta/revalorizacion, sin apuro de habitar

**Riesgo**
* `#lead_frio` — Muchos dias sin actividad
* `#no_contesta` — No responde a follow-up
* `#fuera_rango_presupuesto` — Presupuesto muy por debajo

**Derivacion humana**
* `#pide_hablar_persona` — Solicito atencion humana
* `#negociacion_precio` — Quiere negociar condiciones
* `#consulta_legal` — Pregunta sobre contratos, escritura
* `#tema_sensible` — Reclamo, queja, conflicto

---

## INMOBILIARIA

### Variables

**De negocio**
* `tipo_operacion` — Venta / Alquiler / Tasacion. Justificacion: Variable porque define el funnel completo. Un lead no busca comprar y alquilar al mismo tiempo (en general).
* `propiedad_id` — Identificador de la propiedad consultada. Es la tipologia macro.

**De producto**
* `tipo_propiedad` — Departamento, Casa, PH, Local, Oficina, Terreno, Country/Barrio cerrado
* `zona_propiedad` — Barrio/localidad de la propiedad
* `ambientes` — Cantidad de ambientes
* `metros_cubiertos` — Superficie
* `precio_publicado` — Precio de publicacion
* `expensas` — Monto de expensas
* `estado_propiedad` — Disponible, Reservada, En negociacion, Cerrada, Suspendida

**Del lead**
* `nombre`, `telefono`, `email`
* `perfil` — Comprador / Inquilino / Inversor / Propietario vendedor / Propietario que alquila

**De intencion**
* `tipo_operacion_buscada` — Comprar / Alquilar (puede diferir de la propiedad consultada)
* `zona_busqueda` — Donde quiere vivir/comprar (puede diferir de la propiedad consultada)
* `ambientes_buscados` — Cuantos ambientes busca
* `presupuesto_maximo` — Techo de presupuesto
* `tiene_garantia` — Si/No/Tipo (solo para alquiler)
* `plazo_mudanza` — Cuando quiere mudarse

**De embudo**
* `etapa_funnel_venta` — Nuevo, Calificado, Visita agendada, Visita realizada, Oferta, Negociacion, Reserva, Escriturado, Descartado
* `etapa_funnel_alquiler` — Nuevo, Calificado, Visita agendada, Visita realizada, Documentacion, Aprobado, Contrato firmado, Descartado

**De atribucion**
* `canal_origen` — WhatsApp, ZonaProp, ArgenProp, ML, Instagram, Web, Referido, Cartel
* `portal_origen` — Portal especifico
* `aviso_origen` — URL o ID del aviso

**De routing**
* `corredor_asignado` — Corredor responsable
* `zona_asignacion` — Si se asigna por zona

### Smart Tags

**Intencion**
* `#quiere_comprar`, `#quiere_alquilar`, `#quiere_vender`, `#quiere_tasar`

**Objeciones**
* `#objecion_precio`, `#objecion_ubicacion`, `#objecion_estado`, `#objecion_expensas`, `#objecion_garantia`, `#objecion_luminosidad`, `#objecion_ruido`

**Tipo de consulta**
* `#consulta_disponibilidad`, `#pidio_precio`, `#pidio_visita`, `#pidio_fotos`, `#consulta_requisitos_alquiler`, `#consulta_expensas`, `#consulta_estado_propiedad`

**Producto**
* `#interesa_[id_propiedad]`, `#busca_con_cochera`, `#busca_con_balcon`, `#busca_con_patio`, `#busca_luminoso`

**Interes alto**
* `#ya_visito`, `#quiere_segunda_visita`, `#pidio_documentacion`, `#hizo_oferta`, `#acepta_condiciones`

**Comparacion**
* `#viendo_otras_propiedades`, `#menciono_otra_inmobiliaria`, `#comparo_precios_zona`

**Urgencia**
* `#necesita_mudarse_ya`, `#contrato_vence_pronto`, `#sin_apuro`, `#explorando_mercado`

**Postventa**
* `#consulta_contrato`, `#reclamo_propiedad`, `#consulta_administracion`

**Derivacion**
* `#pide_hablar_corredor`, `#quiere_negociar_precio`, `#contraoferta`, `#consulta_legal`, `#evaluacion_garantia`

---

## MOBILIARIO

### Variables

**De negocio**
* `tipo_producto` — Estandar / A medida / Combo. Justificacion: Variable porque define el flujo de venta completamente distinto.

**De producto**
* `linea_producto` — Nombre de la linea/categoria. Es la tipologia macro.
* `producto_especifico` — Nombre/codigo del producto puntual
* `material` — Madera, melamina, hierro, etc.
* `color` — Color seleccionado
* `medidas` — Medidas del producto o del espacio (si es a medida)
* `precio_lista` — Precio publicado
* `stock_disponible` — Si/No

**Del lead**
* `nombre`, `telefono`, `email`
* `tipo_comprador` — Particular / Arquitecto / Disenador / Empresa / Reventa

**De intencion**
* `producto_interes` — Que producto le interesa
* `presupuesto_rango` — Cuanto quiere gastar
* `espacio_destino` — Living, dormitorio, cocina, oficina, comercio, exterior

**De embudo**
* `etapa_funnel` — Nuevo, Cotizacion enviada, En seguimiento, Confirmado, En produccion, Listo entrega, Entregado, Descartado

**De atribucion**
* `canal_origen` — Instagram, WhatsApp, ML, Web, Local fisico, Referido, Google

**De routing**
* `vendedor_asignado`

**De logistica**
* `zona_entrega`, `necesita_armado` (Si/No), `fecha_entrega_estimada`

### Smart Tags

**Intencion**
* `#quiere_comprar`, `#solo_cotiza`, `#proyecto_amoblamiento`, `#regaleria`

**Objeciones**
* `#objecion_precio`, `#objecion_plazo_entrega`, `#objecion_envio`, `#objecion_color_no_disponible`, `#no_tiene_medidas`

**Tipo de consulta**
* `#pidio_precio`, `#pidio_catalogo`, `#consulta_stock`, `#consulta_envio`, `#consulta_medida`, `#consulta_color`, `#consulta_material`, `#consulta_armado`, `#consulta_garantia`

**Producto**
* `#interesa_[linea]`, `#quiere_a_medida`, `#pidio_combo`, `#consulta_promocion`

**Interes alto**
* `#pidio_cotizacion_formal`, `#pregunto_forma_pago`, `#volvio_a_consultar`, `#trajo_medidas`, `#envio_foto_espacio`

**Comparacion**
* `#menciono_competencia`, `#comparo_precios`, `#vio_en_ml`

**Financiamiento**
* `#pregunto_cuotas`, `#pregunto_mercadopago`, `#necesita_factura`, `#pago_transferencia`

**Urgencia**
* `#necesita_rapido`, `#tiene_fecha_mudanza`, `#sin_apuro`, `#para_proyecto_obra`

**Postventa**
* `#tracking_pedido`, `#reclamo_entrega`, `#reclamo_calidad`, `#reclamo_medida`, `#devolucion`, `#consulta_armado_pendiente`

**Reactivacion**
* `#cotizacion_vencida_sin_respuesta`, `#recontacto`

**Derivacion**
* `#medida_compleja`, `#proyecto_grande`, `#descuento_mayorista`, `#reclamo_formal`

---

## INSUMOS Y MATERIALES DE CONSTRUCCION

### Variables

**De negocio**
* `tipo_cliente` — Particular / Contratista-Albanil / Constructora / Arquitecto / Reventa. Justificacion: Variable porque determina tratamiento de precio, credito, y prioridad. No es tag porque un cliente es UN tipo a la vez.

**De producto**
* `familia_producto` — Obra gruesa, Sanitarios, Electricos, Pinturas, Terminaciones, Herramientas, Aberturas. Es la tipologia macro.
* `producto_especifico` — Nombre/codigo del producto
* `marca` — Marca solicitada
* `cantidad` — Cantidad solicitada
* `unidad_medida` — Unidad, metro, kilo, bolson, paquete

**Del lead**
* `nombre`, `telefono`, `empresa_obra`
* `tiene_cuenta_corriente` — Si/No. Justificacion: Variable porque define el flujo de cobro.

**De intencion**
* `productos_solicitados` — Lista de productos pedidos
* `tipo_compra` — Unitaria / Lista de materiales / Presupuesto de obra
* `volumen_estimado` — Chico (<$X), Mediano, Grande (>$Y)

**De embudo**
* `etapa_funnel` — Nuevo, Cotizacion enviada, Confirmado, En preparacion, En entrega, Entregado, Descartado

**De atribucion**
* `canal_origen` — WhatsApp, Telefono, Mostrador, Web

**De routing**
* `vendedor_asignado`

**De logistica**
* `zona_entrega`, `tipo_entrega` (Retira en local / Envio), `direccion_obra`

**De urgencia**
* `urgencia` — Para hoy, Esta semana, Sin fecha

**De recurrencia**
* `es_cliente_recurrente` — Si/No. Justificacion: Variable porque segmenta toda la estrategia. Un recurrente vale 10x un nuevo en este rubro.
* `frecuencia_compra` — Semanal, Quincenal, Mensual, Esporadico

### Smart Tags

**Intencion**
* `#consulta_precio`, `#pide_cotizacion_lista`, `#quiere_comprar_ya`, `#solo_averigua`, `#pide_presupuesto_obra`

**Objeciones**
* `#objecion_precio`, `#pide_descuento`, `#comparo_corralon`, `#objecion_flete`, `#objecion_stock`

**Tipo de consulta**
* `#precio_unitario`, `#precio_por_cantidad`, `#consulta_stock`, `#consulta_marca`, `#consulta_envio`, `#consulta_cta_corriente`, `#consulta_horario`, `#consulta_flete`

**Producto / Familia**
* `#obra_gruesa`, `#sanitarios`, `#electricos`, `#pintura`, `#terminaciones`, `#herramientas`, `#aberturas`

**Interes alto**
* `#lista_materiales`, `#volumen_grande`, `#obra_en_curso`, `#compra_recurrente`, `#pide_abrir_cuenta`

**Comparacion**
* `#precio_competencia`, `#cotizo_otro_corralon`, `#pregunto_si_igualan_precio`

**Financiamiento**
* `#consulta_cta_corriente`, `#pide_plazo_pago`, `#pago_transferencia`, `#pago_efectivo`, `#pago_cheque`

**Urgencia**
* `#necesita_hoy`, `#obra_parada`, `#pedido_programado`, `#sin_apuro`

**Postventa**
* `#tracking_envio`, `#reclamo_faltante`, `#reclamo_producto_danado`, `#devolucion`, `#error_en_pedido`

**Derivacion**
* `#descuento_especial`, `#apertura_cta_cte`, `#credito`, `#pedido_obra_grande`, `#reclamo_grave`, `#consulta_tecnica`
