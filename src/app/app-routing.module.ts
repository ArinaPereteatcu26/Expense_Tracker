/*
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard, NoAuthGuard } from './guards/auth.guard';
import { CreateAccountComponent } from './pages/create-account/create-account.component';

// Export the routes constant so it can be imported elsewhere
export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'account-creation',
    component: CreateAccountComponent,
    canActivate: [NoAuthGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
*/
