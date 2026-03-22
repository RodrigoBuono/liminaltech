# DISENO DEL FUNNEL POR VERTICAL

---

## Principio: No mezclar niveles

Un error comun en CRMs es meter todo en un solo "pipeline". Pero hay al menos 3 niveles que deben ser independientes:

* **Estado del lead**: Donde esta la persona en relacion a nosotros (nuevo, calificado, activo, inactivo, cerrado)
* **Estado de la oportunidad**: Donde esta la operacion comercial especifica (cotizacion, negociacion, reserva, cerrado)
* **Estado del producto/proyecto/propiedad**: En que estado esta lo que vendemos (disponible, reservado, vendido, entregado)

Mezclarlos produce cosas como: "¿este lead esta en 'Reserva' porque el reservo, o porque la unidad esta reservada por otro?" Eso no puede pasar.

---

## DESARROLLISTA INMOBILIARIO

### Estado del lead
* `lead_nuevo` — Acaba de llegar, sin calificar
* `lead_en_calificacion` — El agente o vendedor esta recopilando datos
* `lead_calificado` — Tiene perfil, presupuesto y interes confirmados
* `lead_activo` — Esta en proceso comercial activo
* `lead_inactivo` — Dejo de responder o no hay actividad reciente
* `lead_descartado` — No viable. Motivo registrado.
* `lead_congelado` — Viable pero no ahora. Fecha de reactivacion programada.
* `cliente` — Cerro operacion. Pasa a base de clientes.

### Estado de la oportunidad
* `consulta_inicial` — Primera interaccion
* `calificacion_en_curso` — Recopilando datos criticos
* `visita_agendada` — Fecha y hora de visita confirmada
* `visita_realizada` — Se concreto la visita. Feedback pendiente.
* `interesado` — Post-visita positiva, evaluando
* `negociacion` — Discutiendo condiciones, precio, financiacion
* `reserva_seña` — Firmo boleto de reserva o deposito seña
* `documentacion` — Proceso de escrituracion en curso
* `cerrada_ganada` — Escritura firmada
* `cerrada_perdida` — No se concreto. Motivo registrado.

### Estado del producto (unidad/proyecto)
* `en_preventa` — Se puede reservar pero no hay construccion
* `en_construccion` — Obra en curso
* `disponible` — Listo para vender/reservar
* `reservada` — Seña recibida, pendiente escritura
* `vendida` — Escriturada
* `entregada` — Posesion otorgada

### Que medir en cada etapa
* consulta_inicial → volumen de leads por canal, costo por lead
* calificacion → tasa de calificacion, tiempo de calificacion
* visita_agendada → conversion consulta → visita, tasa de agendamiento del agente
* visita_realizada → tasa de no-show
* negociacion → conversion visita → negociacion
* reserva → conversion negociacion → reserva, valor de reserva
* cerrada → conversion total, revenue, ciclo promedio

### Que actualiza el equipo comercial manualmente
* Resultado de visita (feedback)
* Paso a negociacion
* Reserva recibida
* Documentacion completa
* Cierre final

### Que puede inferir o sugerir el agente
* Nuevo → En calificacion (automatico al empezar a preguntar)
* En calificacion → Calificado (cuando recopilo datos suficientes)
* Calificado → Visita agendada (si el agente agenda)
* Detectar lead inactivo (sin actividad en X dias)
* Sugerir reactivacion de lead congelado (al cumplirse la fecha)

---

## INMOBILIARIA

### Estado del lead
* `lead_nuevo`, `lead_en_calificacion`, `lead_calificado`, `lead_activo`, `lead_inactivo`, `lead_descartado`, `lead_congelado`, `cliente`

### Estado de la oportunidad — VENTA
* `consulta_inicial`
* `calificacion_en_curso`
* `match_propiedades` — Se identificaron propiedades compatibles
* `visita_agendada`
* `visita_realizada`
* `interesado_post_visita`
* `oferta_presentada` — El comprador hizo una oferta
* `en_negociacion` — Contraoferta, condiciones
* `reserva`
* `documentacion`
* `cerrada_ganada`
* `cerrada_perdida`

### Estado de la oportunidad — ALQUILER
* `consulta_inicial`
* `calificacion_en_curso`
* `match_propiedades`
* `visita_agendada`
* `visita_realizada`
* `documentacion_solicitada` — Se pidieron papeles de garantia
* `documentacion_recibida` — Papeles entregados, en evaluacion
* `garantia_aprobada`
* `contrato_en_proceso`
* `contrato_firmado`
* `cerrada_perdida`

### Estado del producto (propiedad)
* `disponible` — Publicada y activa
* `reservada` — Seña depositada
* `en_negociacion` — Oferta activa, no cerrada
* `alquilada` — Contrato vigente
* `vendida` — Escritura firmada
* `suspendida` — Temporalmente fuera de mercado
* `retirada` — Propietario la saco de la cartera

### Que medir en cada etapa
* consulta → leads por portal, leads por propiedad, tasa de respuesta
* calificacion → tasa de calificacion, datos recopilados
* match → propiedades sugeridas vs interes real
* visita → agendadas, realizadas, no-show, conversion post-visita
* oferta/documentacion → conversion a cierre, tiempo en esta etapa
* cierre → comision generada, ciclo total

