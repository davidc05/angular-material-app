import { Injectable } from '@angular/core';
import { SavedSearchApi, SavedSearch, LoopBackFilter } from '../../../sdk'

@Injectable({
    providedIn: 'root'
})
export class WatchlistService {
    constructor(
        private watchlistApi: SavedSearchApi
    ) { }

    createSearch(userEmail, ips, queryName, description) {
        const data = new SavedSearch();
        data.queryName = queryName;
        data.userEmail = userEmail;

        data.ips = [];
        ips.forEach(element => {
            data.ips.push(element.label);
        });

        data.description = description ? description : '';

        return this.watchlistApi.create<SavedSearch>(data)
            .toPromise();
    }

    getUserSearchById(watchlistId) {
        return this.watchlistApi.findById<SavedSearch>(watchlistId)
            .toPromise();
    }

    getUserSearchByName(name, userEmail) {
        let filter: LoopBackFilter = {
            "where": {
                "name": name,
                "userEmail": userEmail
            }
        }
        return this.watchlistApi.find<SavedSearch>(filter);
    }

    getUserSearches(userEmail) {
        const filter: LoopBackFilter = {
            'where': {
                'userEmail': userEmail
            }
        };
        return this.watchlistApi.find<SavedSearch>(filter)
            .toPromise();
    }

    updateSearch(data) {
        return this.watchlistApi.updateAttributes<SavedSearch>(data.id, data)
            .toPromise();
    }

    deleteSearch(id) {
        return this.watchlistApi.deleteById<SavedSearch>(id)
            .toPromise();
    }
}
