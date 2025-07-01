// Script para migrar imágenes base64 de localStorage a Supabase Storage
// 1. Exporta tu objeto de imágenes desde el navegador y guárdalo como images.json
// 2. Coloca images.json en la carpeta scripts/
// 3. Ejecuta este script con Node.js

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://olzsyrwtrabmcfgmyedl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9senN5cnd0cmFibWNmZ215ZWRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzOTY1ODcsImV4cCI6MjA2NTk3MjU4N30.v31zrstKbMZ4yTBP6Au-JT6ILKILW6vWt7tBYA8LjLk';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const imagesPath = path.join(__dirname, 'images.json');
const images = JSON.parse(fs.readFileSync(imagesPath, 'utf8'));

async function uploadBase64ToSupabase(base64, name) {
  // Extraer el tipo de archivo
  const matches = base64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
  if (!matches) return null;
  const ext = matches[1].split('/')[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
  const { error } = await supabase.storage.from('uploads').upload(fileName, buffer, {
    contentType: matches[1],
    upsert: false,
  });
  if (error) {
    console.error('Error subiendo', name, error.message);
    return null;
  }
  const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
  return data.publicUrl;
}

(async () => {
  for (const [id, img] of Object.entries(images)) {
    const url = await uploadBase64ToSupabase(img.url, img.originalName);
    if (url) {
      console.log(`Imagen ${img.originalName} subida: ${url}`);
      // Aquí puedes actualizar tu base de datos con la nueva URL si lo necesitas
    }
  }
  console.log('Migración finalizada.');
})();
