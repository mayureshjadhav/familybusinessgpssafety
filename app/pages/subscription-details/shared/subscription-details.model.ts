export class SubscriptionModel {
    UserGroupId: string = "";   
    TransactionId: string = "";
    SubscriptionName: string = "";
    CreatedDate: string = "";
    ExpiredDate: string = "";
    SubscriptionType: number = 0;
    IsMemberUnlimited: boolean;
    NumberOfMembers: number = 0;
    IsUnlimitedInterestPoints: boolean;
    NumberOfInterestPoint: number = 0;
    IsDriverProtectionEnabled: boolean;
    NotificationForInterestPoint: boolean;
    CanReceiveNotificationFromApp: boolean;
}