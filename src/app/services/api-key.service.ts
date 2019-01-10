import { Injectable } from '@angular/core';
import { ApiKeyApi, ApiKey, LoopBackFilter } from '../../../sdk'

@Injectable({
    providedIn: 'root'
})
export class ApiKeyService {
    constructor(
        private apiKeyApi: ApiKeyApi
    ) { }

    getApiKeys(){
        return this.apiKeyApi.find()
            .toPromise();
    }

    createApiKey(apiKey) {
        return this.apiKeyApi.create<ApiKey>(apiKey)
            .toPromise();
    }

    updateApiKey(apiKey) {
        return this.apiKeyApi.updateAttributes<ApiKey>(apiKey.id, apiKey)
            .toPromise();
    }

    deleteApiKey(apiKey) {
        return this.apiKeyApi.deleteById<ApiKey>(apiKey.id)
            .toPromise();
    }
}