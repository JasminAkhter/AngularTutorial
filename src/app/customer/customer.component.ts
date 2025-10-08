import { Component } from '@angular/core';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  address?: string;
}

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent {
  customers: Customer[] = [];
  nextId: number = 1;
  editingCustomer: Customer | null = null;

  // Add or update customer
  addCustomer(formValue: any) {
    if (this.editingCustomer) {
      // update existing customer
      this.editingCustomer.name = formValue.customerName;
      this.editingCustomer.email = formValue.email;
      this.editingCustomer.phone = formValue.phone;
      this.editingCustomer.gender = formValue.gender;
      this.editingCustomer.address = formValue.address;
      this.editingCustomer = null;
    } else {
      // add new customer
      this.customers.push({
        id: this.nextId++,
        name: formValue.customerName,
        email: formValue.email,
        phone: formValue.phone,
        gender: formValue.gender,
        address: formValue.address
      });
    }
    formValue.resetForm(); // reset form after submit
  }

  // Edit customer
  editCustomer(customer: Customer) {
    this.editingCustomer = customer;
  }

  // Delete customer
  deleteCustomer(id: number) {
    this.customers = this.customers.filter(c => c.id !== id);
    if (this.editingCustomer?.id === id) {
      this.editingCustomer = null;
    }
  }
}

