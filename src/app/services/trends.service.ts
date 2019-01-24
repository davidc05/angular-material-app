import { Injectable } from '@angular/core';
import { TrendsApi, Trends, LoopBackFilter } from '../../../sdk';

@Injectable({
    providedIn: 'root'
})
export class TrendsService {
    constructor(
        private trendsApi: TrendsApi
    ) { }

    watchlistByThreatlevel(userEmail) {
        return this.trendsApi.watchlistByThreatlevel(userEmail)
            .toPromise();
    }
}
