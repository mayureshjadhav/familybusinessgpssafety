import { NgModule } from "@angular/core";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { Routes } from "@angular/router";

const routes: Routes = [
    // { path: '', loadChildren: "./pages/login/login.module#LoginModule" },
    // { path: "", redirectTo: "/items", pathMatch: "full" },
    // { path: "items", component: ItemsComponent },
    // { path: "item/:id", component: ItemDetailComponent },
    { path: "", redirectTo: "/home", pathMatch: "full" },
    { path: 'home', loadChildren: "./pages/home/home.module#HomeModule" },
    { path: 'login', loadChildren: "./pages/login/login.module#LoginModule" },
    { path: 'register', loadChildren: "./pages/register/register.module#RegisterModule" },
    { path: 'forgotPassword', loadChildren: "./pages/forgot-password/forgotPassword.module#ForgotPasswordModule" },
    { path: 'resetPassword/:UserName', loadChildren: "./pages/forgot-reset-password/resetPassword.module#ResetPasswordModule" },
    { path: 'validateRegistration/:Email', loadChildren: "./pages/verify-code/validateRegistration.module#ValidateRegistrationModule" },
    { path: 'changePassword/:ClinicId', loadChildren: "./pages/change-password/changePassword.module#ChangePasswordModule" },

    { path: 'user-profile', loadChildren: "./pages/user-profile/user-profile.module#UserProfileModule" },
    { path: 'subscription', loadChildren: "./pages/subscription/subscription.module#SubscriptionModule" },
    { path: 'group/:groupId', loadChildren: "./pages/group/group.module#GroupModule" },
    { path: 'update-group/:groupId', loadChildren: "./pages/update-group/update-group.module#UpdateGroupModule" },    
    //{ path: 'group-members/:groupId', loadChildren: "./pages/group-members/group-members.module#GroupMembersModule" },
    { path: 'group-members/:groupId', loadChildren: "./pages/group-members/group-members.module#GroupMembersModule" },
    { path: 'view-member/:groupId/:userProfileId', loadChildren: "./pages/view-member/view-member.module#ViewMemberModule" },
    { path: 'invite-member/:groupId', loadChildren: "./pages/invite-group-member/invite-group-member.module#InviteGroupMemberModule" },
    { path: 'invitations', loadChildren: "./pages/invitations/invitations.module#InvitationsModule" },
    // { path: '', loadChildren: "./pages/user-profile/user-profile.module#UserProfileModule" },
    { path: 'subscription-details/:groupId', loadChildren: "./pages/subscription-details/subscription-details.module#SubscriptionDetailsModule" },
    { path: 'upgrade-subscription/:groupId', loadChildren: "./pages/upgrade-subscription/upgrade-subscription.module#UpgradeSubscriptionModule" },
    
    { path: 'interest-points/:groupId', loadChildren: "./pages/interest-points/interest-points.module#InterestPointsModule" },
    { path: 'add-interest-point/:groupId', loadChildren: "./pages/add-interest-point/add-interest-point.module#AddInterestPointModule" },
    { path: 'update-interest-point/:interestPointId', loadChildren: "./pages/update-interest-point/update-interest-point.module#UpdateInterestPointModule" },
    { path: 'view-interest-point/:interestPointId', loadChildren: "./pages/view-interest-point/view-interest-point.module#ViewInterestPointModule" },
    //{ path: '', loadChildren: "./pages/add-interest-point/add-interest-point.module#AddInterestPointModule" },
   

    { path: 'no-internet', loadChildren: "./pages/no-internet/no-internet.module#NoInternetModule" },
    { path: 'error', loadChildren: "./pages/error/error.module#ErrorModule" }
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }