
export class UpdateInterestPoint {
    InterestPointId: string = "";
    InterestPointName: string = "";
    InterestPointDescription: string = "";
    LatitudeNLongitude: string = "";
    Radius: number = 5;
}


export class ViewInterestPointModel {
    InterestPointId: string = "";   
    GroupMemberId: string = "";
    InterestPointName: string = "";
    InterestPointDescription: string = "";
    Latitude: string = "";
    Longitude: string = "";
    CreatedDate: Date;
    UpdatedDate: Date;
    IsDelete: boolean;
    ImagePath: string = "";
    CanEdit: boolean;
    Radius: number = 5;
}