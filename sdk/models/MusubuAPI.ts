/* tslint:disable */

declare var Object: any;
export interface MusubuAPIInterface {
  "id"?: any;
}

export class MusubuAPI implements MusubuAPIInterface {
  "id": any;
  constructor(data?: MusubuAPIInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `MusubuAPI`.
   */
  public static getModelName() {
    return "MusubuAPI";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of MusubuAPI for dynamic purposes.
  **/
  public static factory(data: MusubuAPIInterface): MusubuAPI{
    return new MusubuAPI(data);
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
      name: 'MusubuAPI',
      plural: 'MusubuAPI',
      path: 'MusubuAPI',
      idName: 'id',
      properties: {
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
