import { Injectable } from '@angular/core';
import { TrendsApi, Trends, LoopBackFilter } from '../../../sdk';

@Injectable({
    providedIn: 'root'
})
export class TrendsService {
    constructor(
        private trendsApi: TrendsApi
    ) { }

    getTrends(userEmail) {
        return this.trendsApi.getTrends(userEmail)
            .toPromise();
    }
}
