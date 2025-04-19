import { Component } from '@angular/core';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-nav-bar',
  imports: [],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent {
constructor(public userService: UserService) { }
}
