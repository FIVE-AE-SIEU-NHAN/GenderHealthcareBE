export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  //name
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Name length must be from 1 to 100',
  //email
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_IS_INVALID: 'Email is invalid',
  //password
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50: 'Password length must be from 8 to 50',
  PASSWORD_MUST_BE_STRONG:
    'Password must be at least 8 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
  OLD_PASSWORD_IS_INCORRECT: 'Old password is incorrect',
  //confirmPassword
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Confirm password must be a string',
  CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50: 'Confirm length must be from 8 to 50',
  CONFIRM_PASSWORD_MUST_BE_STRONG:
    'Confirm password must be at least 8 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
  CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD: 'Confirm password must be the same as password',
  //dateOfBirth
  DATE_OF_BIRTH_BE_ISO8601: 'Date of birth must be ISO8601',
  // gender
  GENDER_IS_REQUIRED: 'Gender is required',
  GENDER_MUST_BE_A_STRING: 'Gender must be a string',
  GENDER_IS_INVALID: 'Gender is invalid',
  // phoneNumber
  PHONE_NUMBER_IS_REQUIRED: 'Phone number is required',
  PHONE_NUMBER_MUST_BE_STRING: 'Phone number must be a string',
  PHONE_NUMBER_IS_INVALID: 'Phone number is invalid',
  //user
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  LOGIN_SUCCESS: 'Login successfully',
  REGISTER_SUCCESS: 'Register successfully',
  ACCESS_TOKEN_IS_REQUIRED: 'Access Token is required',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh Token is required',
  LOGOUT_SUCCESS: 'Logout success',
  REFRESH_TOKEN_IS_INVALID: 'Refresh Token is invalid',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  EMAIL_VERIFY_TOKEN_IS_INVALID: 'Email verify token is invalid',
  EMAIL_VERIFY_TOKEN_IS_EXPIRED: 'Email verify token is expired',
  VERIFY_EMAIL_SUCCESS: 'Verify email is success',
  EMAIL_HAS_BEEN_VERIFY: 'Email has been verified',
  EMAIL_HAS_BEEN_BANNED: 'Email has been banned',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  FORGOT_PASSWORD_TOKEN_IS_INVALID: 'Forgot password token is invalid',
  USER_NOT_FOUND: 'User not found',
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check email to reset password',
  VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS: 'Verify forgot password token success',
  RESET_PASSWORD_SUCCESS: 'Reset password success',
  GET_PROFILE_SUCCESS: 'Get profile success',
  UPDATE_PROFILE_SUCCESS: 'Update profile success',
  USER_NOT_VERIFIED: 'User not verified',
  USERNAME_ALREADY_EXISTS: 'Username already exists',
  USERNAME_IS_INVALID:
    'Username must be a string and length must be 4 - 15, and contain only letters, numbers, and underscores, not only numbers',
  CHANGE_PASSWORD_SUCCESS: 'Change password successfully',
  REFRESH_TOKEN_SUCCESS: 'Refresh token successfully',
  GOOGLE_ID_IS_INCORRECT: 'Google id is incorrect',
  // mail
  SEND_MAIL_FAIL: 'Send mail fail',
  SEND_MAIL_SUCCESS: 'Send mail success',
  // google
  ID_TOKEN_IS_REQUIRED: 'Id token is required',
  ID_TOKEN_MUST_BE_A_STRING: 'Id token must be a string',
  ID_TOKEN_IS_INVALID: 'Id token is invalid'
} as const //để k ai chỉnh đc
