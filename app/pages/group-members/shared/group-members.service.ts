import { Injectable } from "@angular/core";

import { CustomHttpService } from "../../../core/custom-http.service";

import { APIMethod, AppSettings } from "../../../shared/app.constants";

import { stringFormat } from "@brycemarshall/string-format";

import { InterestArrival, InterestDeparture } from "./group-members.model";


@Injectable()
export class GroupMembersService {
  constructor(private http: CustomHttpService) { }

  getGroupMembers(groupId, startIndex) {
    let url = stringFormat(APIMethod.GET_GROUP_MEMBERS, groupId, startIndex, 10);
    return this.http.get(url);
  }

  updateArrivalNotify(arrival: InterestArrival) {
    return this.http.post(APIMethod.UPDATE_GROUP_MEMBER_ARRIVAL, arrival);
  }

  updateDepartureNotify(departure: InterestDeparture) {
    return this.http.post(APIMethod.UPDATE_GROUP_MEMBER_DEPARTURE, departure);
  }

}