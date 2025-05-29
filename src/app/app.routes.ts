import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard, NoAuthGuard } from './guards/auth.guard';
import { CreateAccountComponent } from './pages/create-account/create-account.component';
import { BudgetDetailsComponent } from './pages/budget-details/budget-details.component';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [NoAuthGuard],
  },
  {
    path: 'create-account',
    component: CreateAccountComponent,
    canActivate: [NoAuthGuard],
  },
  { path: 'details/:id', component: BudgetDetailsComponent },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes), HttpClientModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
