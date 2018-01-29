
export class ViewInterestPointModel {
    InterestPointId: string = "";   
    GroupMemberId: string = "";
    UserGroupId: string = "";
    InterestPointName: string = "";
    InterestPointDescription: string = "";
    Latitude: string = "";
    Longitude: string = "";
    CreatedDate: Date;
    UpdatedDate: Date;
    IsDelete: boolean;
    ImagePath: string = "";
    CanEdit: boolean;
}

export class DeleteInterestPointModel {
    InterestPointId: string = "";
}