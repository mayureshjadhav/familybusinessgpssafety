import { Injectable } from "@angular/core";

import { CustomHttpService } from "../../../core/custom-http.service";

import { APIMethod } from "../../../shared/app.constants";

//import { ResetPasswordModel } from "./ResetPasswordModel";
//import { SubscriptionModel } from "./subscription.model"


@Injectable()
export class SubscriptionService {
  constructor(private http: CustomHttpService) { }

  getAll() {   
    return this.http.get(APIMethod.GET_ALL_SUBSCRIPTION);
  }

  addTransaction(transaction) {   
    return this.http.post(APIMethod.ADD_TRANSACTION,transaction);
  }
}

