import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-subscription-level',
  templateUrl: './subscription-level.component.html',
  styleUrls: ['./subscription-level.component.css']
})
export class SubscriptionLevelComponent implements OnInit {

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

  onClickBuyApp(){
    window.open("https://musubu.io/app-pricing/", "_blank");
  }
}
