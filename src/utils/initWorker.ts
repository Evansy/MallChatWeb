export const worker: Worker = new Worker(new URL('./worker.ts', import.meta.url), {
  type: 'module',
})
