import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { BudgetCategory } from '../interfaces/models/budget-category-interface';
import { Budget } from '../interfaces/models/budget.interface';

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  public BUDGETS: string = 'BUDGETS';
  public BUDGET_CATEGORIES = 'BUDGET_CATEGORIES';

  public budgetSubject: Subject<Budget[]> = new Subject();
  public budgetCategorySubject: Subject<BudgetCategory[]> = new Subject();

  constructor() {}

  addBudget(budget: Budget) {
    const budgets = this.getBudgets();
    budgets.push(budget);
    this.setBudgets(budgets);
  }

  getBudgets(): Budget[] {
    const budgets = JSON.parse(
      localStorage.getItem(this.BUDGETS) || '[]',
    ) as Budget[];
    return budgets;
  }

  getBudgetCategories(): BudgetCategory[] {
    const categories = JSON.parse(
      localStorage.getItem(this.BUDGET_CATEGORIES) || '[]',
    ) as BudgetCategory[];
    return categories;
  }

  getBudgetById(budgetId: string) {
    const budgets = this.getBudgets();
    const index = budgets.findIndex((x) => x.id === budgetId);
    if (index > -1) {
      return budgets[index];
    }

    throw Error('Budget does not exist');
  }

  getBudgetCategoryById(id: string) {
    const categories = this.getBudgetCategories();
    const index = categories.findIndex((x) => x.id === id);
    if (index > -1) {
      return categories[index];
    }

    throw Error('Category does not exist');
  }

  setBudgets(budgets: Budget[]) {
    localStorage.setItem(this.BUDGETS, JSON.stringify(budgets));

    const budgetCategories: BudgetCategory[] = budgets.map((item: Budget) => {
      return {
        color: item.color,
        id: item.id,
        name: item.name,
      } as BudgetCategory;
    });
    this.setBudgetCategories(budgetCategories);
    this.budgetSubject.next(budgets);
  }

  setBudgetCategories(budgetCategories: BudgetCategory[]) {
    localStorage.setItem(
      this.BUDGET_CATEGORIES,
      JSON.stringify(budgetCategories),
    );
    this.budgetCategorySubject.next(budgetCategories);
  }

  getBudgetData(): Observable<Budget[]> {
    return this.budgetSubject;
  }

  getBudgetCategoryData(): Observable<BudgetCategory[]> {
    return this.budgetCategorySubject;
  }
}
