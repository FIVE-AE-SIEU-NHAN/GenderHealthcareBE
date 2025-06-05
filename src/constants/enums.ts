export enum UserVerifyStatus {
  Unverified, // chưa xác thực email, mặc định = 0
  Verified, // đã xác thực email
  Banned // bị khóa
}
export enum USER_ROLE {
  Admin = 0, 
  Guest = 1, 
  Staff = 2,
  Consultant = 3,
  Manager = 4,
  Customer = 5,
}
export enum TokenType {
  AccessToken, // 0
  RefreshToken, // 1
  ForgotPasswordToken, // 2
  EmailVerificationToken // 3
}
export enum MediaType {
  Image,
  Video
}
