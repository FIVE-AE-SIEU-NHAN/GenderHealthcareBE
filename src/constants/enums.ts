export enum UserVerifyStatus {
  Verified, // đã xác thực email
  Banned // bị khóa
}
export enum USER_ROLE {
  Admin, //0
  Consultant, //1
  Staff, //2
  User //3
}
export enum TokenType {
  AccessToken, // 0
  RefreshToken, // 1
  ForgotPasswordToken, // 2
  EmailVerificationToken // 3
}
