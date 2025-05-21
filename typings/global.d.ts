declare global {
  interface Window {
    eruda?: Record<string, any>,
  }
  const RUN_ENV: string
}

export {}
