import { Injectable } from "@angular/core";

import { CustomHttpService } from "../../../core/custom-http.service";

import { APIMethod, AppSettings } from "../../../shared/app.constants";

import { ValidateRegistrationModel } from "./validateRegistration.model";


@Injectable()
export class ValidateRegistrationService {
  constructor(private http: CustomHttpService) {
  }

  ValidateRegistration(validateRegistrationModel: ValidateRegistrationModel) {

    return this.http.post(
      APIMethod.VERIFY_REGISTRATION_TOKEN,
      validateRegistrationModel
    );
  }

  ResendRegistrationToken(paramEmail) {
    return this.http.post(
      APIMethod.RESEND_REGISTRATION_TOKEN, { Email: paramEmail }
    );
  }

}

