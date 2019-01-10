/* tslint:disable */
import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { SDKModels } from './SDKModels';
import { BaseLoopBackApi } from '../core/base.service';
import { LoopBackConfig } from '../../lb.config';
import { LoopBackAuth } from '../core/auth.service';
import { LoopBackFilter,  } from '../../models/BaseModels';
import { ErrorHandler } from '../core/error.service';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { MusubuAPI } from '../../models/MusubuAPI';
import { SocketConnection } from '../../sockets/socket.connections';


/**
 * Api services for the `MusubuAPI` model.
 */
@Injectable()
export class MusubuAPIApi extends BaseLoopBackApi {

  constructor(
    @Inject(HttpClient) protected http: HttpClient,
    @Inject(SocketConnection) protected connection: SocketConnection,
    @Inject(SDKModels) protected models: SDKModels,
    @Inject(LoopBackAuth) protected auth: LoopBackAuth,
    @Optional() @Inject(ErrorHandler) protected errorHandler: ErrorHandler
  ) {
    super(http,  connection,  models, auth, errorHandler);
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
   * This usually means the response is a `MusubuAPI` object.)
   * </em>
   */
  public patchOrCreate(data: any = {}, customHeaders?: Function): Observable<any> {
    let _method: string = "PATCH";
    let _url: string = LoopBackConfig.getPath() + "/" + LoopBackConfig.getApiVersion() +
    "/MusubuAPI";
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
   * @param {any} id MusubuAPI id
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
   * This usually means the response is a `MusubuAPI` object.)
   * </em>
   */
  public patchAttributes(id: any, data: any = {}, customHeaders?: Function): Observable<any> {
    let _method: string = "PATCH";
    let _url: string = LoopBackConfig.getPath() + "/" + LoopBackConfig.getApiVersion() +
    "/MusubuAPI/:id";
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
   * @param {string} IP 
   *
   * @param {string} format 
   *
   * @param {string} level 
   *
   * @param {string} key 
   *
   * @param {string} listneighbors 
   *
   * @param {string} ISP 
   *
   * @param {string} NetworkName 
   *
   * @param {string} NetworkType 
   *
   * @param {string} NetworkGroup 
   *
   * @param {string} Page 
   *
   * @param {string} PageBy 
   *
   * @param {string} ipNotation 
   *
   * @returns {object} An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `MusubuAPI` object.)
   * </em>
   */
  public Musubu(IP: any = {}, format: any = {}, level: any = {}, key: any = {}, listneighbors: any = {}, ISP: any = {}, NetworkName: any = {}, NetworkType: any = {}, NetworkGroup: any = {}, Page: any = {}, PageBy: any = {}, ipNotation: any = {}, customHeaders?: Function): Observable<any> {
    let _method: string = "GET";
    let _url: string = LoopBackConfig.getPath() + "/" + LoopBackConfig.getApiVersion() +
    "/MusubuAPI/Musubu";
    let _routeParams: any = {};
    let _postBody: any = {};
    let _urlParams: any = {};
    if (typeof IP !== 'undefined' && IP !== null) _urlParams.IP = IP;
    if (typeof format !== 'undefined' && format !== null) _urlParams.format = format;
    if (typeof level !== 'undefined' && level !== null) _urlParams.level = level;
    if (typeof key !== 'undefined' && key !== null) _urlParams.key = key;
    if (typeof listneighbors !== 'undefined' && listneighbors !== null) _urlParams.listneighbors = listneighbors;
    if (typeof ISP !== 'undefined' && ISP !== null) _urlParams.ISP = ISP;
    if (typeof NetworkName !== 'undefined' && NetworkName !== null) _urlParams.NetworkName = NetworkName;
    if (typeof NetworkType !== 'undefined' && NetworkType !== null) _urlParams.NetworkType = NetworkType;
    if (typeof NetworkGroup !== 'undefined' && NetworkGroup !== null) _urlParams.NetworkGroup = NetworkGroup;
    if (typeof Page !== 'undefined' && Page !== null) _urlParams.Page = Page;
    if (typeof PageBy !== 'undefined' && PageBy !== null) _urlParams.PageBy = PageBy;
    if (typeof ipNotation !== 'undefined' && ipNotation !== null) _urlParams.ipNotation = ipNotation;
    let result = this.request(_method, _url, _routeParams, _urlParams, _postBody, null, customHeaders);
    return result;
  }

  /**
   * The name of the model represented by this $resource,
   * i.e. `MusubuAPI`.
   */
  public getModelName() {
    return "MusubuAPI";
  }
}
