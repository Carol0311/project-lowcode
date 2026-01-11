interface ImportMetaEnv {
  VITE_LOWCODE_API_KEY: string
  VITE_BASE_URL: string
  DEV: boolean
  PROD: boolean
}

interface ImportMeta {
  env: ImportMetaEnv
}
