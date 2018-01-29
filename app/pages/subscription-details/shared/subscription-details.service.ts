import { Injectable } from "@angular/core";

import { CustomHttpService } from "../../../core/custom-http.service";

import { APIMethod, AppSettings } from "../../../shared/app.constants";

import { stringFormat } from "@brycemarshall/string-format";


@Injectable()
export class SubscriptionDetailsService {
  constructor(private http: CustomHttpService) { }

  get(groupId) {
    let url = stringFormat(APIMethod.GET_SUBSCRIPTION_DETAILS, groupId);
    return this.http.get(url);
  }

}