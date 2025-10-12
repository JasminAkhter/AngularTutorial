import { Component, OnInit } from '@angular/core';
import { Customer } from '../models/customer';
import { CustomerService } from '../services/customer.service';
import { Route } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {

  constructor(private customerService: CustomerService, private snackBar: MatSnackBar) { }

  customers: Customer[] = [];

  private unsubscribe$ = new Subject<void>();
  newconfig: Customer = {
    id: 0,
    name: '',
    email: '',
    phone: '',
    gender: '',
    address: ''
  }

  displayedColumns: string[] = [
    'id',
    'name',
    'email',
    'phone',
    'gender',
    'address',
    'action'
  ]

  ngOnInit(): void {
    this.getAll();
  }

  getAll() {
    this.customerService.getAll().subscribe({
      next: (data: Customer[]) => {
        this.customers = data;
      },
      error: (error) => {
        this.snackBar.open('Error fetching customers!', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['error-snackbar']
        });
      },
      complete: () => {
        console.log('Customer data fetched successfully!');
      }
    });
  }

  // private unsubscribe$ = new Subject<void>();

  create(customerForm: NgForm): void {
    if (!customerForm.valid) {
      this.snackBar.open('Please fill all required fields!', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    const customerData: Customer = {
      name: customerForm.value.customerName, // <-- PascalCase
      email: customerForm.value.email,
      phone: customerForm.value.phone,
      gender: customerForm.value.gender,
      address: customerForm.value.address
    };


    this.customerService.create(customerData)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data) => {
          this.getAll();
          customerForm.resetForm();
          this.snackBar.open('Customer added successfully!', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-success']
          });
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Error adding customer!', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
        }
      });
  }







}













// getAll() {
//   this.customerService.getAll().subscribe(
//     (data: Customer[]) => {
//       this.customers = data;
//     },
//     (error) => {
//       this.snackBar.open('Error fetching customers!', 'Close', {
//         duration: 3000,
//         verticalPosition: 'top',
//         horizontalPosition: 'center',
//         panelClass: ['error-snackbar']
//       });
//     }
//   );
// }



