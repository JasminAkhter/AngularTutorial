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

  constructor( private customerService: CustomerService, private snackBar: MatSnackBar) { }

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

  create(customerForm: NgForm): void {
    if (!customerForm.valid) {
      this.snackBar.open('Please fill all required fields!', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    this.customerService.create(this.customerData)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data) => {
          this.customers.push(data);

          customerForm.resetForm();
          this.customerData = { id: 0, name: '', email: '', phone: '', gender: '', address: '' };

          this.snackBar.open('Customer added successfully!', 'success', {
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

      this.customerService.update(this.editingCustomerId, this.customerData)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (res) => {

            const index = this.customers.findIndex(c => c.id === this.editingCustomerId);
            if (index !== -1) this.customers[index] = res.Customer;


            this.resetForm(customerForm);

            this.snackBar.open(res.Message, 'Close', {
              duration: 3000,
              panelClass: ['snackbar-success']
            });
          },
          error: (err) => {
            console.error(err);
            this.snackBar.open('Error updating customer!', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-error']
            });
          }
        });
    } else {
      this.customerService.create(this.customerData)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (data) => {
            this.customers.unshift(data);
            this.resetForm(customerForm);
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

  resetForm(form: NgForm) {
    form.resetForm();
    this.customerData = { id: 0, name: '', email: '', phone: '', gender: '', address: '' };
    this.isEditMode = false;
    this.editingCustomerId = undefined;
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
  // showSnackbar(message: string, type: 'success' | 'error' | 'warning' | 'info') {
  //   this.snackBar.open(message, 'Close', {
  //     duration: 3000,
  //     horizontalPosition: 'center',
  //     verticalPosition: 'top',
  //     panelClass: [`snackbar-${type}`]
  //   });
  // }






}
