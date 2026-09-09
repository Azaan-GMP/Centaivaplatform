import { AppEnvironment } from './environment.model';

// QA is active until the production endpoints are available.
export const environment: AppEnvironment = {
  production: false,
  name: 'QA',
  apiBaseUrl: 'http://192.168.88.27:8081',
  oauth: {
    baseUrl: 'http://192.168.88.27:8081',
    clientId: 'centaiva-platform-web',
    scope: 'openid profile email roles centaiva.platform',
  },
};
