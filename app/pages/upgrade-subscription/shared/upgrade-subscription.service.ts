import { Injectable } from "@angular/core";

import { CustomHttpService } from "../../../core/custom-http.service";

import { APIMethod } from "../../../shared/app.constants";

//import { ResetPasswordModel } from "./ResetPasswordModel";
//import { SubscriptionModel } from "./subscription.model"


@Injectable()
export class UpgradeSubscriptionService {
  constructor(private http: CustomHttpService) { }

  getAll() {   
    return this.http.get(APIMethod.GET_ALL_SUBSCRIPTION_EXCEPT_FREE);
  }

  addTransaction(transaction) {   
    return this.http.post(APIMethod.UPGRADE_GROUP,transaction);
  }
}

