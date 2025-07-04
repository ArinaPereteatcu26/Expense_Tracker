import { Injectable } from '@angular/core';
import { Expense } from '../interfaces/models/expense.interface';
import { Observable, BehaviorSubject } from 'rxjs';
import { TableDataConfig } from '../interfaces/ui-config/table-data-config.interface';
import { BudgetService } from './budget.service';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  EXPENSES: string = 'EXPENSES';

  expenseSubject: BehaviorSubject<Expense[]> = new BehaviorSubject<Expense[]>(
    [],
  );

  constructor(
    private budgetService: BudgetService,
    private userService: UserService,
    private authService: AuthService,
  ) {
    // Initialize expenses if a user is already logged in
    if (this.authService.isLoggedIn()) {
      this.initializeExpenses();
    }

    // Subscribe to user changes to reset expenses when user changes
    this.userService.getUserObservable().subscribe((user) => {
      if (user) {
        // New user logged in, initialize their expenses
        this.initializeExpenses();
      } else {
        // User logged out or was deleted, clear expenses
        this.clearExpenses();
      }
    });
  }

  private initializeExpenses(): void {
    const expenses = this.getExpenses();
    this.expenseSubject.next(expenses);
  }

  private clearExpenses(): void {
    this.expenseSubject.next([]);
  }

  addExpense(expense: Expense) {
    try {
      const budget = this.budgetService.getBudgetById(
        expense.budgetCategory.id,
      );
      const expenses = this.getExpenses();
      expenses.push(expense);
      this.setExpense(expenses);
      this.updateExpense(expenses, budget.id);
    } catch (err: any) {
      throw err;
    }
  }

  getExpenses(): Expense[] {
    return JSON.parse(localStorage.getItem(this.EXPENSES) || '[]') as Expense[];
  }

  setExpense(expenses: Expense[]) {
    localStorage.setItem(this.EXPENSES, JSON.stringify(expenses));
    this.expenseSubject.next(expenses);
  }

  updateExpense(expenses: Expense[], budgetId: string) {
    const budgetExpenses = expenses.filter(
      (item) => item.budgetCategory.id === budgetId,
    );
    const totalExpense = budgetExpenses.reduce(
      (sum: number, current: Expense) => sum + current.amount,
      0,
    );
    this.budgetService.updateBudgetAmount(budgetId, totalExpense);
  }

  buildExpenseTable(expenses: Expense[]) {
    return expenses.map((item: Expense) => {
      return {
        id: item.id,
        name: item.name,
        amount: item.amount,
        date: item.date,
        budget: item.budgetCategory.name,
        color: item.budgetCategory.color,
      };
    }) as TableDataConfig[];
  }

  deleteExpenseByBudgetId(budgetId: string) {
    const expense = this.getExpenses();
    const deleted = expense.filter(
      (expense: Expense) => expense.budgetCategory.id != budgetId,
    );
    this.setExpense(deleted);
  }

  deleteExpenseById(expenseId: string) {
    const expenses = this.getExpenses();
    const expense = expenses.filter(
      (expense: Expense) => expense.id === expenseId,
    )[0];
    if (!expense) {
      throw Error('can not delete a expense that does not exist ');
      return;
    }

    const deleted = expenses.filter(
      (expense: Expense) => expense.id != expenseId,
    );
    this.setExpense(deleted);
    this.updateExpense(deleted, expense.budgetCategory.id);
  }

  getExpenseByBudgetId(budgetId: string) {
    const expenses = this.getExpenses();
    return expenses.filter(
      (expense: Expense) => expense.budgetCategory.id === budgetId,
    );
  }

  getExpenseData(): Observable<Expense[]> {
    return this.expenseSubject.asObservable();
  }
}
