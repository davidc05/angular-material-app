import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IpDetailApi, IpRangeApi } from '../../../sdk';
import { MatTableDataSource } from '@angular/material';
import { IpRiskCircleProperties } from '../ip-risk-circle/ip-risk-circle.component';

@Injectable()
export class IpsService {
    constructor(
        private http: HttpClient,
        private ipDetailApi: IpDetailApi,
        private ipRangeApi: IpRangeApi
    ) { }

    getIpDetail(ip) {
        return this.ipDetailApi.getIpDetailFromMusubuAPI(ip)
            .toPromise();
    }

    getIpsDetail(ips) {
        return this.ipDetailApi.getIpsDetail(ips)
            .toPromise();
    }

    getIpRangeByNetwork(network, page, pageBy) {
        return this.ipRangeApi.getIpRangeByNetwork(network, page, pageBy)
            .toPromise();
    }

    getIpRangesByIspName(ispName, page, pageBy) {
        return this.ipRangeApi.getIpDetailRangesByIspName(ispName, page, pageBy)
            .toPromise();
    }

    getIpRangesByBlacklistNeighbors(blacklistNeighbors) {
        return this.ipRangeApi.getIpDetailRangesByBlacklistNeighbors(blacklistNeighbors)
            .toPromise();
    }

    clearServiceCache() {
        this.dataSource = new MatTableDataSource([]);
        this.highRiskCount = 0;
        this.mediumRiskCount = 0;
        this.lowRiskCount = 0;

        this.highRiskCircle = {
            count: 0
        };
        this.mediumRiskCircle = {
            count: 0
        };
        this.lowRiskCircle = {
            count: 0
        }
    }

    dataSource = new MatTableDataSource([]);
    highRiskCount: number = 0;
    mediumRiskCount: number = 0;
    lowRiskCount: number = 0;

    highRiskCircle: IpRiskCircleProperties = {
        count: 0
    };
    mediumRiskCircle: IpRiskCircleProperties = {
        count: 0
    };
    lowRiskCircle: IpRiskCircleProperties = {
        count: 0
    }
}
