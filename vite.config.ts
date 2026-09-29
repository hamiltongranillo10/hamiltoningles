import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { handleDriveAudioRequest } from './server/drive-audio.mjs';

const driveAudioApi: Plugin = {
  name: 'drive-audio-api',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
      if (pathname !== '/api/drive/audio') return next();
      void handleDriveAudioRequest(req, res).catch(next);
    });
  },
};

export default defineConfig({
  plugins: [react(), driveAudioApi],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
  },
});
