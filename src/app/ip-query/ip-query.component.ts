import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component, ChangeDetectorRef, OnInit, AfterContentInit, ViewChild, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatGridList, MatChipInputEvent, MatTableDataSource } from '@angular/material';
import { ObservableMedia, MediaChange } from '@angular/flex-layout';
import { IpsService } from '../services/ips.service';
import { WatchlistService } from '../services/watchlist.service';
import { MatSort, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TagsService } from '../services/tags.service';
import { AuthService } from '../services/auth.service';

import saveAs from 'file-saver';
import * as moment from 'moment';
import { UserService } from '../services/user.service';

import { map, filter, flatten, uniqBy, findIndex, chain, chunk } from 'lodash';

import { Address4, Address6 } from 'ip-address';

export interface Ip {
  label: string;
  threatLevel: string;
}

export interface IPSummary {
  ipaddress: string;
  threat_potential_score_pct: number;
  threat_classification: string;
  blacklist_class: string;
}

export interface QueryNameDialogData {
  queryName: string;
  description: string;
}

export interface ImportDialogData {
  ipsList: any[];
  ipQueryLimit: number;
}

@Component({
  selector: 'app-ip-query',
  templateUrl: './ip-query.component.html',
  styleUrls: ['./ip-query.component.css']
})
export class IpQueryComponent implements OnInit {
  // Chip input properties
  visible = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
  displayedColumns: string[] = ['ipaddress', 'threat_profile', 'blacklist_class', 'network_type'];
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('grid') grid: MatGridList;

  ipQueryLimit = 50;
  ipsList: Ip[] = [];

  subscriptionPlan;
  user;
  queryName;
  description;
  isFormInvalid: boolean;

  exportType = 'csv';

  threatClassifications;
  blacklistClasses;
  networkTypes;

  threatProfileOrder = ['High', 'Medium', 'Nuisance', 'Low'];

  selectedThreatClassification = 'All';
  selectedBlacklistClass = 'All';
  selectedNetworkType = 'All';

  isImportDisabled = true;
  upgradeToImport = true;

  knownNetworkTypes = [
    'Cryptocurrency Networks',
    'Broadband Networks',
    'Content Delivery Networks',
    'Government Networks',
    'Social Networking Networks',
    'Academic Networks',
    'File Sharing Networks',
    'Financial Networks',
    'Internet Authorities Networks',
    'Search Engine Networks',
    'Software Download Networks',
    'Worldwide Networks',
    'Entertainment Networks',
    'Cloud Services Platform',
    'Internet Security Networks',
    'Healthcare Networks',
    'TOR Anonymity Networks',
    'Private Networks',
    'No Entry'
  ];

  filteredResult = new MatTableDataSource([]);

  isLoading = false;

