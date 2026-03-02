# Sistema de Internacionalización (i18n) - RoaBusiness

## Resumen de Cambios

Se ha implementado un sistema completo de internacionalización que detecta automáticamente el idioma del navegador del usuario y traduce toda la interfaz de usuario, manteniendo el **nombre de los negocios sin traducir** como solicitado.

## Características Implementadas

### 1. Detección Automática del Idioma

- El sistema detecta automáticamente si el navegador del usuario está en inglés o español
- Si el navegador está en inglés (`en`, `en-US`, etc.), la aplicación se mostrará en inglés
- Si el navegador está en español o cualquier otro idioma, la aplicación se mostrará en español (idioma por defecto)
- La preferencia se guarda en `localStorage` para persistencia

### 2. Selector Manual de Idioma

- Se agregó un componente `LanguageSwitcher` en el Header y Footer
- Los usuarios pueden cambiar manualmente entre Español 🇪🇸 e Inglés 🇬🇧
- El cambio es instantáneo y se guarda automáticamente

### 3. Elementos Traducidos

#### ✅ Traducidos Automáticamente:

- **Navegación**: Inicio, Directorio, Panel, etc.
- **Botones**: Llamar, Compartir, WhatsApp, Ver galería, etc.
- **Secciones**: Acerca de, Información de Contacto, Redes Sociales, Ubicación, etc.
- **Amenidades**: Wi-Fi, Estacionamiento, Piscina, Aire Acondicionado, etc.
- **Mensajes del sistema**: "No disponible", "Cargando...", etc.
- **Footer**: Todos los derechos reservados, Política de Privacidad, etc.
- **Hero**: Título principal y subtítulo

#### ❌ NO Traducidos (Como se solicitó):

- **Nombres de negocios**: Se mantienen en su idioma original
- **Descripciones de negocios**: Se mantienen como están en la base de datos
- **Información de contacto de negocios**: Direcciones, teléfonos, emails, etc.

### 4. Traducción de Amenidades

Las amenidades almacenadas en español se traducen automáticamente cuando el usuario visualiza en inglés:

- "Estacionamiento" → "Parking"
- "Aire Acondicionado" → "Air Conditioning"
- "Piscina" → "Pool"
- Y más de 40 amenidades comunes

## Archivos Creados

### 1. `/src/contexts/LanguageContext.tsx`

Contexto global que maneja:

- Detección automática del idioma del navegador
- Cambio de idioma
- Persistencia en localStorage
- Actualización del atributo `lang` del HTML

### 2. `/src/lib/translations.ts`

Contiene:

- Todas las traducciones en español e inglés
- Mapa de traducción de amenidades
- Función helper `translateAmenity()`

### 3. `/src/components/LanguageSwitcher.tsx`

Componente de selector de idioma con dropdown

## Archivos Actualizados

1. **`/src/main.tsx`**: Se agregó el `LanguageProvider`
2. **`/src/pages/BusinessProfilePage.tsx`**: Usa traducciones para toda la UI
3. **`/src/components/Hero.tsx`**: Título y subtítulo traducibles
4. **`/src/components/Header.tsx`**: Navegación traducible + selector de idioma
5. **`/src/components/Footer.tsx`**: Footer traducible + selector de idioma

## Cómo Funciona

### Para Usuarios

1. **Automático**: Al entrar a la página, el idioma se detecta del navegador
2. **Manual**: Pueden cambiar usando el selector 🌐 en Header o Footer
3. **Persistente**: Su preferencia se guarda para futuras visitas

### Para Desarrolladores

#### Usar traducciones en componentes:

```tsx
import { useLanguage } from "@/contexts/LanguageContext";

function MyComponent() {
  const { t, language } = useLanguage();

  return (
    <div>
      <h1>{t("business.about")}</h1>
      <p>{t("business.contactInfo")}</p>
    </div>
  );
}
```

#### Traducir amenidades:

```tsx
import { translateAmenity } from "@/lib/translations";
import { useLanguage } from "@/contexts/LanguageContext";

function AmenitiesList({ amenities }) {
  const { language } = useLanguage();

  return amenities.map((amenity) => (
    <span>{translateAmenity(amenity, language)}</span>
  ));
}
```

#### Agregar nuevas traducciones:

Editar `/src/lib/translations.ts`:

```typescript
export const translations = {
  es: {
    "mi.nueva.key": "Mi texto en español",
  },
  en: {
    "mi.nueva.key": "My text in English",
  },
};
```

## Pruebas

### Probar detección automática:

1. **Chrome/Edge**:
   - Configuración → Idiomas → Mover "English" al primer lugar
   - Recargar la página → Debería verse en inglés

2. **Firefox**:
   - about:preferences → Idioma → "English" en primer lugar
   - Recargar la página → Debería verse en inglés

3. **Safari**:
   - Preferencias del Sistema → Idioma y Región → English en primer lugar
   - Recargar Safari → Debería verse en inglés

### Probar cambio manual:

1. Click en el icono de globo 🌐 en el Header o Footer
2. Seleccionar idioma
3. La página cambia instantáneamente

## Soporte de SEO

- El atributo `lang` del `<html>` se actualiza dinámicamente
- Google y otros buscadores pueden detectar el idioma correctamente
- Los nombres de negocios NO se traducen, mejorando la precisión de las búsquedas

## Notas Importantes

1. **Nombres de Negocios**: Como se solicitó, los nombres NUNCA se traducen
2. **Descripciones**: Las descripciones de la base de datos se muestran tal cual
3. **Google Maps**: El idioma del mapa se sincroniza con la selección del usuario
4. **Fallback**: Si no hay traducción para una clave, se muestra la clave misma

## Expansión Futura

Para agregar más idiomas (ej: francés):

1. Agregar tipo: `export type Language = 'es' | 'en' | 'fr';`
2. Agregar traducciones en `translations.ts`
3. Agregar opción en `LanguageSwitcher.tsx`

## Beneficios

✅ Mejor experiencia para turistas internacionales
✅ Mayor alcance de mercado
✅ SEO mejorado para búsquedas en inglés
✅ Interfaz profesional y moderna
✅ Fácil de mantener y expandir
