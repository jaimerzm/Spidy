// Script para inyectar variables de entorno en el HTML después del build
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio actual en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta al archivo index.html generado
const indexPath = path.resolve(__dirname, '../dist/index.html');

// Leer el contenido del archivo
let htmlContent = fs.readFileSync(indexPath, 'utf8');

// Obtener la API key de las variables de entorno
const apiKey = process.env.GEMINI_API_KEY || '';

// Reemplazar el placeholder con la API key real
htmlContent = htmlContent.replace('%GEMINI_API_KEY%', apiKey);

// Escribir el contenido actualizado de vuelta al archivo
fs.writeFileSync(indexPath, htmlContent);

console.log('Variables de entorno inyectadas en index.html');