  constructor(
    public ipsService: IpsService,
    private observableMedia: ObservableMedia,
    private watchlistService: WatchlistService,
    private tagsService: TagsService,
    public userService: UserService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    let queryData: any = '';
    this.route.data.subscribe(routeData => {
      queryData = routeData['queryData'];
    });

    if (!!this.ipsService.dataSource.data.length
      && (queryData !== 'watchlist' || queryData !== 'tags')
    ) {
      this.ipsList = this.ipsService.dataSource.data.map(item => ({
        label: item.ipaddress,
        threatLevel: queryData && queryData.queryType === 'watchlist' ? item.threat_classification : ''
      }));
      this.handleIpsDetail(this.ipsService.dataSource.data);
    }

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

    this.filteredResult.sort = this.sort;
    this.user = JSON.parse(localStorage.getItem("profile"));
    var isAuthenticated = this.authService.isAuthenticated();
    let self = this;

    if (isAuthenticated) {
      this.userService.getUserByEmail(this.user.email)
        .then(result => {
          this.subscriptionPlan = result[0].subscriptionPlan;
        });
      if (!!this.userService.user && this.userService.user.subscriptionPlanObject && this.userService.user.subscriptionPlanObject.ipQueryLimit) {
        this.ipQueryLimit = this.userService.user.subscriptionPlanObject.ipQueryLimit;
      }
    } else {
      self.authService.lock.on("authenticated", function(authResult) {
        self.authService.lock.getUserInfo(authResult.accessToken, function(error, profile) {
          if (error) {
            return;
          }
          self.userService.getUserByEmail(profile.email)
            .then(result => {
              self.subscriptionPlan = result[0].subscriptionPlan
            });
          if (self.userService.user.subscriptionPlanObject && self.userService.user.subscriptionPlanObject.ipQueryLimit) {
            self.ipQueryLimit = self.userService.user.subscriptionPlanObject.ipQueryLimit;
          }

          if (self.userService.user.subscriptionPlanObject
            && self.userService.user.subscriptionPlanObject.name !== 'free') {
            self.isImportDisabled = !(self.ipsList.length === 0);
            self.upgradeToImport = false;
          }
        });
      });
    }

    this.queryName = '';
    this.description = '';

    this.ipsService.highRiskCircle.title = ['High', 'Risk', ''];
    this.ipsService.highRiskCircle.riskLevel = 'High';
    this.ipsService.highRiskCircle.backgroundColor = '#FDC6CB';
    this.ipsService.highRiskCircle.outerStrokeColor = '#dc3545';
    this.ipsService.highRiskCircle.radius = '70';

    this.ipsService.mediumRiskCircle.title = ['Medium', 'Risk', ''];
    this.ipsService.mediumRiskCircle.subtitle = this.ipsService.mediumRiskCount.toString();
    this.ipsService.mediumRiskCircle.riskLevel = 'Medium';
    this.ipsService.mediumRiskCircle.backgroundColor = '#FFE9A9';
    this.ipsService.mediumRiskCircle.outerStrokeColor = '#ffc107';
    this.ipsService.mediumRiskCircle.radius = '70';

    this.ipsService.lowRiskCircle.title = ['Low', 'Risk', ''];
    this.ipsService.lowRiskCircle.subtitle = this.ipsService.lowRiskCount.toString();
    this.ipsService.lowRiskCircle.riskLevel = 'Low';
    this.ipsService.lowRiskCircle.backgroundColor = '#B8ECC3';
    this.ipsService.lowRiskCircle.outerStrokeColor = '#28a745';
    this.ipsService.lowRiskCircle.radius = '70';
  }

  getAndRunUserSearch(watchlistId) {
    this.isLoading = true;
    this.watchlistService.getUserSearchById(watchlistId).then(
      (result) => {
        if (result && result.ips) {
          this.ipsList = result.ips.map(ip => ({ label: ip, threatLevel: '' }));

          this.ipsService.highRiskCircle.count = 0;
          this.ipsService.mediumRiskCircle.count = 0;
          this.ipsService.lowRiskCircle.count = 0;

          let self = this;

          if (this.ipsList.length !== 0) {
            this.validateIpListDeferred(this.ipsList)
              .then(async (cleanIpsList) => {
                this.isFormInvalid = false;
                let ipsChunk = chunk(cleanIpsList, 20);

                this.processArray(ipsChunk).then((result) => {
                    const ipsDetail = flatten(result.map(item => item.ipsDetail));

                    self.ipsList = ipsDetail.map(ip => ({
                      label: ip.ipaddress,
                      threatLevel: ip.threat_classification
                    }));

                    this.handleIpsDetail(ipsDetail);
                    this.isLoading = false;
                }, (reason) => {
                    // rejection happened
                    this.isLoading = false;
                });

              }, (invalidList) => {
                this.isFormInvalid = true;
                this.ipsService.dataSource.data = [];
              });
          }
        }
      },
      (err) => {

      }
    );
  }

  getAndRunTagSearch(tagId) {
    this.tagsService.getUserTagById(tagId).then(
      (result) => {
        if (result && result.ips) {
          result.ips.forEach(ip => {
            this.ipsList.push({ label: ip, threatLevel: '' });
          });
        }
        this.submitQuery(this.ipsList);
      },
      (err) => {
        console.error(err);
      }
    );
  }

  // Save search
  save() {
    this.watchlistService.createSearch(this.user.email, this.ipsList, this.queryName, this.description).then(
      result => {

      },
      err => {

      }
    );
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(QueryNameDialogComponent, {
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

  openImportDialog(): void {
    const importDialogRef = this.dialog.open(ImportDialogComponent, {
      width: '375px',
      data: {
        ipsList: this.ipsList,
        ipQueryLimit: this.ipQueryLimit
      }
    });

    importDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.ipsList = result.ipsList;
        this.submitQuery(this.ipsList);
      }
    });
  }

