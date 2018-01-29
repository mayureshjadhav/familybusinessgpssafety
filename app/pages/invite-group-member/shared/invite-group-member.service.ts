import { Injectable } from "@angular/core";

import { CustomHttpService } from "../../../core/custom-http.service";

import { APIMethod, AppSettings } from "../../../shared/app.constants";

import { InviteMember } from "./invite-group-member.model";


@Injectable()
export class InviteGroupMemberService {
  constructor(private http: CustomHttpService) { }

  sendInvite(inviteMember: InviteMember) {
    return this.http.post(APIMethod.INVITE_GROUP_MEMBER, inviteMember);
  }

}

