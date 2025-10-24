import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { Customer } from '../models/customer';
import { CustomerService } from '../services/customer.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { NgForm } from '@angular/forms';
import { response } from 'express';
import { error } from 'console';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';



@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(private customerService: CustomerService, private snackBar: MatSnackBar) { }

  customers: Customer[] = [];
  nextCursor?: number;  //store the cursor for next page

  ngAfterViewInit() {
  }

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
    'actions'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<Customer>();

  totalRecords = 0;
  pageSize = 5;
  pageIndex = 0;
  searchText = '';
  isLoading = false;

  ngOnInit(): void {
    this.loadCustomers();
  }

  isEditMode = false;
  editingCustomerId?: number;

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }



  loadCustomers(): void {
    this.isLoading = true;
    const pageNumber = this.pageIndex + 1;

    console.log('Loading page:', pageNumber, 'PageIndex:', this.pageIndex); 

    this.customerService.getAll(pageNumber, this.pageSize, this.searchText)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res: any) => {
          console.log('API Response:', res); 
          this.dataSource.data = res.data || res.Data || [];
          this.totalRecords = res.totalCount || res.TotalCount || 0;
          console.log('Total Records:', this.totalRecords); 
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading customers:', err);
          this.isLoading = false;
        }
      });
  }

  //Pagination event
  onPageChange(event: PageEvent): void {
    console.log('Page changed:', event); // 🔍 Debug
    console.log('Page index:', event.pageIndex); // 🔍 Debug
    console.log('Page size:', event.pageSize); // 🔍 Debug

    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadCustomers();
  }

  //Search filter (server-side)
  search(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.searchText = input.trim().toLowerCase();
    this.pageIndex = 0;

    if (this.paginator) {
      this.paginator.firstPage();
    }

    this.loadCustomers();
  }

  reset(form?: NgForm): void {
    if (form) {
      form.resetForm();  // resets the form UI and validation state
    }
    this.customerData = { id: 0, name: '', email: '', phone: '', gender: '', address: '' };
    this.isEditMode = false;
    this.editingCustomerId = undefined;
  }


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

    if (this.isEditMode && this.customerData.id != null && this.customerData.id > 0) {
      this.customerService.update(this.customerData.id, this.customerData)

        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (res) => {

            this.reset(customerForm); //pass the form to reset UI + data
            this.snackBar.open(res.Message || 'Customer updated successfully!', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-success']
            });

            this.loadCustomers();
            customerForm.resetForm();
            this.isEditMode = false;
            this.editingCustomerId = undefined;
          },
          error: (err) => {
            console.error(err);
          }
        });

    } else {
      //  CREATE NEW CUSTOMER
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
            this.reset(customerForm);
            this.loadCustomers();
          },

          error: (err) => console.error
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

          this.loadCustomers();
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