import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cuida.app',
  appName: 'CUIDA+',
  webDir: 'dist',
  plugins: {
    CapacitorUpdater: {
      autoUpdate: true,
      channel: 'production', // Cambiar a 'test' para probar versiones
      updateUrl: 'https://api.capgo.app/v1/apps/com.cuida.app/updates', // Requerido si se usa el servicio cloud de Capgo
    }
  }
};

export default config;
