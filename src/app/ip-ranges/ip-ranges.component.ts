import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { IpsService } from '../services/ips.service';

import { map, filter, uniqBy, flatten, chain } from 'lodash';

export interface IpRangesFilters {
  networkName: string;
  networkType: string;
  networkGroup: string;
}

export interface IpsListFilters {
  threatClassification: string;
  blacklistClass: string;
  networkType: string;
}

@Component({
  selector: 'app-ip-ranges',
  templateUrl: './ip-ranges.component.html',
  styleUrls: ['./ip-ranges.component.css']
})
export class IpRangesComponent implements OnInit {

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource([]);
  private sort: MatSort;
  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }
  @ViewChild('paginator') paginator: MatPaginator;
  constructor(
    private route: ActivatedRoute,
    private ipsService: IpsService,
    private router: Router,
    private _location: Location,
  ) { }
  ipRangesColumns: string[] = ['ip_start_int', 'ip_end_int', 'network_name', 'network_type', 'network_group'];
  ipsListColumns: string[] = ['ipaddress', 'threat_profile', 'blacklist_class', 'network_type'];

  ipRanges = [];
  ipsList = [];
  totalIpRanges;
  ipsListByBlacklistNeighbors;

  page = 1;
  pageSize = 50;
  itemsLength: number;

  title = '';
  currentRoute;
  queryParam;
  isLoading = false;

  threatProfileOrder = ['High', 'Medium', 'Nuisance', 'Low'];

  networkTypes;
  networkNames;
  networkGroups;

  threatClassifications;
  blacklistClasses;

  selectedNetworkName = '';
  selectedNetworkType = '';
  selectedNetworkGroup = '';

  selectedThreatClassification = '';
  selectedBlacklistClass = '';

  selectedIpRangesFilters: IpRangesFilters;
  selectedIpsListFilters: IpsListFilters;

  filteredIpRangesResult = new MatTableDataSource([]);
  filteredIpsListResult = new MatTableDataSource([]);

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
  ];

  ngOnInit() {
    this.router.events.subscribe((event: NavigationEnd) => {
      if(event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
    this.route.data.subscribe(routeData => {
      this.currentRoute = routeData.ipRanges.currentRoute;
      this.queryParam = routeData.ipRanges.queryParam;

      switch (routeData.ipRanges.currentRoute) {
        case 'network-type':
          this.title = 'Network Type';
          this.itemsLength = routeData.ipRanges.ipRanges.result_count;
          this.dataSource.data = routeData.ipRanges.ipRanges.entries;
          break;
        case 'network-name':
          this.title = 'Network Name';
          this.itemsLength = routeData.ipRanges.ipRanges.result_count;
          this.dataSource.data = routeData.ipRanges.ipRanges.entries;
          break;
        case 'network-group':
          this.title = 'Network Group';
          this.itemsLength = routeData.ipRanges.ipRanges.result_count;
          this.dataSource.data = routeData.ipRanges.ipRanges.entries;
          break;
        case 'isp-name':
          this.title = 'ISP Name';
          this.dataSource.data = routeData.ipRanges.ipsData;
          this.itemsLength = routeData.ipRanges.result_count;
          break;
        case 'blacklist-neighbors':
          this.title = 'Blacklist Network Neighbors';
          this.ipsListByBlacklistNeighbors = routeData.ipRanges.ipsData;
          this.dataSource.data = routeData.ipRanges.ipsData.slice(0, this.pageSize);
          this.itemsLength = routeData.ipRanges.result_count;
          break;
        default:
          break;
      }
      if (this.currentRoute === 'network-name' || this.currentRoute === 'network-type' || this.currentRoute === 'network-group') {
        this.initIpRangesFilter(this.dataSource.data);
      } else {
        this.initIpsListFilter(this.dataSource.data);
      }
    });

    this.filteredIpRangesResult.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
      if (typeof data[sortHeaderId] === 'string') {
        return data[sortHeaderId].toLocaleLowerCase();
      }
      return data[sortHeaderId];
    };
  }

  setDataSourceAttributes() {
    this.dataSource.sort = this.sort;
    this.filteredIpRangesResult.sort = this.sort;
    this.filteredIpsListResult.sort = this.sort;
  }

  getPageInfo(e) {
    this.isLoading = true;
    this.selectedIpRangesFilters = {
      networkType: '',
      networkName: '',
      networkGroup: ''
    };
    this.selectedIpsListFilters = {
      threatClassification: '',
      blacklistClass: '',
      networkType: ''
    };
    this.selectedNetworkType = '';
    this.selectedNetworkName = '';
    this.selectedNetworkGroup = '';

    this.selectedThreatClassification = '';
    this.selectedBlacklistClass = '';
    return new Promise((resolve, reject) => {
      switch(this.currentRoute) {
        case 'network-name':
          this.ipsService.getIpRangesByNetworkName(this.queryParam, (e.pageIndex + 1).toString())
            .then(data => {
              this.dataSource.data = data.ipRanges.entries;
              this.initIpRangesFilter(this.dataSource.data);
              this.isLoading = false;
            }, err => resolve(null));
          break;
        case 'network-type':
          this.ipsService.getIpRangesByNetworkType(this.queryParam, (e.pageIndex + 1).toString())
            .then(data => {
              this.dataSource.data = data.ipRanges.entries;
              this.initIpRangesFilter(this.dataSource.data);
              this.isLoading = false;
            }, err => resolve(null));
          break;
        case 'network-group':
          this.ipsService.getIpRangesByNetworkGroup(this.queryParam, (e.pageIndex + 1).toString())
            .then(data => {
              this.dataSource.data = data.ipRanges.entries;
              this.initIpRangesFilter(this.dataSource.data);
              this.isLoading = false;
            }, err => resolve(null));
          break;
        case 'isp-name':
          this.ipsService.getIpRangesByIspName(this.queryParam, (e.pageIndex + 1).toString())
            .then(data => {
              const ips = data.ipRanges.entries.map(item => item.ipaddress);
              this.ipsService.getIpsDetail(ips).then(response => {
                this.dataSource.data = response.ipsDetail;
                this.initIpsListFilter(this.dataSource.data);
                this.isLoading = false;
              });
            }, err => resolve(null));
          break;
        case 'blacklist-neighbors':
          this.dataSource.data = this.ipsListByBlacklistNeighbors.slice(
            e.pageIndex * (this.pageSize - 1),
            e.pageIndex * (this.pageSize - 1) + this.pageSize,
          );
          this.initIpsListFilter(this.dataSource.data);
          this.isLoading = false;
          break;
        default:
          break;
      }
    });
  }

  initIpRangesFilter(data) {
    this.networkNames = uniqBy(map(data, 'network_name')).sort();
    this.networkTypes = uniqBy(map(data, 'network_type')).sort();
    this.networkGroups = uniqBy(map(data, 'network_group')).sort();
    this.filteredIpRangesResult.data = data;
  }

  initIpsListFilter(data) {
    this.threatClassifications = this.sortThreatProfileOptions(
      chain(data)
      .map(item => item.threat_classification)
      .uniqBy()
      .value()
    );

    this.blacklistClasses = chain(data)
      .map(item => item.blacklist_class)
      .uniqBy()
      .value()
      .sort();

    this.networkTypes = chain(data)
      .map(item => item.network_type)
      .flatten()
      .uniqBy()
      .filter(item => this.knownNetworkTypes.indexOf(item) > -1)
      .value()
      .sort();

    this.filteredIpsListResult.data = map(data, (item) => ({
      ...item,
      threat_profile: `${item.threat_potential_score_pct} (${item.threat_classification})`,
      network_type:
        !filter(item.network_type, (item) => this.knownNetworkTypes.indexOf(item) > -1)
          .join(', ').length
        ? 'No Entry'
        : filter(item.network_type, (item) => this.knownNetworkTypes.indexOf(item) > -1).join(', ')
    }));
  }

  filterValueChange(filterName, value) {
    if (this.currentRoute === 'network-name' || this.currentRoute === 'network-type' || this.currentRoute === 'network-group') {
      this.selectedIpRangesFilters = {
        ...this.selectedIpRangesFilters,
        [filterName]: value
      };

      this.filteredIpRangesResult.data = this.dataSource.data
        .filter(item => !this.selectedIpRangesFilters.networkName
          ? true
          : this.selectedIpRangesFilters.networkName === item.network_name)
        .filter(item => !this.selectedIpRangesFilters.networkType
          ? true
          : this.selectedIpRangesFilters.networkType === item.network_type)
        .filter(item => !this.selectedIpRangesFilters.networkGroup
          ? true
          : this.selectedIpRangesFilters.networkGroup === item.network_group)

      this.networkNames =
        chain(filterName === 'networkName' ? this.dataSource.data : this.filteredIpRangesResult.data)
        .map(item => item.network_name)
        .uniqBy()
        .value()
        .sort();
      this.networkTypes =
        chain(filterName === 'networkType' ? this.dataSource.data : this.filteredIpRangesResult.data)
        .map(item => item.network_type)
        .uniqBy()
        .value()
        .sort();
      this.networkGroups =
        chain(filterName === 'networkGroup' ? this.dataSource.data : this.filteredIpRangesResult.data)
        .map(item => item.network_group)
        .uniqBy()
        .value()
        .sort();

      this.selectedNetworkName = this.networkNames.length === 1 ? this.networkNames[0] : '';
      this.selectedNetworkType = this.networkTypes.length === 1 ? this.networkTypes[0] : '';
      this.selectedNetworkGroup = this.networkGroups.length === 1 ? this.networkGroups[0] : '';

      this.selectedIpRangesFilters = {
        networkName: this.networkNames.length === 1 ? this.selectedIpRangesFilters.networkName : '',
        networkType: this.networkTypes.length === 1 ? this.selectedIpRangesFilters.networkType : '',
        networkGroup: this.networkGroups.length === 1 ? this.selectedIpRangesFilters.networkGroup : '',
      };

    } else {
      this.selectedIpsListFilters = {
        ...this.selectedIpsListFilters,
        [filterName]: value
      };
      this.filteredIpsListResult.data = this.dataSource.data
        .filter(item => !this.selectedIpsListFilters.threatClassification
          ? true
          : item.threat_classification === this.selectedIpsListFilters.threatClassification)
        .map(item => ({
          ...item,
          threat_profile: `${item.threat_potential_score_pct} (${item.threat_classification})`,
        }))
        .filter(item => !this.selectedIpsListFilters.blacklistClass
          ? true
          : item.blacklist_class === this.selectedIpsListFilters.blacklistClass)
        .filter(item => !this.selectedIpsListFilters.networkType
          ? true
          : item.network_type.indexOf(this.selectedIpsListFilters.networkType) > -1)
        .map(item => ({
          ...item,
          network_type: !filter(item.network_type, (item) => this.knownNetworkTypes.indexOf(item) > -1).join(', ').length
              ? 'No Entry'
              : filter(item.network_type, (item) => this.knownNetworkTypes.indexOf(item) > -1).join(', ')
        }));

      this.threatClassifications =
        this.sortThreatProfileOptions(
          chain(filterName === 'threatClassification' ? this.dataSource.data : this.filteredIpsListResult.data)
          .map(item => item.threat_classification)
          .uniqBy()
          .value()
        )
      this.blacklistClasses =
        chain(filterName === 'blacklistClass' ? this.dataSource.data : this.filteredIpsListResult.data)
        .map(item => item.blacklist_class)
        .uniqBy()
        .value()
        .sort();
      this.networkTypes =
        chain(filterName === 'networkType' ? this.dataSource.data : this.filteredIpsListResult.data)
        .map(item => filterName === 'networkType' ? item.network_type : item.network_type.split(', '))
        .flatten()
        .uniqBy()
        .filter(item => this.knownNetworkTypes.indexOf(item) > -1)
        .value()
        .sort();

      this.selectedThreatClassification = this.threatClassifications.length === 1 ? this.threatClassifications[0] : '';
      this.selectedBlacklistClass = this.blacklistClasses.length === 1 ? this.blacklistClasses[0] : '';
      this.selectedNetworkType = this.networkTypes.length === 1 ? this.networkTypes[0] : '';

      this.selectedIpsListFilters = {
        threatClassification: this.threatClassifications.length === 1 ? this.selectedIpsListFilters.threatClassification : '',
        blacklistClass: this.blacklistClasses.length === 1 ? this.selectedIpsListFilters.blacklistClass : '',
        networkType: this.networkTypes.length === 1 ? this.selectedIpsListFilters.networkType : '',
      };
    }
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

  backButton(){
    this._location.back();
  }
}
