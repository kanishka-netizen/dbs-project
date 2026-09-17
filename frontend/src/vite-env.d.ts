/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base URL for the backend API. Defaults to `/api`, which the Vite dev
   * server proxies to the NestJS backend on port 3001.
   */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
