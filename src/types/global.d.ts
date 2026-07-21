/// <reference types="vite/client" />

// Ensure TypeScript knows about Vite import.meta.env usage.
interface ImportMetaEnv {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Asset module declarations (used by React/Vite imports in TS files).
declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

export {};


