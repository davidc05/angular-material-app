import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent implements OnInit {

  constructor(
    public userService: UserService,
  ) { }

  user;
  subscriptionPlan;

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem("profile"));
    this.subscriptionPlan = !this.userService.user
      ? '' : this.userService.user.subscriptionPlan;
  }
}
