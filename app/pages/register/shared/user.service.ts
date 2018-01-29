import { Injectable } from "@angular/core";

import { CustomHttpService } from "../../../core/custom-http.service";

import { APIMethod, AppSettings } from "../../../shared/app.constants";

import { User } from "./user.model";


@Injectable()
export class UserService {
  constructor(private http: CustomHttpService) { }

  register(user: User) {
    return this.http.post(APIMethod.REGISTER, user);
  }

}

