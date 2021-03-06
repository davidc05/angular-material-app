import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component, OnInit, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IpsService } from '../services/ips.service';
import { WatchlistService } from '../services/watchlist.service';
import { TagsService } from '../services/tags.service';
import { MatSort, MatDialog, MatChipInputEvent, MatSlideToggleChange, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AgmMap, LatLngBounds } from '@agm/core';
import { UserService } from '../services/user.service';

declare var google: any;

export interface SaveListDialogData {
    queryName: string;
    description: string;
}

@Component({
    selector: 'app-gmap',
    templateUrl: './gmap.component.html',
    styleUrls: [
        './gmap.component.css',
        '../ip-query/ip-query.component.css'
    ]
})
export class GmapComponent implements OnInit, AfterViewInit {
    ipsList;
    ipsLimit;
    ipsGeoData;
    removable = true;
    map;
    maxZoomLevel = 16;
    addOnBlur = true;
    longitude = -98.35;
    latitude = 39.5;
    isLoading = false;
    isOpen = true;
    checked;

    user;
    subscriptionPlan;
    queryName;
    description;
    isFormInvalid: boolean;
    bounds: LatLngBounds;
    ipsData;

    readonly separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild('AgmMap') agmMap: AgmMap;
    @ViewChild('flagToggle') matSlideToggleChange: MatSlideToggleChange;
    constructor(
        public ipsService: IpsService,
        private watchlistService: WatchlistService,
        private tagsService: TagsService,
        private route: ActivatedRoute,
        public dialog: MatDialog,
        public userService: UserService,
    ) { }

    ngOnInit() {
        this.ipsList = [];
        this.ipsGeoData = [];
        this.ipsLimit = 50;

        this.queryName = '';
        this.description = '';

        this.user = this.userService.user;
        this.route.data.subscribe(routeData => {
            const queryData = routeData['queryData'];
            if (queryData && queryData.queryId && queryData.queryId.length !== 0) {
                this.ipsList = [];
                this.ipsService.dataSource.data = [];
                switch (queryData.queryType) {
                    case 'watchlist':
                        this.getAndRunUserSearch(queryData.queryId);
                        break;
                    case 'tag':
                        this.getAndRunTagSearch(queryData.queryId);
                        break;
                    default:
                        break;
                }
            }
        });

        this.route.data.subscribe(routeData => {
            this.subscriptionPlan = routeData.isLargePlanUser;
        });
    }

    ngAfterViewInit() {
        this.agmMap.mapReady.subscribe(map => {
            this.map = map;
        });
    }

    getAndRunUserSearch(watchlistId) {
        this.watchlistService.getUserSearchById(watchlistId).then(
            (result) => {
                this.ipsList = result.ips.map(item => item.ipaddress);
                this.ipsData = result.ips;
                this.handleIPsData(result.ips);
            },
            (err) => {

            }
        );
    }

    getAndRunTagSearch(tagId) {
        this.tagsService.getUserTagById(tagId).then(
            (result) => {
                this.ipsList = result.ips;
                this.submitQuery(this.ipsList);
            },
            (err) => {
                console.error(err);
            }
        );
    }

    // Save search
    save() {
        this.watchlistService.createSearch(this.user.email, this.ipsData, this.queryName, this.description).then(
            result => {

            },
            err => {

            }
        );
    }

    openDialog(): void {
        const dialogRef = this.dialog.open(SaveListDialog, {
            width: '275px',
            data: {
                queryName: this.queryName,
                description: this.description
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.queryName = result.queryName;
                this.description = result.description;
                this.save();
            }
        });
    }

    clear() {
        this.ipsList = [];
        this.ipsGeoData = [];
    }

    // Adds chips to the textbox
    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        // Add our ip
        if ((value || '').trim()) {
            if (this.ipsList.length < this.ipsLimit) {
                const trimmedValue = value.trim();
                if (!this.ipsList.includes(trimmedValue)) {
                    this.ipsList.push(value.trim());
                }
            }
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
        this.submitQuery(this.ipsList);
    }

    // Removes chips to the textbox
    remove(ip): void {
        const index = this.ipsList.indexOf(ip);
        if (index >= 0) {
            this.ipsList.splice(index, 1);
        }
        this.submitQuery(this.ipsList);
    }

    // Handles paste event for chips addition
    paste(event: ClipboardEvent): void {
        event.preventDefault();
        event.clipboardData
            .getData('Text')
            .split(/,|\n/)
            .forEach(value => {
                if ((value || '').trim()) {
                    if (this.ipsList.length < this.ipsLimit) {
                        const trimmedValue = value.trim();
                        if (!this.ipsList.includes(trimmedValue)) {
                            this.ipsList.push(value.trim());
                        }
                    }
                }
            });
    }

    setFlagShow() {
        this.isOpen = !this.isOpen;
        this.map.fitBounds(this.bounds);
    }

    private _submitQuery = (ipsList): void => {
        this.ipsService.highRiskCircle.count = 0;
        this.ipsService.mediumRiskCircle.count = 0;
        this.ipsService.lowRiskCircle.count = 0;
        this.ipsList = ipsList;
        this.isLoading = true;
        Promise.all(ipsList.map(ip => this.ipsService.getIpDetail(ip).then(data => data.ipDetail))).then(async (result) => {
            this.handleIPsData(result);
            this.ipsData = result;
            this.isLoading = await false;
        });
    }
    public get submitQuery() {
        return this._submitQuery;
    }
    public set submitQuery(value) {
        this._submitQuery = value;
    }

    handleIPsData(data) {
        this.checked = !!data.length;
        this.ipsGeoData = data.map((item: any) => ({
            latitude: item.latitude,
            longitude: item.longitude,
            ipaddress: item.ipaddress,
            threatLevel: item.threat_classification,
            blacklistClass: item.blacklist_class,
            iconUrl: {
                url: item.threat_classification === 'Low'
                    ? '../../assets/markers/green.svg'
                    : item.threat_classification === 'Medium'
                        ? '../../assets/markers/yellow.svg'
                        : '../../assets/markers/red.svg',
                scaledSize: {
                    width: 40,
                    height: 40
                }
            }
        }));
        this.bounds = new google.maps.LatLngBounds();
        data.forEach((item: any) => {
            this.bounds.extend(new google.maps.LatLng(item.latitude, item.longitude));
        });
        if (this.map && !!data.length) {
            this.map.fitBounds(this.bounds);
        }
    }
}


@Component({
    selector: 'app-gmap-save-dialog',
    templateUrl: 'save-list-dialog.html',
    styleUrls: ['../ip-query/ip-query.component.css']
})
export class SaveListDialog {

    constructor(
        public dialogRef: MatDialogRef<SaveListDialog>,
        @Inject(MAT_DIALOG_DATA) public data: SaveListDialogData) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

}
