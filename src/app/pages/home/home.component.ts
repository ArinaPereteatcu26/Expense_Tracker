import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { FormWrapperComponent } from '../../components/form-wrapper/form-wrapper.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { BudgetCategory } from '../../interfaces/models/budget-category-interface';
import { Budget } from '../../interfaces/models/budget.interface';
import { v4 as uuidv4 } from 'uuid';
import { Router } from '@angular/router';
import { BudgetCardComponent } from '../../components/budget-card/budget-card.component';
import { UiService } from '../../services/ui.service';
import { Expense } from '../../interfaces/models/expense.interface';
import { TableComponent } from '../../components/table/table.component';
import { BudgetCardConfig } from '../../interfaces/ui-config/budget-card-config.interface';
import { TableDataConfig } from '../../interfaces/ui-config/table-data-config.interface';
import { BudgetService } from '../../services/budget.service';
import { NgForOf, NgIf } from '@angular/common';
import { FooterComponent } from '../../components/footer/footer.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  imports: [
    FormWrapperComponent,
    ReactiveFormsModule,
    BudgetCardComponent,
    TableComponent,
    NgIf,
    NgForOf,
    FooterComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  budgetForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    budget: new FormControl(null, [Validators.required, Validators.min(0)]),
  });
  expenseForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    amount: new FormControl(null, [Validators.required, Validators.min(0)]),
    budgetCategoryId: new FormControl('', [Validators.required]),
  });

  budgetCategories: BudgetCategory[] = [];
  budgets: Budget[] = [];
  budgetCards: BudgetCardConfig[] = [];
  expenseTableData: TableDataConfig[] = [];
  defaultCategory: string = '';

  constructor(
    public userService: UserService,
    private authService: AuthService,
    private budgetService: BudgetService,
    private expenseService: ExpenseService,
    private router: Router,
    private uiService: UiService,
    private api: ApiService,
  ) {}

  ngOnInit(): void {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found');
      this.router.navigate(['/login']);
      return;
    }
    this.budgetCategories = this.budgetService.getBudgetCategories();
    this.budgets = this.budgetService.getBudgets();
    this.buildBudgetCards(this.budgets);
    this.api.getBudgets().subscribe((data) => {
      console.log(data);
    });
    this.budgetService.getBudgetData().subscribe({
      next: (res: Budget[]) => {
        this.budgets = res;
        this.buildBudgetCards(this.budgets);
      },
      error: (error: any) => {
        console.error(error);
      },
    });

    this.budgetService.getBudgetCategoryData().subscribe({
      next: (res: BudgetCategory[]) => {
        this.budgetCategories = res;
      },
      error: (error: any) => {
        console.error(error);
      },
    });

    const expenses = this.expenseService.getExpenses();
    this.expenseTableData = this.expenseService.buildExpenseTable(expenses);
    this.expenseService.getExpenseData().subscribe({
      next: (res: Expense[]) => {
        this.expenseTableData = this.expenseService.buildExpenseTable(res);
      },
      error: (error: any) => {
        console.error(error);
      },
    });
  }

  getUsername(): string {
    const user = this.authService.getUserFromToken();
    return user?.username || user?.sub || 'Arina';
  }

  addBudget() {
    const budget: Budget = {
      id: uuidv4(),
      name: this.budgetForm.value.name,
      budget: parseInt(this.budgetForm.value.budget),
      spent: 0,
      color: this.uiService.generateRandomColor(this.budgets.length + 1),
    };
    this.budgetService.addBudget(budget);
    this.budgetForm.reset();
  }

  trackById(index: number, item: any) {
    return item.id;
  }

  addExpense() {
    if (this.expenseForm.valid) {
      const category = this.budgetService.getBudgetById(
        this.expenseForm.value.budgetCategoryId,
      );

      const expense: Expense = {
        id: uuidv4(),
        name: this.expenseForm.value.name,
        budgetCategory: category,
        amount: parseFloat(this.expenseForm.value.amount),
        date: new Date(),
      };

      this.expenseService.addExpense(expense);

      // Reset form with empty values to force dropdown reset
      this.expenseForm.reset({
        name: '',
        amount: null,
        budgetCategoryId: '',
      });

      // Force selection back to the default option
      setTimeout(() => {
        this.expenseForm.patchValue({
          budgetCategoryId: '',
        });
      }, 0);
    }
  }

  handleDelete(data: TableDataConfig) {
    this.expenseService.deleteExpenseById(data.id);
  }

  buildBudgetCards(budgets: Budget[]) {
    this.budgetCards = budgets.map((item: Budget) => {
      return {
        name: item.name,
        budget: item.budget,
        spent: item.spent,
        color: item.color,
        onClick: () => {
          this.router.navigateByUrl(`details/${item.id}`);
        },
      };
    });
  }
}
