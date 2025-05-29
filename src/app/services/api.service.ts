import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Budget {
  id: number;
  name: string;
  amount: number;
  spent: number;
  userId: number;
  createdAt: string;
}

export interface Expense {
  id: number;
  name: string;
  amount: number;
  budgetId: number;
  userId: number;
  createdAt: string;
  budget?: Budget;
}

export interface CreateBudgetDto {
  name: string;
  amount: number;
}

export interface CreateExpenseDto {
  name: string;
  amount: number;
  budgetId: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:5056/api';

  constructor(private http: HttpClient) {}

  // The interceptor will automatically add the Authorization header
  getSecureData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/secure-data`);
  }

  getBudgets(): Observable<Budget[]> {
    return this.http.get<Budget[]>(`${this.baseUrl}/budgets`);
  }

  getBudget(id: number): Observable<Budget> {
    return this.http.get<Budget>(`${this.baseUrl}/budgets/${id}`);
  }

  createBudget(budget: CreateBudgetDto): Observable<Budget> {
    return this.http.post<Budget>(`${this.baseUrl}/budgets`, budget);
  }

  updateBudget(id: number, budget: CreateBudgetDto): Observable<Budget> {
    return this.http.put<Budget>(`${this.baseUrl}/budgets/${id}`, budget);
  }

  deleteBudget(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/budgets/${id}`);
  }

  getExpenses(budgetId?: number): Observable<Expense[]> {
    const url = budgetId
      ? `${this.baseUrl}/expenses?budgetId=${budgetId}`
      : `${this.baseUrl}/expenses`;
    return this.http.get<Expense[]>(url);
  }

  createExpense(expense: CreateExpenseDto): Observable<Expense> {
    return this.http.post<Expense>(`${this.baseUrl}/expenses`, expense);
  }

  deleteExpense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/expenses/${id}`);
  }
}
