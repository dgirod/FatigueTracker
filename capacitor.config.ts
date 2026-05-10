import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fatiguetracker.app',
  appName: 'Fatigue Tracker',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
