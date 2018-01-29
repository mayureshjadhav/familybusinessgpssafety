import { Injectable } from "@angular/core";

import { CustomHttpService } from "../../../core/custom-http.service";

import { APIMethod, AppSettings } from "../../../shared/app.constants";

import { UpdateGroup } from "./update-group.model";

import { stringFormat } from "@brycemarshall/string-format";


@Injectable()
export class UpdateGroupService {
  constructor(private http: CustomHttpService) { }

  get(groupId) {
    let url = stringFormat(APIMethod.GET_GROUP_DETAILS, groupId);
    return this.http.get(url);
  }

  update(group: UpdateGroup) {
    return this.http.post(APIMethod.UPDATE_GROUP, group);
  }

}

