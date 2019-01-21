import { Component, OnInit, Inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatChipInputEvent } from '@angular/material';
import { findIndex } from 'lodash';
import { User, ApiKey } from 'sdk';
import { ApiKeyService } from '../services/api-key.service';
import { ENTER, COMMA, SPACE } from '@angular/cdk/keycodes';

export interface DeleteUserDialogData {
  user: object;
}

export interface DeleteApiKeyDialogData {
  user: object;
}

export interface CreateUserDialogData {
  user: User;
  subscriptionPlans: object;
}

export interface CreateApiKeyDialogData {
  apiKey: ApiKey
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  constructor(private userService: UserService, private apiKeyService: ApiKeyService, public dialog: MatDialog) { }
  currentUser;
  users;
  apiKeys;
  subscriptionPlans;
  usersGridColumns: string[] = ['email', 'subscriptionPlan', 'isAdmin', 'deleteButton'];
  apiKeysGridColumns: string[] = ["key", "userId", "createdOn", "expiresAt", "totalCalls", "callLimit", "whitelistIps", "deleteButton"];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
  removable = true;

  ngOnInit() {
    let user = JSON.parse(localStorage.getItem("profile"));
    let userEmail = user.email
    this.userService.getUserByEmail(userEmail)
    .then(result => {
      this.currentUser = result[0];
    }, err =>{

    })

    this.getUsers();
    this.getApiKeys();
    this.userService.getSubscriptionPlans()
    .then(result => {
      this.subscriptionPlans = result;
    }, err => {

    });
  }

  getUsers(){
    this.userService.getUsers()
    .then(result => {
      this.users = result;
    }, err => {

    });
  }

  getApiKeys(){
    this.apiKeyService.getApiKeys()
    .then(result => {
      this.apiKeys = result;
      let userService = this.userService;
      this.apiKeys.forEach(function(apiKey, index){
        userService.getUserById(apiKey.userId)
        .then(userResult => {
          this.apiKeys[index].user = userResult;
        }, 
        err => {

        });
      }, this);
    }, err => {
      
    });
  }

  planChange(user, element){
    var oldSubscriptionPlan = user.subscriptionPlan;
    user.subscriptionPlan = element.value;
    this.updateUser(user);
  }

  updateUser(user){
    this.userService.updateSubscriptionPlan(user)
    .then(result => {
      this.getUsers();
    }, err => {
      //if unsuccessful, make sure we still reset values
      this.getUsers();
    })
  }

  openCreateDialog(): void {
    var newUser = new User();
    const dialogRef = this.dialog.open(CreateUserDialog, {
      width: '325px',
      data: {
        user: newUser,
        subscriptionPlans: this.subscriptionPlans
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.userService.createUser(result.user)
        .then(result =>{
          this.getUsers();
        }, err => {

        });
      }
    });
  }

  openCreateApiKeyDialog(): void {
    var newApiKey = new ApiKey();
    var userEmail = "";
    const dialogRef = this.dialog.open(CreateApiKeyDialog, {
      width: '325px',
      data: {
        apiKey: newApiKey,
        userEmail: userEmail
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.userService.getUserByEmail(result.userEmail)
        .then(userResult => {
          result.apiKey.userId = userResult[0].id;
          this.apiKeyService.createApiKey(result.apiKey)
          .then(result =>{
            this.getApiKeys();
          }, err => {

          });
        }, err =>{

        })
      }
    });
  }

  openDeleteDialog(user): void {
    const dialogRef = this.dialog.open(DeleteUserDialog, {
      width: '275px',
      data: {
        user: user
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.userService.deleteUser(result.user)
        .then(result =>{
          this.getUsers();
        }, err => {

        });
      }
    });
  }

  openDeleteApiKeyDialog(apiKey): void {
    const dialogRef = this.dialog.open(DeleteApiKeyDialog, {
      width: '275px',
      data: {
        apiKey: apiKey
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.apiKeyService.deleteApiKey(result.apiKey)
        .then(result =>{
          this.getApiKeys();
        }, err => {

        });
      }
    });
  }

  // Adds ip to the textbox
  add(event: MatChipInputEvent, apiKey): void {
    const input = event.input;
    const value = event.value;
    apiKey.whitelistIps.push(value.trim());
    //Save on DB
    this.updateApiKey(apiKey);
    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  // Removes chips to the textbox
  remove(ip, apiKey): void {
    const index = findIndex(apiKey.whitelistIps, function(o) { return o === ip; });
    if (index >= 0) {
      apiKey.whitelistIps.splice(index, 1);
      //Save on DB
      this.apiKeyService.updateApiKey(apiKey)
      .then(results => {

      }, err => {

      });
    }
  }

  updateApiKey(apiKey){
    var apiKeyCopy = {...apiKey};
    apiKeyCopy.user = undefined;
    this.apiKeyService.updateApiKey(apiKeyCopy)
    .then(results => {

    }, err => {

    });
  }
}
@Component({
  selector: 'delete-user-dialog',
  templateUrl: 'delete-user-dialog.html',
  styleUrls: ['admin.component.css']
})
export class DeleteUserDialog {

  constructor(
    public dialogRef: MatDialogRef<DeleteUserDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteUserDialogData
    ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}

@Component({
  selector: 'delete-api-key-dialog',
  templateUrl: 'delete-api-key-dialog.html',
  styleUrls: ['admin.component.css']
})
export class DeleteApiKeyDialog {

  constructor(
    public dialogRef: MatDialogRef<DeleteApiKeyDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteApiKeyDialogData
    ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}

@Component({
  selector: 'create-user-dialog',
  templateUrl: 'create-user-dialog.html',
  styleUrls: ['admin.component.css']
})
export class CreateUserDialog {

  constructor(
    public dialogRef: MatDialogRef<CreateUserDialog>,
    @Inject(MAT_DIALOG_DATA) public data: CreateUserDialogData
    ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onPlanSubscriptionSelect(){

  }

  onIsAdminCheck(){

  }

}

@Component({
  selector: 'create-api-key-dialog',
  templateUrl: 'create-api-key-dialog.html',
  styleUrls: ['admin.component.css']
})
export class CreateApiKeyDialog {

  constructor(
    public dialogRef: MatDialogRef<CreateApiKeyDialog>,
    @Inject(MAT_DIALOG_DATA) public data: CreateApiKeyDialogData
    ) { }

  readonly separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];

  onNoClick(): void {
    this.dialogRef.close();
  }

  removable = true;

  // Adds ip to the textbox
  add(event: MatChipInputEvent, apiKey): void {
    const input = event.input;
    const value = event.value;
    if(!apiKey.whitelistIps){
      apiKey.whitelistIps = [];
    }
    apiKey.whitelistIps.push(value.trim());
    // Reset the input value
    if (input) {
      input.value = '';
    }
  }
  remove(ip, apiKey): void {
    const index = findIndex(apiKey.whitelistIps, function(o) { return o === ip; });
    if (index >= 0) {
      apiKey.whitelistIps.splice(index, 1);
    }
  }
}