  export() {
    const fileName = `musubu_ip_details_${moment().format()}`;
    const dataToExport = this.ipsService.dataSource.data;

    if (this.exportType === 'json') {

      const blobToExport = new Blob([JSON.stringify(dataToExport)], { type: 'text/plain;charset=utf-8' });
      saveAs(blobToExport, fileName + '.json');

    } else { // exportType === 'csv'

      const header = Object.keys(dataToExport[0]);
      dataToExport.map(row => this.cleanRowArrays(row)); // clean any arrays up with pipes
      const csv = dataToExport.map(row => header.map(fieldName => JSON.stringify(row[fieldName])).join(','));
      csv.unshift(header.join(','));
      const csvArray = csv.join('\r\n');
      const blobToExport = new Blob([csvArray], { type: 'text/csv' });
      saveAs(blobToExport, fileName + '.csv');

    }
  }

  cleanRowArrays(row: any): any {

    Object.keys(row).forEach((keyString) => {
      if (Array.isArray(row[keyString])) {
        row[keyString] = row[keyString].join('|');
      }
    });

    return row;
  }

  // Clears chips
  clear() {
    this.ipsList = [];
  }

  // Adds chips to the textbox
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our ip
    if ((value || '').trim()) {
      if (this.ipsList.length < this.ipQueryLimit) {
        const trimmedValue = value.trim();
        if (findIndex(this.ipsList, function(o) { return o.label === trimmedValue; }) === -1) {
          this.ipsList.push({ label: value.trim(), threatLevel: '' });
        }
      }
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  // Removes chips to the textbox
  remove(ip): void {
    const index = findIndex(this.ipsList, function(o) { return o.label === ip; });
    if (index >= 0) {
      this.ipsList.splice(index, 1);
    }
  }

  // Handles paste event for chips addition
  paste(event: ClipboardEvent): void {
    event.preventDefault();
    event.clipboardData
      .getData('Text')
      .split(/,|\n/)
      .forEach(value => {
        if ((value || '').trim()) {
          if (this.ipsList.length < this.ipQueryLimit) {
            const trimmedValue = value.trim();
            if (findIndex(this.ipsList, function(o) { return o.label === trimmedValue; }) === -1) {
              this.ipsList.push({ label: value.trim(), threatLevel: '' });
            }
          }
        }
      });
  }

  onClickBuyApp() {
    window.open('https://musubu.io/app-pricing/', '_blank');
  }

  // handle search result filter option change event
  filterValueChange(filterName, value) {
    this.selectedThreatClassification = filterName === 'threatClassification' ? value : this.selectedThreatClassification;
    this.selectedBlacklistClass = filterName === 'blacklistClass' ? value : this.selectedBlacklistClass;
    this.selectedNetworkType = filterName === 'networkType' ? value : this.selectedNetworkType;

    this.filteredResult.data = this.ipsService.dataSource.data
      .map(item => !item.network_type.length ? { ...item, network_type: ['No Entry'] } : item)
      .filter(item => this.selectedThreatClassification === 'All'
        ? true
        : item.threat_classification === this.selectedThreatClassification)
      .map(item => ({
        ...item,
        threat_profile: `${item.threat_potential_score_pct} (${item.threat_classification})`,
      }))
      .filter(item => this.selectedBlacklistClass === 'All'
        ? true
        : item.blacklist_class === this.selectedBlacklistClass)
      .filter(item => this.selectedNetworkType === 'All'
        ? true
        : item.network_type.indexOf(this.selectedNetworkType) > -1)
      .map(item => ({
        ...item,
        network_type: filter(item.network_type, (item) => this.knownNetworkTypes.indexOf(item) > -1).join(', ')
      }));

      this.threatClassifications =
        this.sortThreatProfileOptions(
          chain(filterName === 'threatClassification' ? this.ipsService.dataSource.data : this.filteredResult.data)
          .map(item => item.threat_classification)
          .uniqBy()
          .value()
        );
      this.blacklistClasses =
        chain(filterName === 'blacklistClass' ? this.ipsService.dataSource.data : this.filteredResult.data)
        .map(item => item.blacklist_class)
        .uniqBy()
        .value()
        .sort();
      this.networkTypes =
        chain(filterName === 'networkType'
          ? this.ipsService.dataSource.data.map(item => !item.network_type.length ? { ...item, network_type: ['No Entry'] } : item)
          : this.filteredResult.data)
        .map(item => {
          return filterName === 'networkType' ? item.network_type : item.network_type.split(', ')
        })
        .flatten()
        .uniqBy()
        .filter(item => this.knownNetworkTypes.indexOf(item) > -1)
        .value()
        .sort();

      this.selectedThreatClassification = filterName === 'threatClassification'
        ? value
        : this.threatClassifications.length > 1 ? 'All' : this.selectedThreatClassification;
      this.selectedBlacklistClass = filterName === 'blacklistClass'
        ? value
        : this.blacklistClasses.length > 1 ? 'All' : this.selectedBlacklistClass;
      this.selectedNetworkType = filterName === 'networkType'
        ? value
        : this.networkTypes.length > 1 ? 'All' : this.selectedNetworkType;

      if (!this.threatClassifications.length) {
        this.threatClassifications.push(this.selectedThreatClassification);
      }
      if (!this.blacklistClasses.length) {
        this.blacklistClasses.push(this.selectedBlacklistClass);
      }
      if (!this.networkTypes.length) {
        this.networkTypes.push(this.selectedNetworkType);
      }
  }

  resetFilters() {
    this.selectedThreatClassification = 'All';
    this.selectedBlacklistClass = 'All';
    this.selectedNetworkType = 'All';

    this.filteredResult.data = this.ipsService.dataSource.data
      .map(item => !item.network_type.length ? { ...item, network_type: ['No Entry'] } : item)
      .map(item => ({
        ...item,
        threat_profile: `${item.threat_potential_score_pct} (${item.threat_classification})`,
      }));

    this.threatClassifications =
      this.sortThreatProfileOptions(
        chain(this.filteredResult.data)
        .map(item => item.threat_classification)
        .uniqBy()
        .value()
      );
    this.blacklistClasses =
      chain(this.filteredResult.data)
      .map(item => item.blacklist_class)
      .uniqBy()
      .value()
      .sort();
    this.networkTypes =
      chain(this.filteredResult.data)
      .map(item => item.network_type)
      .flatten()
      .uniqBy()
      .filter(item => this.knownNetworkTypes.indexOf(item) > -1)
      .value()
      .sort();
  }

  async processArray (array) {
    let results = [];
    for (let i = 0; i < array.length; i++) {
        let r = await this.ipsService.getIpsDetail(array[i]);
        results.push(r);
    }
    return results;    // will be resolved value of promise
  }

  submitQuery = (ipsList): void => {
    this.ipsList = ipsList;

    if (ipsList.length !== 0) {
      this.isLoading = true;
      this.validateIpListDeferred(ipsList)
        .then(async (cleanIpsList) => {
          this.isFormInvalid = false;
          let ipsChunk = chunk(cleanIpsList, 20);

          this.processArray(ipsChunk).then((result) => {
              const ipsDetail = flatten(result.map(item => item.ipsDetail))
              this.handleIpsDetail(ipsDetail);
              this.isLoading = false;
          }, (reason) => {
              // rejection happened
              this.isLoading = false;
          });

        }, (invalidList) => {
          this.isFormInvalid = true;
          this.ipsService.dataSource.data = [];
          this.isLoading = false;
        });
    }
  }

  handleIpsDetail = (ipsDetail): any => {
    this.ipsService.highRiskCircle.count = 0;
    this.ipsService.mediumRiskCircle.count = 0;
    this.ipsService.lowRiskCircle.count = 0;

    this.threatClassifications =
      this.sortThreatProfileOptions(
        chain(ipsDetail)
        .map(item => item.threat_classification)
        .uniqBy()
        .value()
      );

    this.blacklistClasses =
      chain(ipsDetail)
      .map(item => item.blacklist_class)
      .uniqBy()
      .value()
      .sort();

    this.networkTypes =
      chain(ipsDetail.map(item => !item.network_type.length ? { ...item, network_type: ['No Entry'] } : item))
      .map(item => item.network_type)
      .flatten()
      .uniqBy()
      .filter(item => this.knownNetworkTypes.indexOf(item) > -1)
      .value()
      .sort();

    this.ipsService.dataSource.data = ipsDetail;
    this.filteredResult.data = ipsDetail
      .map(item => !item.network_type.length ? {...item, network_type: ['No Entry']} : item)
      .map(item => ({
        ...item,
        threat_profile: `${item.threat_potential_score_pct} (${item.threat_classification})`,
        network_type: filter(item.network_type, (item) => this.knownNetworkTypes.indexOf(item) > -1).join(', ')
      }));

    if (ipsDetail.length === 1) {
      this.selectedThreatClassification = this.threatClassifications[0];
      this.selectedBlacklistClass = this.blacklistClasses[0];
      this.selectedNetworkType = this.networkTypes[0];
    }

    this.ipsService.dataSource.sort = this.sort;

    ipsDetail.forEach(element => {
      if (element.threat_classification === 'High') {
        this.ipsService.highRiskCircle.count++;
      }
      if (element.threat_classification === 'Medium') {
        this.ipsService.mediumRiskCircle.count++;
      }
      if (element.threat_classification === 'Low') {
        this.ipsService.lowRiskCircle.count++;
      }
    });
  }

  validateIpListDeferred = (ipsList): any => {
    return new Promise(function (resolve, reject) {
      let anyInvalids = false;
      ipsList.forEach(ip => {
        const addressV6 = new Address6(ip.label);
        const addressV4 = new Address4(ip.label);

        const isValidIP = (addressV4.isValid() || addressV6.isValid());

        if (!isValidIP) {
          anyInvalids = true;
          ip.isInvalid = true;
        } else {
          ip.isInvalid = false;
        }
      });

      if (anyInvalids) {
        reject(ipsList);
      } else {
        const arrayOfStrings = [];
        ipsList.forEach(element => {
          arrayOfStrings.push(element.label);
        });
        resolve(arrayOfStrings);
      }

    });
  }


  gridByBreakpoint = {
    xl: 3,
    lg: 3,
    md: 3,
    sm: 3,
    xs: 1
  }

  sortThreatProfileOptions(options) {
    const result = options
      .map(item => ({
        index: this.threatProfileOrder.indexOf(item),
        option: item
      }))
      .sort((a, b) => {
        if (a.index < b.index) {
          return -1;
        } else {
          return 1;
        }
      })
      .map(item => item.option);
     return result;
  }

  ngAfterContentInit(): void {
    this.observableMedia.asObservable().subscribe((change: MediaChange) => {
      this.grid.cols = this.gridByBreakpoint[change.mqAlias];
    });
  }
}

@Component({
  selector: 'app-query-name-dialog',
  templateUrl: 'query-name-dialog.html',
  styleUrls: ['ip-query.component.css']
})
export class QueryNameDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<QueryNameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: QueryNameDialogData) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}

@Component({
  selector: 'app-import-dialog',
  templateUrl: 'import-dialog.html',
  styleUrls: ['ip-query.component.css']
})
export class ImportDialogComponent {

  importFileType = 'csv';
  fileChanged = false;

  constructor(
    public dialogRef: MatDialogRef<ImportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImportDialogData) {
      data.ipsList = [];
      this.fileChanged = false;
    }

  onNoClick(): void {
    this.dialogRef.close();
  }

  fileChange(event) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
        this.fileChanged = false;
        const file: File = fileList[0];

        const reader = new FileReader();
        reader.onload = () => {
            // this 'text' is the content of the file
            const text = reader.result as string;
            if (this.importFileType === 'json') {
              const parsed = JSON.parse(text);

              for (let i = 0; i < parsed.length; i++) {
                if (i - 1 >= this.data.ipQueryLimit) {
                  break;
                } else {
                  this.data.ipsList.push({label: parsed[i].ipaddress});
                }
              }

            } else { // is a csv

              const ips = text.split(',');
              ips.forEach((element) => {
                this.data.ipsList.push({label: element.replace(/\"*/gi, '') });
              });

            }
            this.fileChanged = true;
        };
        reader.readAsText(file);
    }
  }
}
