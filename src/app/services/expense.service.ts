import { Injectable } from '@angular/core';
import { Expense } from '../interfaces/models/expense.interface';
import { Subject } from 'rxjs';
import { BudgetService } from './buget.service';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  EXPENSES: string = 'EXPENSES';
  expenseSubject: Subject<Expense[]> = new Subject();
  constructor(private budgetService: BudgetService) {}

  addExpense(expense: Expense) {
    try {
      const budget = this.budgetService.getBudgetById(
        expense.budgetCategory.id,
      );
      const expenses = this.getExpenses();
      expenses.push(expense);
      this.setExpense(expenses);
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
}
