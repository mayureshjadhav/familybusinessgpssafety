import { Injectable } from "@angular/core";

import { CustomHttpService } from "../../../core/custom-http.service";

import { APIMethod } from "../../../shared/app.constants";

import { ChangePasswordModel } from "./changePassword.model"


@Injectable()
export class ChangePasswordService {
    constructor(private http: CustomHttpService) { }

    changePassword(changePasswordModel: ChangePasswordModel) {        
        return this.http.post(APIMethod.CHANGE_PASSWORD,changePasswordModel);
    }
}

