import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BudgetService } from '../../services/budget.service';
import { ExpenseService } from '../../services/expense.service';
import { TableDataConfig } from '../../interfaces/ui-config/table-data-config.interface';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
}

// Interfaces
export interface BudgetCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetCard {
  id: string;
  name: string;
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
  category: string;
  status: 'active' | 'inactive' | 'exceeded';
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseTableData {
  id: string;
  name: string;
  amount: number;
  category: string;
  categoryColor: string;
  date: Date;
  budgetCategoryId: string;
  description?: string;
}

@Component({
  selector: 'app-user', // Fixed: Changed to match UserComponent
  templateUrl: './user.component.html', // Fixed: Changed to match UserComponent
  styleUrls: ['./user.component.scss'], // Fixed: Changed to match UserComponent
  standalone: true, // Added standalone component
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NavBarComponent,
    // Add your custom components here when they're available
    // AppNavBarComponent,
    // AppFormWrapperComponent,
    // AppBudgetCardComponent,
    // AppTableComponent,
    // AppFooterComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Form Groups
  budgetForm!: FormGroup;
  expenseForm!: FormGroup;

  // Data Properties
  budgetCategories: BudgetCategory[] = [];
  budgetCards: BudgetCard[] = [];
  expenseTableData: ExpenseTableData[] = [];

  // Loading States
  isLoadingBudgets = false;
  isLoadingExpenses = false;
  isLoadingCategories = false;

  // UI States
  showExpenseFilters = false;

  constructor(
    private fb: FormBuilder,
    private budgetService: BudgetService,
    private expenseService: ExpenseService,
    private cdr: ChangeDetectorRef,
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize reactive forms with validation
   */
  private initializeForms(): void {
    this.budgetForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      budget: [
        '',
        [
          Validators.required,
          Validators.min(0.01),
          this.validateBudgetAmount.bind(this),
        ],
      ],
    });

    this.expenseForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      amount: [
        '',
        [
          Validators.required,
          Validators.min(0.01),
          this.validateExpenseAmount.bind(this),
        ],
      ],
      budgetCategoryId: ['', Validators.required],
      description: ['', Validators.maxLength(200)],
    });
  }

  /**
   * Setup form subscriptions for real-time validation
   */
  private setupFormSubscriptions(): void {
    this.budgetForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((values) => this.onBudgetFormChange(values));

    this.expenseForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((values) => this.onExpenseFormChange(values));
  }

  /**
   * Custom validator for budget amount
   */
  private validateBudgetAmount(
    control: AbstractControl,
  ): { [key: string]: any } | null {
    const value = control.value;
    if (value && (value > 1000000 || value < 0.01)) {
      return { invalidBudgetAmount: true };
    }
    return null;
  }

  /**
   * Custom validator for expense amount
   */
  private validateExpenseAmount(
    control: AbstractControl,
  ): { [key: string]: any } | null {
    const value = control.value;
    if (value && (value > 100000 || value < 0.01)) {
      return { invalidExpenseAmount: true };
    }
    return null;
  }

  /**
   * Load all initial data
   */
  private loadInitialData(): void {
    this.loadBudgetCategories();
    this.loadBudgetCards();
    this.loadRecentExpenses();
  }

  /**
   * Load budget categories
   */
  private loadBudgetCategories(): void {
    this.isLoadingCategories = true;

    this.budgetService
      .getBudgetCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.budgetCategories = categories;
          this.isLoadingCategories = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.handleError('Failed to load budget categories', error);
          this.isLoadingCategories = false;
          this.cdr.markForCheck();
        },
      });
  }

  /**
   * Load budget cards
   */
  private loadBudgetCards(): void {
    this.isLoadingBudgets = true;

    this.budgetService
      .getBudgets()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (budgets) => {
          this.budgetCards = budgets;
          this.isLoadingBudgets = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.handleError('Failed to load budgets', error);
          this.isLoadingBudgets = false;
          this.cdr.markForCheck();
        },
      });
  }

  /**
   * Load recent expenses
   */
  private loadRecentExpenses(): void {
    this.isLoadingExpenses = true;

    this.expenseService
      .getRecentExpenses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (expenses) => {
          this.expenseTableData = expenses;
          this.isLoadingExpenses = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.handleError('Failed to load expenses', error);
          this.isLoadingExpenses = false;
          this.cdr.markForCheck();
        },
      });
  }

  /**
   * Handle budget form changes
   */
  private onBudgetFormChange(values: any): void {
    // Real-time validation and formatting
    if (values.budget && typeof values.budget === 'string') {
      const numericValue = parseFloat(values.budget);
      if (!isNaN(numericValue)) {
        // Format currency display if needed
        console.log('Budget amount:', numericValue);
      }
    }
  }

  /**
   * Handle expense form changes
   */
  private onExpenseFormChange(values: any): void {
    // Real-time validation and formatting
    if (values.amount && typeof values.amount === 'string') {
      const numericValue = parseFloat(values.amount);
      if (!isNaN(numericValue)) {
        // Format currency display if needed
        console.log('Expense amount:', numericValue);
      }
    }
  }

  /**
   * Add new budget
   */
  addBudget(): void {
    if (this.budgetForm.valid) {
      const budgetData = {
        name: this.budgetForm.value.name.trim(),
        budget: parseFloat(this.budgetForm.value.budget),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.budgetService
        .createBudget(budgetData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (newBudget) => {
            this.budgetCards.push(newBudget);
            this.budgetForm.reset();
            this.cdr.markForCheck();
          },
          error: (error) => {
            this.handleError('Failed to create budget', error);
          },
        });
    } else {
      this.markFormGroupTouched(this.budgetForm);
    }
  }

  /**
   * Add new expense
   */
  addExpense(): void {
    if (this.expenseForm.valid) {
      const expenseData = {
        name: this.expenseForm.value.name.trim(),
        amount: parseFloat(this.expenseForm.value.amount),
        budgetCategoryId: this.expenseForm.value.budgetCategoryId,
        description: this.expenseForm.value.description?.trim() || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.expenseService
        .createExpense(expenseData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (newExpense) => {
            this.expenseTableData.unshift(newExpense);
            this.expenseForm.reset();
            this.updateBudgetCards();
            this.cdr.markForCheck();
          },
          error: (error) => {
            this.handleError('Failed to add expense', error);
          },
        });
    } else {
      this.markFormGroupTouched(this.expenseForm);
    }
  }

  /**
   * Handle expense deletion
   */
  handleDelete(expense: ExpenseTableData): void {
    if (confirm(`Are you sure you want to delete "${expense.name}"?`)) {
      this.expenseService
        .deleteExpense(expense.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.expenseTableData = this.expenseTableData.filter(
              (e) => e.id !== expense.id,
            );
            this.updateBudgetCards();
            this.cdr.markForCheck();
          },
          error: (error) => {
            this.handleError('Failed to delete expense', error);
          },
        });
    }
  }

  /**
   * Toggle expense filters
   */
  toggleExpenseFilters(): void {
    this.showExpenseFilters = !this.showExpenseFilters;
  }

  /**
   * Track by function for budget cards
   */
  trackByBudgetId(index: number, item: BudgetCard): string {
    return item.id;
  }

  /**
   * Track by function for expense table
   */
  trackByExpenseId(index: number, item: ExpenseTableData): string {
    return item.id;
  }

  /**
   * Update budget cards after expense changes
   */
  private updateBudgetCards(): void {
    this.loadBudgetCards();
  }

  /**
   * Mark all form controls as touched to trigger validation
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Handle errors consistently
   */
  private handleError(message: string, error: any): void {
    console.error(message, error);
    // Could add custom error handling here if needed
  }

  /**
   * Get form control for template access
   */
  getFormControl(
    formGroup: FormGroup,
    controlName: string,
  ): AbstractControl | null {
    return formGroup.get(controlName);
  }

  /**
   * Check if form control has specific error
   */
  hasFormError(
    formGroup: FormGroup,
    controlName: string,
    errorType: string,
  ): boolean {
    const control = formGroup.get(controlName);
    return (control?.hasError(errorType) && control?.touched) || false;
  }

  /**
   * Get form control error message
   */
  getFormErrorMessage(formGroup: FormGroup, controlName: string): string {
    const control = formGroup.get(controlName);
    if (control?.errors && control?.touched) {
      const fieldName =
        controlName.charAt(0).toUpperCase() + controlName.slice(1);

      if (control.errors['required']) {
        return `${fieldName} is required`;
      }
      if (control.errors['minlength']) {
        return `${fieldName} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['maxlength']) {
        return `${fieldName} must not exceed ${control.errors['maxlength'].requiredLength} characters`;
      }
      if (control.errors['min']) {
        return `${fieldName} must be greater than ${control.errors['min'].min}`;
      }
      if (control.errors['invalidBudgetAmount']) {
        return 'Budget amount must be between 0.01 and 1,000,000 MDL';
      }
      if (control.errors['invalidExpenseAmount']) {
        return 'Expense amount must be between 0.01 and 100,000 MDL';
      }
    }
    return '';
  }
}
