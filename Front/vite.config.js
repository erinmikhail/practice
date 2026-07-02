import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // tailwindcss() подключает Tailwind без отдельных config-файлов (это новый способ в v4)
  plugins: [react(), tailwindcss()],
})
