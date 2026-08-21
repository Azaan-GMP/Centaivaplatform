export type ApplicationType = 'Web' | 'API' | 'Service' | 'Mobile' | 'Worker';

export type ApplicationStatus = 'Active' | 'Beta' | 'Deprecated' | 'Maintenance';

export interface Permission {
  id: string;
  key: string;
  name: string;
  description: string;
  featureId: string;
  moduleId: string;
  applicationId: string;
  productKey: string;
  risk: 'Low' | 'Medium' | 'High';
}

export interface Feature {
  id: string;
  name: string;
  key: string;
  description: string;
  moduleId: string;
  applicationId: string;
  productKey: string;
  status: 'Active' | 'Beta' | 'Deprecated';
  permissions: Permission[];
}

export interface ProductModule {
  id: string;
  name: string;
  key: string;
  description: string;
  applicationId: string;
  productKey: string;
  status: 'Active' | 'Beta' | 'Deprecated';
  features: Feature[];
}

export interface Application {
  id: string;
  name: string;
  key: string;
  productKey: string;
  productName: string;
  type: ApplicationType;
  status: ApplicationStatus;
  description: string;
  baseUrl: string;
  version: string;
  moduleCount: number;
  featureCount: number;
  permissionCount: number;
  createdAt: string;
  modules: ProductModule[];
}
