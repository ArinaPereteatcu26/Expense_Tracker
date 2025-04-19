import { Component } from '@angular/core';
import {UserService} from '../../services/user.service';
import {FormWrapperComponent} from '../../components/form-wrapper/form-wrapper.component';

@Component({
  selector: 'app-home',
  imports: [
    FormWrapperComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
constructor(public userService: UserService) {
}
}
