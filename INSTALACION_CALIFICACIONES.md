# 🚀 Guía de Instalación del Sistema de Calificaciones

## 📋 Descripción

Este sistema permite a los usuarios calificar negocios (1-5 estrellas) sin necesidad de login, usando un identificador único de dispositivo. Los **Negocios Destacados** ahora se ordenan por calificación en lugar de por número de contactos.

---

## 🗄️ Instalación de Base de Datos

### Prerrequisitos
- Acceso al dashboard de Supabase
- Base de datos con la tabla `businesses` ya creada

### Paso 1: Ejecutar Script de Calificaciones

Este script crea la tabla `calificaciones`, la vista materializada con estadísticas, y actualiza la vista de negocios destacados.

**Archivo**: `scripts/create_calificaciones_table.sql`

#### Opción A: Desde Supabase Dashboard
1. Abre tu proyecto en [https://supabase.com](https://supabase.com)
2. Ve a **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido de `create_calificaciones_table.sql`
5. Haz clic en **Run** o presiona `Ctrl+Enter`

#### Opción B: Desde psql (línea de comandos)
```bash
psql -h your-project-ref.supabase.co -p 5432 -d postgres -U postgres -f scripts/create_calificaciones_table.sql
```

### Paso 2 (Opcional): Si ya tenías la vista anterior

Si ya ejecutaste previamente el script `migracion_honduras_destacados.sql` y tienes la vista `vista_negocios_destacados`, usa este script para actualizarla:

**Archivo**: `scripts/update_destacados_por_rating.sql`

```bash
# En Supabase SQL Editor o desde psql:
psql -h your-project-ref.supabase.co -p 5432 -d postgres -U postgres -f scripts/update_destacados_por_rating.sql
```

> **Nota**: Este paso solo es necesario si la vista ya existe. Si acabas de ejecutar `create_calificaciones_table.sql`, la vista ya está actualizada.

---

## ✅ Verificación de la Instalación

### 1. Verificar que la tabla existe
```sql
SELECT COUNT(*) FROM calificaciones;
-- Debería retornar 0 (sin errores)
```

### 2. Verificar la vista materializada
```sql
SELECT * FROM business_ratings_stats LIMIT 5;
-- Debería retornar las columnas: business_id, total_ratings, average_rating, etc.
```

### 3. Verificar la vista de destacados
```sql
SELECT name, average_rating, total_ratings, contador_contactos 
FROM vista_negocios_destacados 
LIMIT 10;
-- Debería mostrar negocios ordenados por rating
```

### 4. Probar inserción de calificación
```sql
-- Obtener un business_id válido
SELECT id FROM businesses LIMIT 1;

-- Insertar una calificación de prueba
INSERT INTO calificaciones (business_id, device_id, rating)
VALUES ('tu-business-id-aqui', 'test-device-123', 5);

-- Verificar que se creó
SELECT * FROM calificaciones WHERE device_id = 'test-device-123';

-- Limpiar datos de prueba
DELETE FROM calificaciones WHERE device_id = 'test-device-123';
```

---

## 🔧 Estructura de la Base de Datos

### Tabla `calificaciones`
```sql
- id: UUID (PK)
- business_id: UUID (FK → businesses.id)
- device_id: VARCHAR(255)
- rating: INTEGER (1-5)
- comment: TEXT (opcional)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- CONSTRAINT: UNIQUE(business_id, device_id)
```

### Vista Materializada `business_ratings_stats`
```sql
- business_id: UUID
- total_ratings: INTEGER
- average_rating: NUMERIC(2 decimales)
- five_stars, four_stars, three_stars, two_stars, one_star: INTEGER
- last_rating_date: TIMESTAMP
```

### Vista `vista_negocios_destacados`
```sql
SELECT 
  b.* (todos los campos de businesses),
  contador_contactos,
  ultimo_contacto,
  average_rating,
  total_ratings
FROM businesses b
LEFT JOIN negocio_destacado nd ON b.id = nd.business_id
LEFT JOIN business_ratings_stats brs ON b.id = brs.business_id
WHERE b.is_public = true
ORDER BY average_rating DESC, total_ratings DESC, contador_contactos DESC
```

---

## 🎯 Orden de Clasificación

Los **Negocios Destacados** ahora se ordenan por:

1. **Calificación promedio** (descendente) - Más estrellas primero
2. **Total de calificaciones** (descendente) - Más votos = más confiable
3. **Contador de contactos** (descendente) - Criterio terciario

### Ejemplos:

| Negocio | Rating | Total | Contactos | Posición |
|---------|--------|-------|-----------|----------|
| A       | 5.0    | 100   | 50        | 1° |
| B       | 5.0    | 50    | 200       | 2° |
| C       | 4.8    | 150   | 300       | 3° |
| D       | 4.8    | 100   | 400       | 4° |
| E       | 0.0    | 0     | 500       | último |

---

## 📱 Uso en el Frontend

### El hook `useRatings` ya está integrado en:
- ✅ `BusinessCard.tsx` - Muestra rating promedio
- ✅ `ContactModal.tsx` - Permite calificar
- ✅ `EditBusinessPage.tsx` - Muestra ratings en admin

### Ejemplo de uso:
```typescript
import { useRatings } from "@/hooks/useRatings";

function MiComponente({ businessId }) {
  const { average, totalRatings, deviceRating, rate } = useRatings(businessId);
  
  return (
    <div>
      <p>Rating: {average?.toFixed(1)} ⭐</p>
      <p>Total: {totalRatings} valoraciones</p>
      <button onClick={() => rate(5)}>Calificar 5 estrellas</button>
    </div>
  );
}
```

---

## 🔒 Seguridad (RLS)

Las políticas de seguridad permiten:
- ✅ **Lectura pública**: Cualquiera puede ver calificaciones
- ✅ **Inserción pública**: Cualquiera puede calificar (sin login)
- ✅ **Actualización**: Cualquier dispositivo puede actualizar su propia calificación
- ✅ **Eliminación**: Cualquier dispositivo puede eliminar su propia calificación

---

## 🐛 Troubleshooting

### Error: "relation 'calificaciones' does not exist"
- Ejecuta `create_calificaciones_table.sql`

### Error: "relation 'business_ratings_stats' does not exist"
- La vista materializada no se creó. Re-ejecuta el script completo.

### Error: "relation 'negocio_destacado' does not exist"
- Ejecuta primero `migracion_honduras_destacados.sql`

### Los negocios destacados no se muestran
1. Verifica que existan negocios públicos: `SELECT COUNT(*) FROM businesses WHERE is_public = true`
2. Verifica que la vista existe: `SELECT * FROM vista_negocios_destacados LIMIT 1`
3. Verifica permisos RLS en Supabase Dashboard

### La vista materializada no se actualiza
- Se actualiza automáticamente con triggers
- Para forzar actualización manual: `REFRESH MATERIALIZED VIEW CONCURRENTLY business_ratings_stats;`

---

## 📊 Consultas Útiles

### Ver negocios con mejores calificaciones
```sql
SELECT 
  b.name,
  brs.average_rating,
  brs.total_ratings
FROM business_ratings_stats brs
JOIN businesses b ON b.id = brs.business_id
ORDER BY brs.average_rating DESC, brs.total_ratings DESC
LIMIT 10;
```

### Ver últimas calificaciones
```sql
SELECT 
  b.name,
  c.rating,
  c.created_at
FROM calificaciones c
JOIN businesses b ON b.id = c.business_id
ORDER BY c.created_at DESC
LIMIT 20;
```

### Ver distribución de ratings por negocio
```sql
SELECT 
  b.name,
  brs.five_stars as "5⭐",
  brs.four_stars as "4⭐",
  brs.three_stars as "3⭐",
  brs.two_stars as "2⭐",
  brs.one_star as "1⭐"
FROM business_ratings_stats brs
JOIN businesses b ON b.id = brs.business_id
WHERE brs.total_ratings > 0
ORDER BY brs.average_rating DESC;
```

---

## 🎉 ¡Listo!

El sistema de calificaciones está completamente instalado y funcional. Los usuarios ya pueden calificar negocios sin necesidad de crear una cuenta, y los **Negocios Destacados** en la página principal se ordenarán automáticamente por calificación.
