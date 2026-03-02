# Sistema de Gestión Financiera - Roabusiness

## 📋 Descripción General

Este documento describe el sistema completo de gestión financiera implementado en Roabusiness, que permite llevar un control detallado de ingresos, egresos, suscripciones y costos operativos de la plataforma.

## 🗄️ Estructura de Base de Datos

### 1. Modificación de la Tabla `businesses`

Se agregó la columna `pago` para llevar control del estado de pago de cada negocio:

- **Estados disponibles**: `'ejecutado'`, `'sin pagar'`
- **Valor por defecto**: `'sin pagar'`
- **Visible solo para**: Administradores

**Script de instalación**: `/scripts/add_pago_column_businesses.sql`

### 2. Nuevas Tablas

#### `subscription_plans`

Almacena los planes de suscripción disponibles con sus precios configurables.

**Campos principales**:

- `months`: Duración en meses
- `price_lempiras`: Precio en lempiras
- `description`: Descripción del plan
- `is_active`: Si el plan está activo

**Planes iniciales**:

- 6 meses: L 300.00
- 12 meses: L 550.00
- 18 meses: L 800.00
- 24 meses: L 1000.00

#### `transactions`

Registra todas las transacciones financieras de la plataforma.

**Campos principales**:

- `business_id`: Referencia al negocio
- `tipo`: `'ingreso'`, `'egreso'`, `'reembolso'`
- `concepto`: Descripción de la transacción
- `monto`: Cantidad en lempiras
- `fecha`: Fecha de la transacción
- `metodo_pago`: Efectivo, transferencia, tarjeta, etc.
- `created_by`: Usuario que registró la transacción

#### `advertising_costs`

Lleva control de los costos de publicidad de la plataforma.

**Campos principales**:

- `descripcion`: Descripción del gasto publicitario
- `monto`: Cantidad en lempiras
- `fecha`: Fecha del gasto
- `plataforma`: Facebook Ads, Google Ads, etc.
- `notas`: Notas adicionales

#### `subscription_history`

Historial completo de todas las suscripciones.

**Campos principales**:

- `business_id`: Referencia al negocio
- `subscription_months`: Duración de la suscripción
- `started_at`: Fecha de inicio
- `expires_at`: Fecha de expiración
- `amount_paid`: Monto pagado
- `status`: `'activa'`, `'vencida'`, `'cancelada'`, `'renovada'`

### 3. Vistas SQL

#### `businesses_financial_view`

Vista con información financiera completa de cada negocio, incluyendo estado de pago y suscripción.

#### `financial_summary`

Resumen general con:

- Ingresos totales
- Egresos totales
- Costos de publicidad
- Balance total
- Estadísticas de suscripciones

#### `ingresos_por_mes`

Ingresos agrupados por mes con cantidad de transacciones.

#### `suscripciones_por_vencer`

Suscripciones que vencen en los próximos 30 días, con información de contacto del negocio.

### 4. Funciones Almacenadas

#### `renovar_suscripcion()`

Renueva la suscripción de un negocio y registra la transacción automáticamente.

**Parámetros**:

- `p_business_id`: ID del negocio
- `p_new_months`: Duración de la nueva suscripción
- `p_amount_paid`: Monto pagado
- `p_payment_method`: Método de pago (opcional)
- `p_admin_user`: Usuario que realiza la renovación (opcional)

#### `cancelar_suscripcion()`

Cancela una suscripción y registra el evento en el historial.

**Parámetros**:

- `p_business_id`: ID del negocio
- `p_razon`: Razón de la cancelación (opcional)
- `p_admin_user`: Usuario que realiza la cancelación (opcional)

## 🖥️ Implementación Frontend

### Componentes Modificados

#### 1. `RegisterBusinessModalAdmin.tsx`

- Agregado selector de estado de pago
- Estados visuales: Ejecutado (verde), Sin Pagar (rojo)

#### 2. `EditBusinessPage.tsx`

- Incluye campo `pago` en formularios de registro y edición
- Actualiza payloads para incluir estado de pago

### Nuevos Archivos

