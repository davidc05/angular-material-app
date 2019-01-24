import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-trends',
    templateUrl: './trends.component.html',
    styleUrls: ['./trends.component.css']
})
export class TrendsComponent implements OnInit {

    trendsGridColumns: string[] = ['avg_threat_score', 'queryName'];
    watchlistsByThreatlevel;
    isLoading;
    constructor(
        private route: ActivatedRoute,
    ) { }

    ngOnInit() {
        this.route.data.subscribe(routeData => {
            const data = routeData['data'];
            if (data) {
                this.watchlistsByThreatlevel = data.watchlistsByThreatlevel;
            }
        });
    }

}
