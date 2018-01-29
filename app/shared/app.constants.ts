export class AppSettings {
    //public static API_ENDPOINT = "http://trackerapi.subsistservices.com";
    public static API_ENDPOINT = "http://devtrackerapi.subsistservices.com";
    public static CLIENT_ID = "AuthApp";
    public static GRANT_TYPE_PASSWORD = "password";
    public static GRANT_TYPE_REFRESHPASSWORD = "refresh_token";
    public static PROJECT_NUMBER = "1104692385";
}

export class APIMethod {
    public static TOKEN = "/token";
    public static REGISTER = "/api/account/register";
    public static REGISTER_PUSHNOTIFICATION = "/api/account/register-push-notification";
    public static RESEND_REGISTRATION_TOKEN = "/api/account/resend-registration-token";
    public static VERIFY_REGISTRATION_TOKEN = "/api/account/verify-registration-token";    
    public static SEND_FORGOT_PASSWORD_TOKEN = "/api/account/send-forgotpassword-token";
    public static RESEND_FORGOT_PASSWORD_TOKEN = "/api/account/resend-forgotpassword-token";
    public static REST_PASSWORD = "/api/account/reset-password";    
    public static CHANGE_PASSWORD = "/api/account/changepassword";
    public static GET_PROFILE = "/api/account/Get-Profile";
    public static UPDATE_PROFILE = "/api/account/Update-Profile";
    public static UPLOAD_IMAGE = "/api/account/Upload-Profile-Image";

    public static GET_ALL_SUBSCRIPTION = "/api/subscription/GetAll";
    public static GET_ALL_SUBSCRIPTION_EXCEPT_FREE = "/api/subscription/GetAllExceptFree";
    public static ADD_TRANSACTION = "/api/Transaction/Add-Transaction";
    public static UPGRADE_GROUP = "/api/Transaction/Upgrade-Group";

    public static GET_ALL_GROUPS = "/api/group/Get-All-Groups";
    public static GET_GROUP_DETAILS = "/api/group/Get-By-Id?groupId={0}";
    public static UPDATE_GROUP = "/api/group/Update-Group";

    public static GET_SUBSCRIPTION_DETAILS = "/api/subscription/Get-By-GroupId?groupId={0}";

    public static GET_GROUP_MEMBERS = "/api/Group/Get-Group-Members?groupId={0}&startRow={1}&noOfRows={2}";
    public static UPDATE_GROUP_MEMBER_ARRIVAL = "/api/Group/Update-Group-Member-Interest-Arrival-Notify";
    public static UPDATE_GROUP_MEMBER_DEPARTURE = "/api/Group/Update-Group-Member-Interest-Departure-Notify";
    public static GET_MEMBERS_DETAILS = "/api/Group/Get-Members-Details?groupId={0}&userProfileId={1}";


    public static GET_ALL_INVITATIONS = "/api/Group/Get-All-Invitations?startRow={0}&noOfRows={1}";
    public static ACCEPT_GROUP_INVITATION = "/api/Group/Accept-Group-Invitation";
    public static REJECT_GROUP_INVITATION = "/api/Group/Reject-Group-Invitation";
    public static INVITE_GROUP_MEMBER = "/api/Group/Invite-Group-Member";

    public static GET_INTEREST_POINTS = "/api/Group/Get-Interest-Points?groupId={0}&startRow={1}&noOfRows={2}";
    public static ADD_INTEREST_POINT = "/api/Group/Add-Interest-Point";
    public static UPDATE_INTEREST_POINT = "/api/Group/Update-Interest-Point";
    public static DELETE_INTEREST_POINT = "/api/Group/Delete-Interest-Point";
    public static GET_INTEREST_POINT = "/api/Group/Get-Interest-Point?interestPointId={0}";
    //public static UPLOAD_INTEREST_POINT_IMAGE = "/api/Group/Upload-Interest-Point-Image";
    public static UPLOAD_INTEREST_POINT_IMAGE = "/api/Group/Upload-Interest-Point-Image-New";

    public static UPDATE_LOCATION = "/api/Location/Update-Location";

    public static GEOFENCE_NOTIFICATION = "/api/Group/Geofence-Notification";
    
    
}