#### 1. `/src/types/financial.ts`

Tipos TypeScript para todo el sistema financiero:

- `SubscriptionPlan`
- `Transaction`
- `AdvertisingCost`
- `SubscriptionHistory`
- `BusinessFinancialView`
- `FinancialSummary`
- `IngresosPorMes`
- `SuscripcionPorVencer`

#### 2. `/src/hooks/useFinancial.ts`

Hook personalizado con todas las operaciones financieras:

**Funciones disponibles**:

- `fetchSubscriptionPlans()`: Obtener planes de suscripción
- `updateSubscriptionPlan()`: Actualizar precios de planes
- `fetchTransactions()`: Obtener transacciones con filtros
- `createTransaction()`: Registrar nueva transacción
- `fetchAdvertisingCosts()`: Obtener costos de publicidad
- `createAdvertisingCost()`: Registrar nuevo costo
- `fetchSubscriptionHistory()`: Obtener historial de suscripciones
- `fetchBusinessesFinancial()`: Obtener vista financiera de negocios
- `fetchFinancialSummary()`: Obtener resumen financiero
- `fetchIngresosPorMes()`: Obtener ingresos mensuales
- `fetchSuscripcionesPorVencer()`: Obtener suscripciones próximas a vencer
- `renovarSuscripcion()`: Renovar suscripción de un negocio
- `cancelarSuscripcion()`: Cancelar suscripción

#### 3. `/src/pages/FinancialDashboard.tsx`

Panel financiero completo con múltiples secciones:

**Pestañas disponibles**:

1. **Dashboard**: Vista general con ingresos por mes
2. **Planes**: Gestión de planes de suscripción
3. **Transacciones**: Registro y visualización de transacciones
4. **Publicidad**: Control de costos publicitarios
5. **Negocios**: Estado financiero de todos los negocios
6. **Por Vencer**: Suscripciones que vencen en 30 días

**Características**:

- Resumen financiero en tiempo real
- Alertas automáticas de pagos pendientes y suscripciones por vencer
- Modales para crear transacciones y costos publicitarios
- Edición de precios de planes
- Renovación rápida de suscripciones
- Información de contacto para seguimiento

### Rutas

Nueva ruta protegida para administradores:

```
/financial
```

Accesible desde el Panel de Administración mediante el botón "Panel Financiero".

## 📊 Funcionalidades Principales

### 1. Control de Estado de Pago

- Cada negocio tiene un estado: "Ejecutado" o "Sin Pagar"
- Visible solo para administradores
- Modificable en modales de registro y edición

### 2. Gestión de Planes de Suscripción

- Planes configurables con precios editables
- Visualización de todos los planes activos
- Posibilidad de activar/desactivar planes

### 3. Registro de Transacciones

- Tipos: Ingreso, Egreso, Reembolso
- Vinculadas a negocios específicos
- Métodos de pago: Efectivo, Transferencia, Tarjeta, Depósito
- Notas y conceptos personalizables

### 4. Control de Costos Publicitarios

- Registro por plataforma (Facebook, Instagram, Google, etc.)
- Tracking de inversión total en publicidad
- Filtros por fecha y plataforma

### 5. Análisis Financiero

- Balance total (ingresos - egresos)
- Ingresos percibidos por mes
- Estadísticas de suscripciones activas/vencidas
- Negocios con pagos pendientes

### 6. Gestión de Suscripciones

- Visualización de suscripciones próximas a vencer
- Información de contacto para seguimiento
- Renovación con un clic
- Historial completo de cambios

### 7. Alertas y Notificaciones

- Indicadores visuales para pagos pendientes
- Alerta de suscripciones por vencer en 30 días
- Códigos de color según urgencia (7 días = rojo, 15 días = amarillo)

## 🔐 Seguridad

- Todas las vistas y tablas financieras tienen **Row Level Security (RLS)** habilitado
- Acceso exclusivo para administradores
- Rutas protegidas mediante `AdminRouteGuard`
- Los datos financieros NO son visibles para usuarios regulares ni propietarios de negocios

