export class InterestPoint
{
    InterestPointId: string = "";
    GroupMemeberId: string = "";
    InterestPointName: string = "";
    InterestPointDescription: string = "";
    CreatedDate: string = "";
    UserProfileId: string = "";
    UserId: string = "";
    Name : string = "";
    ImagePath: string = "";
}

export class InterestPoints
{
    Items: InterestPoint[] ;
    TotalRecords: number;
    IsAdmin: boolean;
}