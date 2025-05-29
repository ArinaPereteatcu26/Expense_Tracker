import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:5056/api';

  constructor(private http: HttpClient) {}

  // Get paginated budgets
  getBudgets(
    page: number = 1,
    limit: number = 10,
  ): Observable<PaginatedResponse<Budget>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedResponse<Budget>>(`${this.baseUrl}/budgets`, {
      params,
    });
  }

  // Get all budgets (for backwards compatibility)
  getAllBudgets(): Observable<Budget[]> {
    return this.getBudgets(1, 1000).pipe(map((response) => response.data));
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

  // Get paginated expenses
  getExpenses(
    page: number = 1,
    limit: number = 10,
    budgetId?: number,
  ): Observable<PaginatedResponse<Expense>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (budgetId) {
      params = params.set('budgetId', budgetId.toString());
    }

    return this.http.get<PaginatedResponse<Expense>>(
      `${this.baseUrl}/expenses`,
      { params },
    );
  }

  // Get all expenses (for backwards compatibility)
  getAllExpenses(budgetId?: number): Observable<Expense[]> {
    return this.getExpenses(1, 1000, budgetId).pipe(
      map((response) => response.data),
    );
  }

  createExpense(expense: CreateExpenseDto): Observable<Expense> {
    return this.http.post<Expense>(`${this.baseUrl}/expenses`, expense);
  }

  deleteExpense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/expenses/${id}`);
  }
}
