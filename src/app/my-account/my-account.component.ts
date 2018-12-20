import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent implements OnInit {

  constructor(
    public userService: UserService,
    private route: ActivatedRoute,
  ) { }

  user;
  userEmail;
  subscriptionPlan;

  selectedTab

  ngOnInit() {
    this.route.data.subscribe(routeData => {
      this.selectedTab = routeData['tabId'];
    });

    this.user = JSON.parse(localStorage.getItem("profile"));
    this.userEmail = this.user.email;

    this.userService.getUserByEmail(this.user.email).then(res => {
      this.subscriptionPlan = res[0].subscriptionPlan
    })
  }

  onClickBuyApp() {
    window.open("https://musubu.io/app-pricing/", "_blank");
  }

}
