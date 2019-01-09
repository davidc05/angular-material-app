import { Injectable } from '@angular/core';
import { WatchlistApi, Watchlist, LoopBackFilter } from '../../../sdk'
import * as moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class WatchlistService {
    constructor(
        private watchlistApi: WatchlistApi
    ) { }

    createSearch(userEmail, ips, queryName, description) {
        const data = new Watchlist();
        data.queryName = queryName;
        data.userEmail = userEmail;

        data.ips = ips;

        data.description = description ? description : '';

        return this.watchlistApi.create<Watchlist>(data)
            .toPromise();
    }

    getUserSearchById(watchlistId) {
        return this.watchlistApi.findById<Watchlist>(watchlistId)
            .toPromise();
    }

    getUserSearchByName(name, userEmail) {
        let filter: LoopBackFilter = {
            "where": {
                "name": name,
                "userEmail": userEmail
            }
        }
        return this.watchlistApi.find<Watchlist>(filter);
    }

    getUserSearches(userEmail, createdDate) {
      return this.watchlistApi.getUserSearches(userEmail, moment(createdDate).format('YYYY-MM-DD'))
          .toPromise();
    }

    updateSearch(data) {
        return this.watchlistApi.updateAttributes<Watchlist>(data.id, data)
            .toPromise();
    }

    deleteSearch(id) {
        return this.watchlistApi.deleteById<Watchlist>(id)
            .toPromise();
    }
}