### Que actualiza el equipo manualmente
* Match de propiedades (aunque el agente puede sugerir)
* Resultado de visita
* Oferta recibida/rechazada
* Estado de documentacion
* Aprobacion de garantia
* Firma de contrato

### Que puede inferir el agente
* Deteccion automatica: venta vs alquiler
* Calificacion basica (zona, presupuesto, ambientes)
* Agendamiento de visitas
* Sugerir propiedades compatibles
* Follow-up post-visita
* Alerta de lead inactivo

---

## MOBILIARIO

### Estado del lead
* `lead_nuevo`, `lead_en_calificacion`, `lead_calificado`, `lead_activo`, `lead_inactivo`, `lead_descartado`, `cliente`

### Estado de la oportunidad
* `consulta_inicial`
* `calificacion_en_curso`
* `cotizacion_enviada` — Se envio presupuesto formal
* `en_seguimiento` — Follow-up activo, esperando decision
* `confirmada_pagada` — Pago total o seña recibida
* `en_produccion` — Si es a medida, se esta fabricando
* `lista_para_entrega` — Producto disponible para despacho
* `entregada`
* `cerrada_perdida` — Cotizacion no aceptada, motivo registrado

### Estado del producto
* `en_stock` — Disponible para venta inmediata
* `sin_stock` — No disponible, con fecha de reposicion estimada
* `a_producir` — Se fabrica bajo pedido
* `en_produccion` — En proceso de fabricacion
* `descontinuado` — No se fabrica/vende mas

### Que medir
* consulta → volumen por canal (Instagram es clave), producto mas consultado
* cotizacion → tasa de cotizacion, tiempo de generacion, conversion cotizacion → venta
* seguimiento → efectividad de follow-up, motivos de no-compra
* produccion → tiempo de fabricacion (a medida)
* entrega → plazo de entrega, tasa de reclamo post-entrega

### Que actualiza el equipo manualmente
* Confirmacion de pago
* Estado de produccion
* Fecha de entrega
* Resolucion de reclamos

### Que puede inferir el agente
* Producto de interes + precio automatico (si es estandar)
* Cotizacion automatica de productos en catalogo
* Deteccion de oportunidad de a medida vs estandar
* Follow-up automatico post-cotizacion
* Deteccion de proyecto grande (amoblamiento)

---

## INSUMOS Y MATERIALES DE CONSTRUCCION

### Estado del lead
* `lead_nuevo`, `lead_calificado`, `cliente_recurrente`, `lead_descartado`
* *Nota: En este rubro, la distincion lead/cliente es mas difusa. Muchos "leads" ya son clientes recurrentes. La variable `es_cliente_recurrente` es mas util que el estado de lead clasico.*

### Estado de la oportunidad (pedido)
* `consulta_precio` — Pregunto por precio/disponibilidad
* `cotizacion_enviada` — Se paso presupuesto (unitario o lista)
* `pedido_confirmado` — Confirmo la compra
* `en_preparacion` — Pedido en armado
* `en_entrega` — En camino / listo para retiro
* `entregado` — Se concreto
* `cancelado` — No se concreto, motivo registrado

### Estado del producto
* `en_stock` — Disponible
* `stock_bajo` — Queda poco
* `sin_stock` — Agotado, con o sin fecha de reposicion
* `precio_actualizado` — Precio vigente confirmado
* `precio_a_confirmar` — Precio volatil, requiere validacion

### Que medir
* consulta → volumen diario, productos mas consultados, picos horarios
* cotizacion → tiempo de respuesta de precio, listas procesadas, precision de precios
* pedido → conversion cotizacion → pedido, ticket promedio (B2B vs B2C)
* entrega → entregas/dia, cumplimiento de plazo
* recurrencia → frecuencia de recompra, LTV por tipo de cliente

### Que actualiza el equipo manualmente
* Confirmacion de pedido
* Estado de preparacion
* Despacho
* Resolucion de reclamos
* Aprobacion de credito/cuenta corriente

### Que puede inferir el agente
* Precio unitario automatico (si esta en la base actualizada)
* Cotizacion de lista de materiales
* Deteccion de tipo de cliente (B2B vs B2C por volumen/lenguaje)
* Deteccion de oportunidad de cuenta corriente
* Alerta de cliente recurrente
* Alerta de volumen inusualmente grande

---

## RESUMEN COMPARATIVO DE FUNNELS

```
DESARROLLISTA      INMOBILIARIA       MOBILIARIO         MATERIALES
(ciclo largo)      (ciclo medio)      (ciclo corto/med)  (ciclo muy corto)

Consulta           Consulta           Consulta           Consulta precio
    ↓                  ↓                  ↓                  ↓
Calificacion       Calificacion       Calificacion       Cotizacion
    ↓                  ↓                  ↓                  ↓
Visita             Match + Visita     Cotizacion         Confirmacion
    ↓                  ↓                  ↓                  ↓
Negociacion        Oferta/Negoc.      Seguimiento        Preparacion
    ↓                  ↓                  ↓                  ↓
Reserva            Reserva/Contrato   Pago               Entrega
    ↓                  ↓                  ↓                  ↓
Escritura          Cierre             Produccion?        Entregado
    ↓                                     ↓
Cerrado                               Entrega

Semanas a meses    Semanas a meses    Horas a semanas    Minutos a horas
```
