import { Component, OnInit, OnDestroy } from '@angular/core';
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
import {
  NgClass,
  NgForOf,
  NgIf,
  NgSwitch,
  NgSwitchCase,
} from '@angular/common';
import { ApiService } from '../../services/api.service';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { FooterComponent } from '../../footer/footer.component';
import { Subject, takeUntil } from 'rxjs';

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  imports: [
    ReactiveFormsModule,
    BudgetCardComponent,
    NgIf,
    NgForOf,
    NgClass,
    NavBarComponent,
    FooterComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

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

  // UI State
  activeTab: string = 'home';
  isCollapsed: boolean = true;

  sidebarItems: SidebarItem[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'overview', label: 'Overview', icon: 'overview' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'logout', label: 'Log Out', icon: 'logout' },
  ];

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

    this.loadInitialData();
    this.subscribeToDataChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInitialData(): void {
    // Load initial data from services
    this.budgetCategories = this.budgetService.getBudgetCategories();
    this.budgets = this.budgetService.getBudgets();
    this.buildBudgetCards(this.budgets);

    const expenses = this.expenseService.getExpenses();
    this.expenseTableData = this.expenseService.buildExpenseTable(expenses);
  }

  private subscribeToDataChanges(): void {
    // Subscribe to budget data changes
    this.budgetService
      .getBudgetData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: Budget[]) => {
          this.budgets = res;
          this.buildBudgetCards(this.budgets);
        },
        error: (error: any) => {
          console.error('Error loading budget data:', error);
        },
      });

    // Subscribe to budget category data changes
    this.budgetService
      .getBudgetCategoryData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: BudgetCategory[]) => {
          this.budgetCategories = res;
        },
        error: (error: any) => {
          console.error('Error loading budget category data:', error);
        },
      });

    // Subscribe to expense data changes
    this.expenseService
      .getExpenseData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: Expense[]) => {
          this.expenseTableData = this.expenseService.buildExpenseTable(res);
        },
        error: (error: any) => {
          console.error('Error loading expense data:', error);
        },
      });

    // API call for budgets (if needed)
    this.api
      .getBudgets()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('API Budget data:', data);
        },
        error: (error) => {
          console.error('Error fetching budgets from API:', error);
        },
      });
  }

  private handleLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getTabClass(tabId: string): string {
    const baseClass =
      'w-full flex items-center px-4 py-3 rounded-lg transition-colors';
    if (this.activeTab === tabId) {
      return `${baseClass} bg-purple-600 text-white`;
    }
    return `${baseClass} text-gray-300 hover:bg-gray-700 hover:text-white`;
  }

  getUsername(): string {
    const user = this.authService.getClaims();
    return user?.username || user?.sub || 'User';
  }

  addBudget(): void {
    if (!this.budgetForm.valid) {
      this.markFormGroupTouched(this.budgetForm);
      return;
    }

    const budget: Budget = {
      id: uuidv4(),
      name: this.budgetForm.value.name,
      budget: parseInt(this.budgetForm.value.budget, 10),
      spent: 0,
      color: this.uiService.generateRandomColor(this.budgets.length + 1),
    };

    this.budgetService.addBudget(budget);
    this.budgetForm.reset();

    // Optionally show success message
    console.log('Budget added successfully');
  }

  addExpense(): void {
    if (!this.expenseForm.valid) {
      this.markFormGroupTouched(this.expenseForm);
      return;
    }

    const category = this.budgetService.getBudgetById(
      this.expenseForm.value.budgetCategoryId,
    );

    if (!category) {
      console.error('Invalid budget category selected');
      return;
    }

    const expense: Expense = {
      id: uuidv4(),
      name: this.expenseForm.value.name,
      budgetCategory: category,
      amount: parseFloat(this.expenseForm.value.amount),
      date: new Date(),
    };

    this.expenseService.addExpense(expense);

    // Reset form properly
    this.expenseForm.reset({
      name: '',
      amount: null,
      budgetCategoryId: '',
    });

    // Optionally show success message
    console.log('Expense added successfully');
  }

  handleDelete(event: Event, data: TableDataConfig): void {
    event.preventDefault();
    event.stopPropagation();

    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpenseById(data.id);
      console.log('Expense deleted successfully');
    }
  }

  trackById(index: number, item: any): string {
    return item.id || index.toString();
  }

  private buildBudgetCards(budgets: Budget[]): void {
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

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getPageTitle(): string {
    const titles: { [key: string]: string } = {
      home: 'Dashboard',
      overview: 'Overview',
      analytics: 'Analytics',
      settings: 'Settings',
    };
    return titles[this.activeTab] || 'Dashboard';
  }

  getPageSubtitle(): string {
    const subtitles: { [key: string]: string } = {
      home: 'Manage your budgets and track expenses',
      overview: 'Get insights into your spending patterns',
      analytics: 'Analyze your financial data',
      settings: 'Configure your account preferences',
    };
    return subtitles[this.activeTab] || 'Welcome to your expense tracker';
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;

    // Handle logout
    if (tabId === 'logout') {
      this.handleLogout();
      return;
    }

    // Handle navigation for other tabs if needed
    if (tabId === 'settings') {
      this.router.navigate(['/settings']);
    }
  }
}
