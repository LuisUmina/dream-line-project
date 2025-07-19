/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  // otras variables de entorno que puedas tener
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
