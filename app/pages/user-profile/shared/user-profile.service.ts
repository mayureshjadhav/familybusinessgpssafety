import { Injectable } from "@angular/core";

import { CustomHttpService } from "../../../core/custom-http.service";

import { APIMethod, AppSettings } from "../../../shared/app.constants";

import { UserProfile } from "./user-profile.model";


@Injectable()
export class UserProfileService {
  constructor(private http: CustomHttpService) { }

  get() {
    return this.http.get(APIMethod.GET_PROFILE);
  }

  update(user: UserProfile) {
    return this.http.post(APIMethod.UPDATE_PROFILE, user);
  }

}

