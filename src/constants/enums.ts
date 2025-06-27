export enum UserVerifyStatus {
  Verified, // đã xác thực email
  Banned // bị khóa
}
export enum USER_ROLE {
  Admin, //0
  Consultant, //1
  Manager, //2
  User, //3
  Staff //4
}
export enum TokenType {
  AccessToken, // 0
  RefreshToken, // 1
  ForgotPasswordToken, // 2
  EmailVerificationToken // 3
}

export enum ConsultantStatus {
  Inactive, // 0
  Active // 1
}