## 🚀 Instalación

### Paso 1: Ejecutar Scripts SQL

En tu consola de Supabase, ejecuta en orden:

1. `/scripts/add_pago_column_businesses.sql`
2. `/scripts/create_financial_system.sql`

### Paso 2: Verificar Permisos

Asegúrate de que las políticas RLS estén configuradas correctamente para que solo los administradores puedan acceder a los datos financieros.

### Paso 3: Acceder al Panel

1. Inicia sesión como administrador
2. Ve al Panel de Administración (`/adminroa`)
3. Haz clic en el botón "Panel Financiero"
4. Explora las diferentes secciones

## 💡 Uso Recomendado

### Flujo de Trabajo para Nuevos Negocios

1. **Registro**: Al registrar un negocio, configurar:
   - Tiempo de duración (meses)
   - Estado de pago inicial (generalmente "Sin Pagar")

2. **Pago Recibido**: Cuando el negocio paga:
   - Ir al Panel Financiero → Transacciones
   - Crear nueva transacción tipo "Ingreso"
   - Actualizar estado de pago a "Ejecutado" en el modal de edición

3. **Renovaciones**: Cuando una suscripción vence:
   - Revisar la pestaña "Por Vencer"
   - Contactar al negocio usando la información provista
   - Renovar con un clic una vez confirmado el pago

### Gestión de Costos

1. **Publicidad**: Registrar todos los gastos publicitarios en la pestaña correspondiente
2. **Balance**: Revisar regularmente el Dashboard para monitorear la salud financiera
3. **Reportes**: Usar la vista de Ingresos por Mes para análisis de tendencias

## 📈 Métricas Disponibles

- **Ingresos Totales**: Suma de todas las transacciones de tipo ingreso
- **Egresos Totales**: Suma de egresos + costos de publicidad
- **Balance Total**: Ingresos - Egresos - Publicidad
- **Tasa de Pago**: Negocios pagados vs sin pagar
- **Salud de Suscripciones**: Activas vs Vencidas
- **Proyección de Ingresos**: Basado en suscripciones por vencer

## 🔧 Mantenimiento

### Actualizar Precios de Planes

1. Ir al Panel Financiero → Planes
2. Clic en el botón de editar del plan
3. Modificar precio y/o descripción
4. Guardar cambios

### Limpiar Historial

Los registros en `subscription_history` se mantienen permanentemente para auditoría. Si necesitas archivar datos antiguos, considera crear una tabla de archivo separada.

### Respaldo de Datos

Asegúrate de incluir las nuevas tablas en tu estrategia de respaldo:

- `subscription_plans`
- `transactions`
- `advertising_costs`
- `subscription_history`

## 🆘 Solución de Problemas

### Problema: No aparecen datos en el Dashboard

- **Solución**: Verificar que ejecutaste ambos scripts SQL
- Revisar permisos RLS en Supabase

### Problema: Error al renovar suscripción

- **Solución**: Verificar que la función `renovar_suscripcion()` existe en Supabase
- Revisar logs de la consola del navegador

### Problema: No puedo acceder al Panel Financiero

- **Solución**: Verificar que estás autenticado como administrador
- Revisar que el `AdminRouteGuard` está funcionando correctamente

## 📝 Notas Adicionales

- Los precios están en **Lempiras Hondureñas (L)**
- Las fechas se manejan en formato ISO 8601
- El sistema soporta múltiples monedas modificando el código del hook
- Para agregar nuevas métricas, editar las vistas SQL según necesidades

## 🔜 Mejoras Futuras Sugeridas

1. Exportación de reportes a Excel/PDF
2. Gráficos interactivos con Chart.js o Recharts
3. Notificaciones automáticas por email para suscripciones por vencer
4. Integración con sistemas de pago (PayPal, Stripe)
5. Dashboard de proyecciones financieras
6. Comparativas año tras año
7. Categorización de egresos
8. Múltiples usuarios admin con diferentes permisos

---

**Versión**: 1.0.0  
**Fecha**: Marzo 2026  
**Autor**: Sistema Roabusiness
