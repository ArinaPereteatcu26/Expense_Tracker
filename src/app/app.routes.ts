import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { BudgetDetailsComponent } from './pages/budget-details/budget-details.component';
import { RegistrationComponent } from './user/registration/registration.component';
import { UserComponent } from './user/user.component';
import { LoginComponent } from './user/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminOnlyComponent } from './authorizeDemo/admin-only/admin-only.component';
import { GuestComponent } from './authorizeDemo/guest/guest.component';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { claimReq } from './shared/utils/claimReq-utils';

export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'details/:id',
    component: BudgetDetailsComponent,
  },
  {
    path: 'signin',
    component: LoginComponent,
  },
  {
    path: 'signup',
    component: RegistrationComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin-only',
    component: AdminOnlyComponent,
    data: { claimReq: claimReq.adminOnly },
    canActivate: [AuthGuard],
  },
  {
    path: 'user',
    component: UserComponent,
    data: { claimReq: claimReq.user },
    canActivate: [AuthGuard],
  },
  {
    path: 'guest',
    component: GuestComponent,
    data: { claimReq: claimReq.guest },
    //canActivate: [AuthGuard],
  },
  {
    path: 'forbidden',
    component: ForbiddenComponent,
  },
  {
    path: '',
    redirectTo: 'signin',
    pathMatch: 'full',
  },
];
