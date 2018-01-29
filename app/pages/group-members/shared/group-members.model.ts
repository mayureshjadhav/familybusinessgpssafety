export class GroupMembers
{
    UserGroupMemberId: string = "";
    GroupMemeberId: string = "";
    UserGroupId: string = "";
    UserProfileId: string = "";
    Name: string = "";
    ProfileImage: string = "";
    IsAdmin: boolean;
    UserId : string = "";
    NotifyOnArrive: boolean ;
    NotifyOnLeave: boolean;
}

export class Members
{
    Items: GroupMembers[] ;
    TotalRecords: number;
    IsAdmin: boolean;
}


export class InterestArrival
{
    UserGroupId: string;
    OtherMemberId: string;
    NotifyOnArrive: boolean;
}

export class InterestDeparture
{
    UserGroupId: string;
    OtherMemberId: string;
    NotifyOnLeave: boolean;
}
