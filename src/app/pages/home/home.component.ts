import {Component, OnInit} from '@angular/core';
import {UserService} from '../../services/user.service';
import {FormWrapperComponent} from '../../components/form-wrapper/form-wrapper.component';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {BudgetService} from '../../services/buget.service';
import {ExpenseService} from '../../services/expense.service';
import {BudgetCategory} from '../../interfaces/models/budget-category-interface';
import {Budget} from '../../interfaces/models/budget.interface';
import {v4 as uuidv4} from 'uuid';
import {BudgetCardConfig} from '../../interfaces/models/ui-config/budget-card-config.interface';
import {Router} from '@angular/router';
import {BudgetCardComponent} from '../../components/budget-card/budget-card.component';


@Component({
  selector: 'app-home',
  imports: [
    FormWrapperComponent,
    ReactiveFormsModule,
    BudgetCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  budgetForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    budget: new FormControl(null, [Validators.required])
  })
  expenseForm: FormGroup = new FormGroup(
    {
      name:new FormControl('', [Validators.required]),
      amount:new FormControl(null, [Validators.required]),
      budgetCategoryId:new FormControl(null, [Validators.required]),

    })

  budgetCategories: BudgetCategory[] = [];
  budgets: Budget[] = [];
  budgetCards: BudgetCardConfig[] = [];

constructor(public userService: UserService, private budgetService: BudgetService,
            private expenseService: ExpenseService, private router: Router) {
}
ngOnInit():void {
    this.budgetCategories = this.budgetService.getBudgetCategories();
    this.budgets=this.budgetService.getBudgets();

this.budgetService.getBudgetData().subscribe({
  next: (res: Budget[]) =>{
    this.budgets = res;
    this.buildBudgetCards(this.budgets);
  },
  error: (error: any) => {
    console.error(error);
  }
})

  this.budgetService.getBudgetCategoryData().subscribe({
    next: (res: BudgetCategory[]) => {
      this.budgetCategories = res;
    },
    error: (error: any) =>{
      console.error(error)
    }
  })
}
addBudget(){
  const budget: Budget = {
    id: uuidv4(),
    name: this.budgetForm.value.name,
  budget:  parseInt(this.budgetForm.value.budget),
  spent: 0,
  color: 'amber'
  }
  this.budgetService.addBudget(budget);
  this.budgetForm.reset();
}

buildBudgetCards(budgets: Budget[]) {
  this.budgetCards = budgets.map((item: Budget) =>{
  return{
    name:item.name,
    budget: item.budget,
    spent: item.spent,
    color: item.color,
    onClick: () =>{
      this.router.navigateByUrl(`details/${item.id}`);
    }
  }
})
}
}

