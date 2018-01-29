import { Injectable } from "@angular/core";

import { CustomHttpService } from "../../../core/custom-http.service";

import { APIMethod, AppSettings } from "../../../shared/app.constants";

//import { ResetPasswordModel } from "./ResetPasswordModel";
import { LoginUser, RegisterPushNotification, GeofenceNotificationModel } from "./login.model"


@Injectable()
export class LoginService {
    constructor(private http: CustomHttpService) { }

    Login(loginUser: LoginUser) {
        return this.http.post(
            APIMethod.TOKEN,
            "grant_type=password&username=" + loginUser.UserName + "&password=" + loginUser.Password + "&client_id="+ AppSettings.CLIENT_ID
        );
    }

    RegisterPushNotification(token: RegisterPushNotification) {
        return this.http.post(
            APIMethod.REGISTER_PUSHNOTIFICATION,
            token
        );
    }


    GetUserProfile() {
        return this.http.get("api/v1/account/get-user-profile"
        );
    }

    GeofenceNotification(geofenceModel: GeofenceNotificationModel) {
        return this.http.post(
            APIMethod.GEOFENCE_NOTIFICATION,
            geofenceModel
        );
    }
}

