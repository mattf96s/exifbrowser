/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly NODE_ENV: string
  readonly STAGE: string
  readonly REGION: string
  readonly VITE_STAGE: string
  readonly VITE_REGION: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}