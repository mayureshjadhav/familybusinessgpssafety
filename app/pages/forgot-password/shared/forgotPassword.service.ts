import { Injectable } from "@angular/core";

import { CustomHttpService } from "../../../core/custom-http.service";

import { APIMethod } from "../../../shared/app.constants";

import { ForgotPasswordModel } from "./forgotPassword.model"


@Injectable()
export class ForgotPasswordService {
  constructor(private http: CustomHttpService) { }

  sendForgotPasswordEmail(forgotPasswordModel: ForgotPasswordModel) {    
    return this.http.post(APIMethod.SEND_FORGOT_PASSWORD_TOKEN,forgotPasswordModel);
  } 
}

