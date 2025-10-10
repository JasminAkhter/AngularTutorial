import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Customer } from '../models/customer';

const apiUrl = 'http://localhost:5183/api/Customer';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(private http: HttpClient) { }

  getAll():Observable<Customer[]>{
    return this.http.get<Customer[]>(apiUrl);
  }

  getById(id:number):Observable<Customer>{
    return this.http.get<Customer>(`${apiUrl}/${id}`);
  }

  create(customer:Customer):Observable<Customer>{
    return this.http.post<Customer>(apiUrl, customer);
  }

  update(id:number, customer:Customer):Observable<Customer>{
    return this.http.put<Customer>(`${apiUrl}/${id}`, customer);
  }

  delete(id:number):Observable<void>{
    return this.http.delete<void>(`${apiUrl}/${id}`);
  }
}
