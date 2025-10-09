 import { Component, OnInit } from '@angular/core';
 //import { CustomerService, Customer } from '../services/customer.service';

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

  
  addCustomer(formValue: any) {
    if (this.editingCustomer) {
      
      this.editingCustomer.name = formValue.customerName;
      this.editingCustomer.email = formValue.email;
      this.editingCustomer.phone = formValue.phone;
      this.editingCustomer.gender = formValue.gender;
      this.editingCustomer.address = formValue.address;
      this.editingCustomer = null;
    } else {
      
      this.customers.push({
        id: this.nextId++,
        name: formValue.customerName,
        email: formValue.email,
        phone: formValue.phone,
        gender: formValue.gender,
        address: formValue.address
      });
    }
    formValue.resetForm(); 
  }

  
  // editCustomer(customer: Customer) {
  //   this.editingCustomer = customer;
  // }

  editCustomer(customer: any) {
  console.log('Editing customer:', customer);
}

  
  deleteCustomer(id: number) {
    this.customers = this.customers.filter(c => c.id !== id);
    if (this.editingCustomer?.id === id) {
      this.editingCustomer = null;
    }
  }
}

