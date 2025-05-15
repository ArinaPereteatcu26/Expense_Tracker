import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Expense } from '../../interfaces/models/expense.interface';
import { BudgetService } from '../../services/budget.service';
import { BudgetCardComponent } from '../../components/budget-card/budget-card.component';
import { FormWrapperComponent } from '../../components/form-wrapper/form-wrapper.component';
import { v4 as uuidv4 } from 'uuid';
import { TableComponent } from '../../components/table/table.component';
import { UiService } from '../../services/ui.service';
import { BudgetCardConfig } from '../../interfaces/ui-config/budget-card-config.interface';
import { TableDataConfig } from '../../interfaces/ui-config/table-data-config.interface';
import { Budget } from '../../interfaces/models/budget.interface';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-budget-details',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    BudgetCardComponent,
    FormWrapperComponent,
    TableComponent,
    FooterComponent,
  ],
  templateUrl: './budget-details.component.html',
  styleUrl: './budget-details.component.scss',
})
export class BudgetDetailsComponent implements OnInit {
  budgetCard!: BudgetCardConfig;
  expenseTableData: TableDataConfig[] = [];
  budgetId: string = '';
  budget: Budget | null = null;

  expenseForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    amount: new FormControl(null, [Validators.required, Validators.min(0)]),
  });

  constructor(
    private router: Router,
    private budgetService: BudgetService,
    public uiService: UiService,
    private expenseService: ExpenseService,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.budgetId = params['id'];
      console.log('Budget ID:', this.budgetId); // Debug output

      // Get the budget data
      this.budget = this.budgetService.getBudgetById(this.budgetId);

      if (!this.budget) {
        console.error('Budget not found for ID:', this.budgetId);
        this.router.navigateByUrl(''); // Redirect to home if budget not found
        return;
      }

      this.initializeData();
      this.loadExpenses();

      // Subscribe to expense data changes to update the table
      this.expenseService.getExpenseData().subscribe({
        next: (res: Expense[]) => {
          this.loadExpenses();
          // Also update the budget data to reflect new expenses
          this.budget = this.budgetService.getBudgetById(this.budgetId);
          if (this.budget) {
            this.initializeData();
          }
        },
        error: (error: any) => {
          console.error('Error loading expenses:', error);
        },
      });

      // Subscribe to budget data changes as well
      this.budgetService.getBudgetData().subscribe({
        next: (res: Budget[]) => {
          // Find the current budget in the updated list
          this.budget = res.find((b) => b.id === this.budgetId) || null;
          if (this.budget) {
            this.initializeData();
          } else {
            console.error('Budget no longer exists!');
            this.router.navigateByUrl('');
          }
        },
        error: (error: any) => {
          console.error('Error loading budgets:', error);
        },
      });
    });
  }

  loadExpenses(): void {
    const expenses = this.expenseService.getExpenseByBudgetId(this.budgetId);
    this.expenseTableData = this.expenseService.buildExpenseTable(expenses);
  }

  addExpense() {
    if (this.expenseForm.valid && this.budget) {
      const expense: Expense = {
        id: uuidv4(),
        name: this.expenseForm.value.name,
        budgetCategory: this.budget,
        amount: parseInt(this.expenseForm.value.amount),
        date: new Date(),
      };

      // Add the expense
      this.expenseService.addExpense(expense);

      // Directly update the table data without waiting for subscription
      this.loadExpenses();

      // Update budget details
      this.budget = this.budgetService.getBudgetById(this.budgetId);
      if (this.budget) {
        this.initializeData();
      }

      // Reset the form
      this.expenseForm.reset();
    }
  }

  initializeData() {
    if (!this.budget) return;

    this.budgetCard = {
      name: this.budget.name,
      budget: this.budget.budget,
      spent: this.budget.spent,
      color: this.budget.color,
      onClick: () => {
        this.deleteBudget();
      },
    };
  }

  deleteBudget() {
    if (
      confirm(
        'Are you sure you want to delete this budget and all associated expenses?',
      )
    ) {
      this.expenseService.deleteExpenseByBudgetId(this.budgetId);
      this.budgetService.deleteBudgetById(this.budgetId);
      this.router.navigateByUrl('');
    }
  }

  handleAction($event: TableDataConfig) {
    this.expenseService.deleteExpenseById($event.id);

    // Update both the budget details and the expense table immediately after deletion
    this.budget = this.budgetService.getBudgetById(this.budgetId);
    if (this.budget) {
      this.initializeData();
    }
    this.loadExpenses();
  }
}
