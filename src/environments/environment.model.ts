export interface AppEnvironment {
  production: boolean;
  name: 'QA' | 'Production';
  apiBaseUrl: string;
  oauth: {
    baseUrl: string;
    clientId: string;
    scope: string;
  };
}
