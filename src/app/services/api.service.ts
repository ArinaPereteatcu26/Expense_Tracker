import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:5055/api';

  constructor(private http: HttpClient) {}

  getSecureData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/secure-data`);
  }

  getBudgets(): Observable<any> {
    return this.http.get(`${this.baseUrl}/budgets`);
  }

  createExpense(expense: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/expenses`, expense);
  }
}
