/* tslint:disable */
import { Injectable } from '@angular/core';
import { IpDetail } from '../../models/IpDetail';
import { User } from '../../models/User';
import { SavedSearch } from '../../models/SavedSearch';
import { Tag } from '../../models/Tag';
import { Note } from '../../models/Note';
import { IpRange } from '../../models/IpRange';
import { SubscriptionPlan } from '../../models/SubscriptionPlan';
import { MusubuAPI } from '../../models/MusubuAPI';
import { ApiKey } from '../../models/ApiKey';

export interface Models { [name: string]: any }

@Injectable()
export class SDKModels {

  private models: Models = {
    IpDetail: IpDetail,
    User: User,
    SavedSearch: SavedSearch,
    Tag: Tag,
    Note: Note,
    IpRange: IpRange,
    SubscriptionPlan: SubscriptionPlan,
    MusubuAPI: MusubuAPI,
    ApiKey: ApiKey,
    
  };

  public get(modelName: string): any {
    return this.models[modelName];
  }

  public getAll(): Models {
    return this.models;
  }

  public getModelNames(): string[] {
    return Object.keys(this.models);
  }
}
