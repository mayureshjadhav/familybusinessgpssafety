export class InvitationModel
{
    Items: Invitation[] ;
    TotalRecords: number;
}

export class Invitation
{
    InviteId: string;
    UserGroupId: string;
    GroupName: string;
}

export class RejectInvitation
{
    InviteId: string;
}

export class AcceptInvitation
{
    InviteId: string;
    Token: string;
}