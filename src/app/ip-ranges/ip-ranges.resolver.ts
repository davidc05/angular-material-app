import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from "@angular/router";
import { IpsService } from '../services/ips.service';
import { UserService } from '../services/user.service';

@Injectable()
export class IpRangesResolver implements Resolve<any> {
    constructor(
        private ipsService: IpsService,
        private userService: UserService
    ) { }

    resolve(route: ActivatedRouteSnapshot) {
        var currentRoute = route.url[0].path;

        if (currentRoute.includes('network')) {
            var currentRouteTemp = currentRoute.split('-');
            var currentRouteString = `${currentRouteTemp[0]}${currentRouteTemp[1].charAt(0).toUpperCase()}${currentRouteTemp[1].slice(1)}`;
            let queryParam = decodeURI(route.paramMap.get('network'));
            let parser = new DOMParser();
            let encodedNetwork = parser.parseFromString(queryParam, "text/html").documentElement.textContent;
            let requestParam = {
                [currentRouteString]: encodedNetwork
            }
            return new Promise((resolve, reject) => {
                let ipDetail = this.ipsService.getIpRangeByNetwork(requestParam, 1)
                    .then(
                        data => {
                            if (this.userService.user.subscriptionPlan === 'large') {
                                return resolve({
                                    ...data,
                                    currentRoute,
                                    queryParam: queryParam
                                });
                            }
                            else {
                                return resolve(null);
                            }
                        },
                        err => {
                            console.log(err)
                            return resolve(null)
                        }
                    )
            });
        }

        if (currentRoute === 'isp-name') {
            let queryParam = decodeURI(route.paramMap.get('ispName'));
            let parser = new DOMParser();
            let encodedIspName = parser.parseFromString(queryParam, "text/html").documentElement.textContent;
            return new Promise((resolve, reject) => {
                let ipDetail = this.ipsService.getIpRangesByIspName(encodedIspName, 1)
                    .then(
                        data => {
                            if (this.userService.user.subscriptionPlan !== 'free') {
                                return resolve({
                                    ipsData: !data.ipRanges.entries ? [] : data.ipRanges,
                                    result_count: data.ipRanges.result_count,
                                    currentRoute: 'isp-name',
                                    queryParam
                                })
                            }
                            else {
                                return resolve(null);
                            }
                        },
                        err => {
                            console.log(err)
                            return resolve(null)
                        }
                    )
            });
        }

        if (currentRoute === 'blacklist-neighbors') {
            let queryParam = route.paramMap.get('blacklistNeighbors');
            let parser = new DOMParser();
            let encodedBlacklistNeighbors = parser.parseFromString(queryParam, "text/html").documentElement.textContent;
            return new Promise((resolve, reject) => {
                let ipDetail = this.ipsService.getIpRangesByBlacklistNeighbors(encodedBlacklistNeighbors)
                    .then(
                        data => {
                            if (this.userService.user.subscriptionPlan !== 'free') {
                                let ipsData = this.ipsService.getIpsDetail(data.ipRanges.blacklist_network_neighbors)
                                    .then(response => {
                                        return resolve({
                                            ipsData: response.ipsDetail,
                                            result_count: data.ipRanges.blacklist_network_neighbor_cnt,
                                            currentRoute: 'blacklist-neighbors',
                                            queryParam
                                        })
                                    });
                            }
                            else {
                                return resolve(null);
                            }
                        },
                        err => {
                            console.log(err)
                            return resolve(null)
                        }
                    )
            });
        }
    }
}
