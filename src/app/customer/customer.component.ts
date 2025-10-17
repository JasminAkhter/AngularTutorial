import { Component, OnInit, OnDestroy } from '@angular/core';
import { Customer } from '../models/customer';
import { CustomerService } from '../services/customer.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { NgForm } from '@angular/forms';



@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit, OnDestroy {

  constructor(private customerService: CustomerService, private snackBar: MatSnackBar) { }

  customers: Customer[] = [];

  private unsubscribe$ = new Subject<void>();

  customerData: Customer = {
    id: 0,
    name: '',
    email: '',
    phone: '',
    gender: '',
    address: ''
  };

  displayedColumns: string[] = [
    'id',
    'name',
    'email',
    'phone',
    'gender',
    'address',
    'action'
  ];


  ngOnInit(): void {
    this.getAll();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getAll() {
    this.customerService.getAll()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data: Customer[]) => this.customers = data,
        error: (error) => {
          this.snackBar.open('Error fetching customers!', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['error-snackbar']
          });
        }
      });
  }


  reset(form?: NgForm): void {
    if (form) {
      form.resetForm(); // ✅ resets the form UI and validation state
    }

    // this.customerData = { id: 0, name: '', email: '', phone: '', gender: '', address: '' };
    this.isEditMode = false;
    this.editingCustomerId = undefined;
    this.getAll();
  }



  isEditMode = false;
  editingCustomerId?: number;

  editCustomer(customer: Customer): void {
    this.isEditMode = true;
    this.editingCustomerId = customer.id;
    this.customerData = { ...customer };
    console.log('Editing customer:', this.customerData);
  }



  saveCustomer(customerForm: NgForm): void {
    if (!customerForm.valid) {
      this.snackBar.open('Please fill all required fields!', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    if (this.isEditMode && this.editingCustomerId != null) {
      // 🔹 UPDATE EXISTING CUSTOMER
      this.customerService.update(this.editingCustomerId, this.customerData)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (res) => {
            
            this.reset(customerForm); // ✅ pass the form to reset UI + data
            this.snackBar.open(res.Message || 'Customer updated successfully!', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-success']
            });
          },
          error: (err) => {
            console.error(err);
          }
        });

    } else {
      // 🔹 CREATE NEW CUSTOMER
      this.customerService.create(this.customerData)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (data) => {
            this.customers.push(data);
            this.reset(customerForm); // ✅ pass the form here too
            this.snackBar.open('Customer added successfully!', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-success']
            });
          },
          error: (err) => {
            console.error(err);
          }
        });
    }
  }





  deleteCustomer(id?: number): void {
    if (id === undefined || id === null) {
      this.snackBar.open('Invalid customer id', 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
      return;
    }

    const ok = window.confirm('Are you sure you want to delete this customer?');
    if (!ok) return;

    this.customerService.delete(id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          this.customers = this.customers.filter(c => c.id !== id);

          this.snackBar.open(res?.Message ?? 'Customer deleted successfully!', 'warning', {
            duration: 3000,
            panelClass: ['snackbar-success']
          });
        },
        error: (err) => {
          console.error('Delete API Error:', err);
          this.snackBar.open('Error deleting customer!', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
        }
      });
  }
}