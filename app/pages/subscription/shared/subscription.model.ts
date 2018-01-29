export class SubscriptionModel {
  SubscriptionId: string = "";
  PlayStoreIdForMonth: string = "";
  PlayStoreIdForYear: string = "";
  Name: string = "";
  SubscriptionType: number = 0;
  PricePerMonth: number = 0;
  PricePerYear: number = 0;
  IsMemberUnlimited: boolean = true;
  NumberOfMembers: number = 0;
  IsUnlimitedInterestPoints: boolean = true;
  NumberOfInterestPoint: number = 0;
  IsDriverProtectionEnabled: boolean = true;
  NotificationForInterestPoint: boolean = true;
  CanReceiveNotificationFromApp: boolean = true;
}

export class TransactionModel {
  SubscriptionId: string = "";
  IsPackageMonthly: boolean = true;
  TransactionNumber: string = "";
  TransactionDate: Date;
  PaidAmount: number = 0;
}

