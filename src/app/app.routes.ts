import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { BudgetDetailsComponent } from './pages/budget-details/budget-details.component';
import { RegistrationComponent } from './user/registration/registration.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'signin',
    component: RegistrationComponent,
  },

  /*    path: 'login',
    component: AuthComponent,
    canActivate: [NoAuthGuard],*/
  /* },*/
  {
    path: 'home',
    component: HomeComponent,
    /*    canActivate: [AuthGuard],*/
  },
  {
    path: 'details/:id',
    component: BudgetDetailsComponent,
    /* canActivate: [AuthGuard],*/
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
