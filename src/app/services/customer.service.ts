import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Customer } from '../models/customer';

// const apiUrl ='https://localhost:5183/api/Customer';
const apiUrl = 'http://localhost:5183/api/Customer';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(private httpClient: HttpClient) { }

//  getAll(): Observable<Customer[]> {
//     return this.httpClient.get<Customer[]>(this.apiUrl);
//   }

  getAll(): Observable<Customer[]>{
    return this.httpClient.get<Customer[]>(apiUrl);
  }

//   create(data: Customer): Observable<Customer> {
//   return this.httpClient.post<Customer>('http://localhost:5183/api/Customer/Create', data);
// }

create(data: Customer): Observable<Customer> {
  return this.httpClient.post<Customer>(apiUrl + '/Create', data);
}



    update(id: string, data: Customer): Observable<Customer> {
        return this.httpClient.put<Customer>(apiUrl + '/Update/' + id, data);
      }
}


