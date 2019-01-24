/* tslint:disable */

declare var Object: any;
export interface TrendsInterface {
  "email": string;
  "id"?: any;
}

export class Trends implements TrendsInterface {
  "email": string;
  "id": any;
  constructor(data?: TrendsInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `Trends`.
   */
  public static getModelName() {
    return "Trends";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of Trends for dynamic purposes.
  **/
  public static factory(data: TrendsInterface): Trends{
    return new Trends(data);
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
      name: 'Trends',
      plural: 'trends',
      path: 'trends',
      idName: 'id',
      properties: {
        "email": {
          name: 'email',
          type: 'string'
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
