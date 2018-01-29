import { Injectable } from "@angular/core";

import { CustomHttpService } from "../../../core/custom-http.service";

import { APIMethod, AppSettings } from "../../../shared/app.constants";

import { stringFormat } from "@brycemarshall/string-format";

import { RejectInvitation, AcceptInvitation } from "./invitations.model";


@Injectable()
export class InvitationsService {
  constructor(private http: CustomHttpService) { }

  getInvitations(startIndex) {
    let url = stringFormat(APIMethod.GET_ALL_INVITATIONS, startIndex, 10);
    console.log("Start Index : " + startIndex);
    console.log("Url :" + url);
    return this.http.get(url);
  }

  rejectInvitation(invitation: RejectInvitation) {
    return this.http.post(APIMethod.REJECT_GROUP_INVITATION, invitation);
  }

  acceptInvitation(invitation: AcceptInvitation) {
    return this.http.post(APIMethod.ACCEPT_GROUP_INVITATION, invitation);
  }
}