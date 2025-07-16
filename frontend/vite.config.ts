// Import needed modules
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Define Vite configuration and sets base public path
export default defineConfig({
  plugins: [react()],
  base: '/', 
})