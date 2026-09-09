import { AppEnvironment } from './environment.model';

// Replace the blank service URLs when production becomes available.
export const environment: AppEnvironment = {
  production: true,
  name: 'Production',
  apiBaseUrl: '',
  oauth: {
    baseUrl: '',
    clientId: 'centaiva-platform-web',
    scope: 'openid profile email roles centaiva.platform',
  },
};
