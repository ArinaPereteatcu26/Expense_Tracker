import {Component, Input} from '@angular/core';
import {BudgetCardConfig} from '../../interfaces/models/ui-config/budget-card-config.interface';
import {UiService} from '../../services/ui.service';
import {Router, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-budget-card',
  imports: [CommonModule],
  templateUrl: './budget-card.component.html',
  styleUrl: './budget-card.component.scss'
})
export class BudgetCardComponent {
@Input() config!: BudgetCardConfig;
@Input() isDelete: boolean = false;

bgColor:string='';
beforeColor:string='';
textColor:string='';
borderColor:string='';
constructor(private router: Router, private uiService: UiService){

}
ngOnInit():void{
  if(!this.config){
    return;
  }
  this.borderColor = this.uiService.generateTailwindClass(this.config.color, 'border')
  this.textColor = this.uiService.generateTailwindClass(this.config.color, 'text')
  this.bgColor = this.uiService.generateTailwindClass(this.config.color, 'bg')
}
}
