import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(
    public userService: UserService,
  ) { }

  user;

  userEmail;

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem("profile"));
    console.log('=========', this.user)
    this.userEmail = this.user.email;
  }
}
