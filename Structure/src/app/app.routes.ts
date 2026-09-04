import { Routes } from '@angular/router';
import { childRoutes } from './routes/childRoutes';
import { RoutesEnum } from '../utils/enums/routes.enum';
import { NotFoundComponent } from '../shared/components/not-found/not-found.component';
import { ContentComponent } from './components/content/content.component';
import { authGuard } from '../services/auth.guard';

export const routes: Routes = [
  {
    path: RoutesEnum.LOGIN,
    loadComponent: () =>
      import('./auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: RoutesEnum.LOGIN,
  },
  {
    path: '',
    component: ContentComponent,
    canActivate: [authGuard],
    children: [
      ...childRoutes,
      {
        path: RoutesEnum.NOT_FOUND,
        component: NotFoundComponent,
      },
      {
        path: '**',
        redirectTo: RoutesEnum.NOT_FOUND,
      }
    ],
  },
];
