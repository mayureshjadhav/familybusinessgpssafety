import { Injectable } from "@angular/core";

import { CustomHttpService } from "../../../core/custom-http.service";

import { APIMethod, AppSettings } from "../../../shared/app.constants";

import { stringFormat } from "@brycemarshall/string-format";


@Injectable()
export class ViewMemberService {
  constructor(private http: CustomHttpService) { }

  get(groupId,userProfileId) {
    let url = stringFormat(APIMethod.GET_MEMBERS_DETAILS, groupId, userProfileId);
    return this.http.get(url);
  }
}