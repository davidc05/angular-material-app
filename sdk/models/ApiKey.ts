/* tslint:disable */

declare var Object: any;
export interface ApiKeyInterface {
  "key": string;
  "userId": string;
  "expiresAt"?: Date;
  "totalCalls"?: number;
  "callLimit"?: number;
  "whitelistIps"?: Array<any>;
  "createdOn": Date;
  "id"?: any;
}

export class ApiKey implements ApiKeyInterface {
  "key": string;
  "userId": string;
  "expiresAt": Date;
  "totalCalls": number;
  "callLimit": number;
  "whitelistIps": Array<any>;
  "createdOn": Date;
  "id": any;
  constructor(data?: ApiKeyInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ApiKey`.
   */
  public static getModelName() {
    return "ApiKey";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ApiKey for dynamic purposes.
  **/
  public static factory(data: ApiKeyInterface): ApiKey{
    return new ApiKey(data);
  }
  /**
  * @method getModelDefinition
  * @author Julien Ledun
  * @license MIT
  * This method returns an object that represents some of the model
  * definitions.
  **/
  public static getModelDefinition() {
    return {
      name: 'ApiKey',
      plural: 'apiKeys',
      path: 'apiKeys',
      idName: 'id',
      properties: {
        "key": {
          name: 'key',
          type: 'string'
        },
        "userId": {
          name: 'userId',
          type: 'string'
        },
        "expiresAt": {
          name: 'expiresAt',
          type: 'Date'
        },
        "totalCalls": {
          name: 'totalCalls',
          type: 'number',
          default: 0
        },
        "callLimit": {
          name: 'callLimit',
          type: 'number'
        },
        "whitelistIps": {
          name: 'whitelistIps',
          type: 'Array&lt;any&gt;',
          default: <any>[]
        },
        "createdOn": {
          name: 'createdOn',
          type: 'Date',
          default: new Date(0)
        },
        "id": {
          name: 'id',
          type: 'any'
        },
      },
      relations: {
      }
    }
  }
}
