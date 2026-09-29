import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cuida.app',
  appName: 'CUIDA+',
  webDir: 'dist',
  plugins: {
    CapacitorUpdater: {
      autoUpdate: true,
      defaultChannel: 'production'
    }
  }
};

export default config;
