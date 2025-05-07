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

  expenseForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    amount: new FormControl(null, [Validators.required]),
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
      this.initializeData();
      this.loadExpenses();

      // Subscribe to expense data changes to update the table
      this.expenseService.getExpenseData().subscribe({
        next: (res: Expense[]) => {
          this.loadExpenses();
        },
        error: (error: any) => {
          console.error(error);
        },
      });
    });
  }

  loadExpenses(): void {
    const expenses = this.expenseService.getExpenseByBudgetId(this.budgetId);
    this.expenseTableData = this.expenseService.buildExpenseTable(expenses);
  }

  addExpense() {
    if (this.expenseForm.valid) {
      const category = this.budgetService.getBudgetCategoryById(this.budgetId);
      const expense: Expense = {
        id: uuidv4(),
        name: this.expenseForm.value.name,
        budgetCategory: category,
        amount: parseInt(this.expenseForm.value.amount),
        date: new Date(),
      };

      // Add the expense
      this.expenseService.addExpense(expense);

      // Directly update the table data without waiting for subscription
      const expenses = this.expenseService.getExpenseByBudgetId(this.budgetId);
      this.expenseTableData = this.expenseService.buildExpenseTable(expenses);

      // Update budget details
      this.initializeData();

      // Reset the form
      this.expenseForm.reset();
    }
  }

  initializeData() {
    const budget = this.budgetService.getBudgetById(this.budgetId);

    this.budgetCard = {
      name: budget.name,
      budget: budget.budget,
      spent: budget.spent,
      color: budget.color,
      onClick: () => {
        this.deleteBudget();
      },
    };
  }

  deleteBudget() {
    this.expenseService.deleteExpenseByBudgetId(this.budgetId);
    this.budgetService.deleteBudgetById(this.budgetId);
    this.router.navigateByUrl('');
  }

  handleAction($event: TableDataConfig) {
    this.expenseService.deleteExpenseById($event.id);

    // Update both the budget details and the expense table immediately after deletion
    this.initializeData();
    this.loadExpenses();
  }
}
