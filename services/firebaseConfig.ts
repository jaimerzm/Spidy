// services/firebaseConfig.ts
import { initializeApp } from 'firebase/app';

// TODO: Reemplaza este objeto con la configuración de tu propio proyecto de Firebase
// Ve a la Consola de Firebase -> Configuración del Proyecto -> General
// En la sección "Tus apps", haz clic en el icono </> para obtener tu configuración web.
const firebaseConfig = {
  apiKey: "TU_API_KEY_DE_FIREBASE_WEB",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_ID_DE_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// Inicializa Firebase
export const app = initializeApp(firebaseConfig);
