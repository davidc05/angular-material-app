/* tslint:disable */

declare var Object: any;
export interface NoteInterface {
  "text": string;
  "userEmail": string;
  "userName": string;
  "avatar": string;
  "ip"?: string;
  "createdOn": Date;
  "id"?: any;
}

export class Note implements NoteInterface {
  "text": string;
  "userEmail": string;
  "userName": string;
  "avatar": string;
  "ip": string;
  "createdOn": Date;
  "id": any;
  constructor(data?: NoteInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `Note`.
   */
  public static getModelName() {
    return "Note";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of Note for dynamic purposes.
  **/
  public static factory(data: NoteInterface): Note{
    return new Note(data);
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
      name: 'Note',
      plural: 'notes',
      path: 'notes',
      idName: 'id',
      properties: {
        "text": {
          name: 'text',
          type: 'string'
        },
        "userEmail": {
          name: 'userEmail',
          type: 'string'
        },
        "userName": {
          name: 'userName',
          type: 'string'
        },
        "avatar": {
          name: 'avatar',
          type: 'string'
        },
        "ip": {
          name: 'ip',
          type: 'string'
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
