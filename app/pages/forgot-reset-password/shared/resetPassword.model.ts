export class ResetPasswordModel {
  Password: string = "";
  Email: string = "";
  ConfirmPassword: string = "";
  Token: string = "";
}

export class ForgotPasswordModel {
  Email: string = "";
}