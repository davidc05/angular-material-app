import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from "@angular/router";

@Injectable()
export class MyAccountResolver implements Resolve<any> {

  constructor(
  ) { }

  resolve(route: ActivatedRouteSnapshot) {
    let tabId = route.paramMap.get('tabId');
    return new Promise((resolve, reject) => {
        if(tabId){
            resolve(tabId);
        }
        else{
            resolve(null);
        }
    });
  }
}
