import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { TrendsService } from '../services/trends.service';

@Injectable()
export class TrendsResolver implements Resolve<any> {

  constructor(
    private trendsService: TrendsService
  ) { }

  resolve(route: ActivatedRouteSnapshot) {
    const user = JSON.parse(localStorage.getItem('profile'));
    return new Promise((resolve, reject) => {
      const watchlistsByThreatlevel = this.trendsService.watchlistByThreatlevel(user.email)
        .then(
            data => {
                return resolve({
                    watchlistsByThreatlevel: data.trends,
                });
            },
            err => {
                console.log(err);
                return resolve(null);
            }
        );
    });
  }
}
