import { Injectable } from "@angular/core";

import { CustomHttpService } from "../../../core/custom-http.service";

import { APIMethod } from "../../../shared/app.constants";

//import { ResetPasswordModel } from "./ResetPasswordModel";
import { ResetPasswordModel, ForgotPasswordModel } from "./resetPassword.model"


@Injectable()
export class ResetPasswordService {
  constructor(private http: CustomHttpService) { }

  resetPassword(resetPasswordModel: ResetPasswordModel) {   
    return this.http.post(APIMethod.REST_PASSWORD, resetPasswordModel);
  }

  resendForgotPasswordToken(forgotPasswordModel: ForgotPasswordModel) {   
    return this.http.post(APIMethod.RESEND_FORGOT_PASSWORD_TOKEN, forgotPasswordModel);
  }

}

