
export class UpdateGroup {
    UserGroupId: string = "";
    GroupName: string = "";
    CanMemberSeeEachOther: boolean = true;
    TrackingFrom: string;
    TrackingTo: string;
    Monday: boolean = false;
    Tuesday: boolean = false;
    Wednesday: boolean = false;
    Thursday: boolean = false;
    Friday: boolean = false;
    Saturday: boolean = false;
    Sunday: boolean = false;
}


export class ViewGroup {
    UserGroupId: string = "";
    GroupName: string = "";
    TransactionId: string = "";
    SubscriptionName: string = "";
    IsAdmin: boolean;
    SubscriptionType: number = 0;
    CanMemberSeeEachOther: boolean;
    TrackingFrom: Date;
    TrackingTo: Date;
    TrackingFromHours: number;
    TrackingFromMinutes: number;
    TrackingToHours: number;
    TrackingToMinutes: number;
    Monday: boolean;
    Tuesday: boolean;
    Wednesday: boolean;
    Thursday: boolean;
    Friday: boolean;
    Saturday: boolean;
    Sunday: boolean;
}

