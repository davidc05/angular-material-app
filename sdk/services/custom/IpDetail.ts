/* tslint:disable */
import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SDKModels } from './SDKModels';
import { BaseLoopBackApi } from '../core/base.service';
import { LoopBackConfig } from '../../lb.config';
import { LoopBackAuth } from '../core/auth.service';
import { ErrorHandler } from '../core/error.service';
import { Observable } from 'rxjs';
import { SocketConnection } from '../../sockets/socket.connections';


/**
 * Api services for the `IpDetail` model.
 */
@Injectable()
export class IpDetailApi extends BaseLoopBackApi {

    constructor(
        @Inject(HttpClient) protected http: HttpClient,
        @Inject(SocketConnection) protected connection: SocketConnection,
        @Inject(SDKModels) protected models: SDKModels,
        @Inject(LoopBackAuth) protected auth: LoopBackAuth,
        @Optional() @Inject(ErrorHandler) protected errorHandler: ErrorHandler
    ) {
        super(http, connection, models, auth, errorHandler);
    }

    /**
     * Patch an existing model instance or insert a new one into the data source.
     *
     * @param {object} data Request data.
     *
     *  - `data` – `{object}` - Model instance data
     *
     * @returns {object} An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `IpDetail` object.)
     * </em>
     */
    public patchOrCreate(data: any = {}, customHeaders?: Function): Observable<any> {
        let _method: string = "PATCH";
        let _url: string = LoopBackConfig.getPath() + "/" + LoopBackConfig.getApiVersion() +
            "/ipDetails";
        let _routeParams: any = {};
        let _postBody: any = {
            data: data
        };
        let _urlParams: any = {};
        let result = this.request(_method, _url, _routeParams, _urlParams, _postBody, null, customHeaders);
        return result;
    }

    /**
     * Patch attributes for a model instance and persist it into the data source.
     *
     * @param {any} id ipDetail id
     *
     * @param {object} data Request data.
     *
     *  - `data` – `{object}` - An object of model property name/value pairs
     *
     * @returns {object} An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `IpDetail` object.)
     * </em>
     */
    public patchAttributes(id: any, data: any = {}, customHeaders?: Function): Observable<any> {
        let _method: string = "PATCH";
        let _url: string = LoopBackConfig.getPath() + "/" + LoopBackConfig.getApiVersion() +
            "/ipDetails/:id";
        let _routeParams: any = {
            id: id
        };
        let _postBody: any = {
            data: data
        };
        let _urlParams: any = {};
        let result = this.request(_method, _url, _routeParams, _urlParams, _postBody, null, customHeaders);
        return result;
    }

    /**
     * <em>
           * (The remote method definition does not provide any description.)
           * </em>
     *
     * @param {string} ip 
     *
     * @returns {object} An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `ipDetail` – `{string}` - 
     */
    public getIpDetailFromMusubuAPI(ip: any = {}, customHeaders?: Function): Observable<any> {
        let _method: string = "GET";
        let _url: string = LoopBackConfig.getPath() + "/" + LoopBackConfig.getApiVersion() +
            "/ipDetails/ipDetailsMusubu";
        let _routeParams: any = {};
        let _postBody: any = {};
        let _urlParams: any = {};
        if (typeof ip !== 'undefined' && ip !== null) _urlParams.ip = ip;
        let result = this.request(_method, _url, _routeParams, _urlParams, _postBody, null, customHeaders);
        return result;
    }

    /**
     * <em>
           * (The remote method definition does not provide any description.)
           * </em>
     *
     * @param {object} data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns {object} An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `ipsDetail` – `{any}` - 
     */
    public getIpsDetail(ips: any = {}, customHeaders?: Function): Observable<any> {
        let _method: string = "POST";
        let _url: string = LoopBackConfig.getPath() + "/" + LoopBackConfig.getApiVersion() +
            "/ipDetails/getIpsDetail";
        let _routeParams: any = {};
        let _postBody: any = {
            ips: ips
        };
        let _urlParams: any = {};
        let result = this.request(_method, _url, _routeParams, _urlParams, _postBody, null, customHeaders);
        return result;
    }

    /**
     * The name of the model represented by this $resource,
     * i.e. `IpDetail`.
     */
    public getModelName() {
        return "IpDetail";
    }
}
