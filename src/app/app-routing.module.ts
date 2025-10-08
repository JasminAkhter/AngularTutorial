import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerComponent } from './customer/customer.component';
import { BankComponent } from './bank/bank.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: 'customer', component: CustomerComponent },
  { path: 'bank', component: BankComponent },
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // default route
  { path: '**', redirectTo: 'home' } // wildcard fallback
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
