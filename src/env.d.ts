interface ImportMetaEnv {
  VITE_LOWCODE_API_KEY: string
  DEV: boolean
  PROD: boolean
}

interface ImportMeta {
  env: ImportMetaEnv
}
