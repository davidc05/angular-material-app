import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { IpsService } from '../services/ips.service';

import { map, filter, uniqBy, flatten, chain } from 'lodash';

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
    pageSize = 100;
    pageSizeOptions: number[] = [25, 50, 100, 200];
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

    selectedNetworkName = 'All';
    selectedNetworkType = 'All';
    selectedNetworkGroup = 'All';

    selectedThreatClassification = 'All';
    selectedBlacklistClass = 'All';

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
        'No Entry'
    ];

    ngOnInit() {
        window.scrollTo(0, 0);

        this.route.data.subscribe(routeData => {
            this.currentRoute = routeData.ipRanges.currentRoute;
            this.queryParam = routeData.ipRanges.queryParam;
            if (this.currentRoute.includes('network')) {
                // ex: convert 'network-name' to 'Network Name'
                this.title = this.currentRoute.split('-').map(item => `${item.charAt(0).toUpperCase()}${item.slice(1)}`).join(' ');
                this.itemsLength = routeData.ipRanges.ipRanges.result_count;
                this.dataSource.data = routeData.ipRanges.ipRanges.entries;
            } else if (this.currentRoute === 'isp-name') {
                this.title = 'ISP Name';
                this.dataSource.data = routeData.ipRanges.ipsData;
                this.itemsLength = routeData.ipRanges.result_count;
            } else {
                this.title = 'Blacklist Network Neighbors';
                this.ipsListByBlacklistNeighbors = routeData.ipRanges.ipsData;
                this.dataSource.data = routeData.ipRanges.ipsData.slice(0, this.pageSize);
                this.itemsLength = routeData.ipRanges.result_count;
            }

            if (this.currentRoute.includes('network')) {
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

        this.selectedNetworkType = 'All';
        this.selectedNetworkName = 'All';
        this.selectedNetworkGroup = 'All';
        this.selectedThreatClassification = 'All';
        this.selectedBlacklistClass = 'All';

        this.pageSize = e.pageSize;

        return new Promise((resolve, reject) => {
            switch (this.currentRoute) {
                case 'network-name':
                case 'network-type':
                case 'network-group':
                    this.ipsService.getIpRangeByNetwork(
                        // ex: convert 'network-name' to 'networkName'
                        {
                            [this.currentRoute.split('-').map((item, idx) => idx === 0 ? item : `${item.charAt(0).toUpperCase()}${item.slice(1)}`)
                                .join('')]: this.queryParam
                        },
                        (e.pageIndex + 1).toString(),
                        this.pageSize
                    )
                        .then(data => {
                            this.dataSource.data = data.ipRanges.entries;
                            this.initIpRangesFilter(this.dataSource.data);
                            this.isLoading = false;
                        }, err => resolve(null));
                    break;
                case 'isp-name':
                    this.ipsService.getIpRangesByIspName(this.queryParam, (e.pageIndex + 1).toString(), this.pageSize)
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
        this.networkNames = uniqBy(map(data, 'network_name')).sort(this.sortCaseInsensitive);
        this.networkTypes = uniqBy(map(data, 'network_type')).sort(this.sortCaseInsensitive);
        this.networkGroups = uniqBy(map(data, 'network_group')).sort(this.sortCaseInsensitive);
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
            .sort(this.sortCaseInsensitive);

        this.networkTypes = chain(data)
            .map(item => item.network_type)
            .flatten()
            .uniqBy()
            .filter(item => this.knownNetworkTypes.indexOf(item) > -1)
            .value()
            .sort(this.sortCaseInsensitive);

        this.filteredIpsListResult.data = data
            .map(item => !item.network_type.length ? { ...item, network_type: ['No Entry'] } : item)
            .map(item => ({
                ...item,
                threat_profile: `${item.threat_potential_score_pct} (${item.threat_classification})`,
                network_type: filter(item.network_type, (item) => this.knownNetworkTypes.indexOf(item) > -1).join(', ')
            }));

        if (data.length === 1) {
            this.selectedThreatClassification = this.threatClassifications[0];
            this.selectedBlacklistClass = this.blacklistClasses[0];
            this.selectedNetworkType = this.networkTypes[0];
        }
    }

    filterValueChange(filterName, value) {
        this.selectedThreatClassification = filterName === 'threatClassification' ? value : this.selectedThreatClassification;
        this.selectedBlacklistClass = filterName === 'blacklistClass' ? value : this.selectedBlacklistClass;
        this.selectedNetworkType = filterName === 'networkType' ? value : this.selectedNetworkType;
        this.selectedNetworkName = filterName === 'networkName' ? value : this.selectedNetworkName;
        this.selectedNetworkGroup = filterName === 'networkGroup' ? value : this.selectedNetworkGroup;

        if (this.currentRoute === 'network-name' || this.currentRoute === 'network-type' || this.currentRoute === 'network-group') {
            this.filteredIpRangesResult.data = this.dataSource.data
                .filter(item => this.selectedNetworkName === 'All'
                    ? true
                    : this.selectedNetworkName === item.network_name)
                .filter(item => this.selectedNetworkType === 'All'
                    ? true
                    : this.selectedNetworkType === item.network_type)
                .filter(item => this.selectedNetworkGroup === 'All'
                    ? true
                    : this.selectedNetworkGroup === item.network_group)

            this.networkNames =
                chain(filterName === 'networkName' ? this.dataSource.data : this.filteredIpRangesResult.data)
                    .map(item => item.network_name)
                    .uniqBy()
                    .value()
                    .sort(this.sortCaseInsensitive);
            this.networkTypes =
                chain(filterName === 'networkType' ? this.dataSource.data : this.filteredIpRangesResult.data)
                    .map(item => item.network_type)
                    .uniqBy()
                    .value()
                    .sort(this.sortCaseInsensitive);
            this.networkGroups =
                chain(filterName === 'networkGroup' ? this.dataSource.data : this.filteredIpRangesResult.data)
                    .map(item => item.network_group)
                    .uniqBy()
                    .value()
                    .sort(this.sortCaseInsensitive);

            this.selectedNetworkName = filterName === 'networkName'
                ? value
                : this.networkNames.length > 1 ? 'All' : this.selectedNetworkName;
            this.selectedNetworkType = filterName === 'networkType'
                ? value
                : this.networkTypes.length > 1 ? 'All' : this.selectedNetworkType;
            this.selectedNetworkGroup = filterName === 'networkGroup'
                ? value
                : this.networkGroups.length > 1 ? 'All' : this.selectedNetworkGroup;

            if (!this.networkTypes.length) {
                this.networkTypes.push(this.selectedNetworkType);
            }
            if (!this.networkNames.length) {
                this.networkNames.push(this.selectedNetworkName);
            }
            if (!this.networkGroups.length) {
                this.networkGroups.push(this.selectedNetworkGroup);
            }
        } else {
            this.filteredIpsListResult.data = this.dataSource.data
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
    }

    resetFilters() {
        this.selectedThreatClassification = 'All';
        this.selectedBlacklistClass = 'All';
        this.selectedNetworkType = 'All';
        this.selectedNetworkName = 'All';
        this.selectedNetworkGroup = 'All';

        if (this.currentRoute.includes('network')) {
            this.filteredIpRangesResult.data = this.dataSource.data;
            this.networkNames =
                chain(this.filteredIpRangesResult.data)
                    .map(item => item.network_name)
                    .uniqBy()
                    .value()
                    .sort(this.sortCaseInsensitive);
            this.networkTypes =
                chain(this.filteredIpRangesResult.data)
                    .map(item => item.network_type)
                    .uniqBy()
                    .value()
                    .sort(this.sortCaseInsensitive);
            this.networkGroups =
                chain(this.filteredIpRangesResult.data)
                    .map(item => item.network_group)
                    .uniqBy()
                    .value()
                    .sort(this.sortCaseInsensitive);
        } else {
            this.filteredIpsListResult.data = this.dataSource.data;
            this.threatClassifications =
                this.sortThreatProfileOptions(
                    chain(this.dataSource.data)
                        .map(item => item.threat_classification)
                        .uniqBy()
                        .value()
                );
            this.blacklistClasses =
                chain(this.dataSource.data)
                    .map(item => item.blacklist_class)
                    .uniqBy()
                    .value()
                    .sort();
            this.networkTypes =
                chain(this.dataSource.data)
                    .map(item => item.network_type)
                    .flatten()
                    .uniqBy()
                    .filter(item => this.knownNetworkTypes.indexOf(item) > -1)
                    .value()
                    .sort();
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

    sortCaseInsensitive(a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    }

    backButton() {
        this._location.back();
    }
}
