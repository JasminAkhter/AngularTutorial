import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Bank } from '../models/bank';
import { Observable } from 'rxjs';

const apiUrl = 'http://localhost:5183/api/Bank';

@Injectable({
  providedIn: 'root'
})
export class BankService {

  constructor(private httpClient:HttpClient) { }

  getAll(): Observable<Bank[]> {
    return this.httpClient.get<Bank[]>(apiUrl + '/GetAll');
  }

  create(data: Bank): Observable<Bank> {
    return this.httpClient.post<Bank>(apiUrl + '/Create', data);
  }

  update(id: number, data: Bank): Observable<any> {
    return this.httpClient.put<any>(`${apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.httpClient.delete<any>(`${apiUrl}/${id}`);
  }
}
