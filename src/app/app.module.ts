import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CustomerComponent } from './customer/customer.component';
import { BankComponent } from './bank/bank.component';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { provideHttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { importProvidersFrom } from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';



@NgModule({
  declarations: [
    AppComponent,
    CustomerComponent,
    BankComponent,
    HomeComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    AppRoutingModule,
    MatSnackBarModule,
    BrowserAnimationsModule
  ],
  providers: [
    provideHttpClient(),
    provideClientHydration()],
  bootstrap: [AppComponent]
})
export class AppModule { }
