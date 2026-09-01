import { defineConfig } from 'vitest/config'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'

export default defineConfig(({ mode }) => ({
  resolve: {
    tsconfigPaths: true,
  },
  ssr:
    mode === 'production'
      ? {
          noExternal: [
            'drizzle-orm',
            '@libsql/client',
            '@libsql/core',
            '@libsql/hrana-client',
          ],
          resolve: {
            conditions: ['netlify', 'worker', 'import', 'module'],
            externalConditions: ['netlify', 'worker', 'import'],
          },
        }
      : undefined,
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
  plugins: [devtools(), netlify(), tailwindcss(), tanstackStart(), viteReact()],
}))
