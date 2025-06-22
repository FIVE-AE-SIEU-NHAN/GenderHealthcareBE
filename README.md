# 🏥 GenderHealthcareBE

**GenderHealthcareBE** là hệ thống backend được xây dựng bằng **Node.js + TypeScript + Prisma + Express**, phục vụ cho ứng dụng chăm sóc sức khỏe giới tính.  
Hệ thống cung cấp các API cho quản lý người dùng, đặt lịch hẹn, tư vấn viên và gửi câu hỏi liên quan đến sức khỏe.

---

## ⚙️ Cài đặt & Chạy thử

```bash
# 1. Clone dự án
git clone https://github.com/your-username/GenderHealthcareBE.git
cd GenderHealthcareBE

# 2. Cài dependencies
npm install

# 3. Generate Prisma client
npx prisma generate

# 4. Chạy server ở chế độ phát triển
npm run dev
```

---

## 📁 **Cấu trúc thư mục**

```
Directory structure:
└── five-ae-sieu-nhan-genderhealthcarebe/
    ├── nodemon.json
    ├── package.json
    ├── tsconfig.json
    ├── type.d.ts
    ├── .editorconfig
    ├── .eslintignore
    ├── .eslintrc
    ├── .prettierignore
    ├── .prettierrc
    ├── prisma/
    │   └── schema.prisma
    └── src/
        ├── index.ts
        ├── type.d.ts
        ├── constants/
        │   ├── enums.ts
        │   ├── httpStatus.ts
        │   └── messages.ts
        ├── controllers/
        │   ├── appointment.controllers.ts
        │   ├── question.controllers.ts
        │   ├── users.controllers.ts
        │   └── admin/
        │       ├── admin.questions.controller.ts
        │       └── admin.users.controller.ts
        ├── middlewares/
        │   ├── appointment.middlewares.ts
        │   ├── decentralization .middlewares.ts
        │   ├── error.middlewares.ts
        │   ├── filter.middlewares.ts
        │   ├── question.middlewares.ts
        │   └── user.middlewares.ts
        ├── models/
        │   ├── Errors.ts
        │   ├── RefreshToken.schema.ts
        │   ├── User.schema.ts
        │   └── requests/
        │       ├── appointment.requests.ts
        │       ├── question.requests.ts
        │       └── users.requests.ts
        ├── repositories/
        │   ├── appointment.repository.ts
        │   ├── consultant_profile.repository.ts
        │   ├── question.repository.ts
        │   └── user.respository.ts
        ├── routers/
        │   ├── appointment/
        │   │   └── appointment.router.ts
        │   ├── consultant/
        │   │   ├── consultant.router.ts
        │   │   └── manager.consultant.routers.ts
        │   ├── question/
        │   │   ├── admin.question.router.ts
        │   │   └── question.routers.ts
        │   └── user/
        │       ├── admin.users.router.ts
        │       └── user.routers.ts
        ├── services/
        │   ├── appointment.services.ts
        │   ├── client.ts
        │   ├── email.services.ts
        │   ├── prisma.services.ts
        │   ├── question.services.ts
        │   ├── refreshToken.services.ts
        │   └── users.services.ts
        ├── socket/
        │   └── chat.socket.ts
        └── utils/
            ├── crypto.ts
            ├── google.ts
            ├── handler.ts
            ├── jwt.ts
            ├── nanoid.ts
            ├── redis.ts
            └── validation.ts
```

---

# Tài liệu API cho GenderHealthcare

Tài liệu này cung cấp thông tin chi tiết về tất cả các API trong hệ thống GenderHealthcare, được tổ chức theo từng router.

## 📋 Mục lục

- [API Người dùng](#api-người-dùng)
- [API Cuộc hẹn](#api-cuộc-hẹn)
- [API Câu hỏi](#api-câu-hỏi)
- [API Tư vấn viên](#api-tư-vấn-viên)

## API Người dùng

### 1. 🔐 Gửi OTP

- **Phương thức**: POST
- **Đường dẫn**: `/user/get-otp`
- **Mô tả**: Gửi mã OTP xác minh đến email của người dùng
- **Thân yêu cầu**:
  ```json
  {
    "email": "string"
  }
  ```

**Luồng xử lý**:

1. **Middleware** (`getOTPValidator`):
   - Xác thực định dạng email
   - Trả về trạng thái 422 với thông báo `EMAIL_IS_REQUIRED` hoặc `EMAIL_IS_INVALID` nếu xác thực thất bại
2. **Controller** (`getOTPController`):
   - Sử dụng `redisUtils.saveOTP()` để tạo và lưu trữ OTP với thời hạn 2 phút
   - Gọi dịch vụ email để gửi email xác minh
3. **Service** (`emailServices.sendVerificationEmail`):
   - Gửi email với OTP đến người dùng
   - Trả về trạng thái 200 với thông báo `SEND_MAIL_SUCCESS` khi thành công
   - Trả về trạng thái 404 với thông báo `SEND_MAIL_FAIL` khi thất bại

### 2. 🔐 Đăng ký Người dùng

- **Phương thức**: POST
- **Đường dẫn**: `/user/register`
- **Mô tả**: Đăng ký người dùng mới trong hệ thống
- **Thân yêu cầu**:
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "confirm_password": "string",
    "gender": "male|female|other",
    "phone_number": "string",
    "date_of_birth": "string",
    "email_verify_token": "string"
  }
  ```

**Luồng xử lý**:

1. **Middleware** (`registerValidator`):
   - Xác thực tất cả các trường bắt buộc: name, email, gender, phone_number, password, confirm_password, date_of_birth, email_verify_token
   - Kiểm tra định dạng số điện thoại bằng regex `/(84|0[3|5|7|8|9])+([0-9]{8})\b/g`
   - Xác minh mã OTP bằng `redisUtils.verifyOTP()`
2. **Controller** (`registerController`):
   - Kiểm tra xem email đã tồn tại chưa với `usersServices.checkEmailExist()`
   - Nếu email chưa tồn tại → tạo tài khoản mới với `usersServices.register()`
   - Nếu email đã tồn tại nhưng không có mật khẩu → cập nhật người dùng với `usersServices.updateUserByEmail()`
   - Nếu email đã tồn tại với mật khẩu → trả về lỗi 422 với thông báo `EMAIL_ALREADY_EXISTS`
3. **Service**:
   - Tạo/cập nhật người dùng trong cơ sở dữ liệu
   - Trả về trạng thái 201/200 với thông báo `REGISTER_SUCCESS` khi thành công

### 3. 🔐 Đăng nhập Người dùng

- **Phương thức**: POST
- **Đường dẫn**: `/user/login`
- **Mô tả**: Xác thực người dùng với email và mật khẩu
- **Thân yêu cầu**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```

**Luồng xử lý**:

1. **Middleware** (`loginValidator`):
   - Xác thực định dạng email và mật khẩu
2. **Controller** (`loginController`):
   - Chuyển thông tin đăng nhập đến tầng service
3. **Service** (`usersServices.login`):
   - Kiểm tra thông tin đăng nhập với `userRepository.checkLogin()`
   - Xác minh trạng thái tài khoản không bị cấm
   - Tạo token truy cập và token làm mới với `signAccessToken()` và `signRefreshToken()`
   - Lưu token làm mới trong Redis với `redisUtils.saveRefreshToken()`
   - Trả về token với trạng thái 200 và thông báo `LOGIN_SUCCESS`

### 4. 🔐 Đăng nhập với Google

- **Phương thức**: POST
- **Đường dẫn**: `/user/login-google`
- **Mô tả**: Xác thực người dùng bằng token Google
- **Thân yêu cầu**:
  ```json
  {
    "id_token": "string"
  }
  ```

**Luồng xử lý**:

1. **Middleware** (`loginGoogleValidator`):
   - Xác minh token Google và trích xuất payload
2. **Controller** (`loginGoogleController`):
   - Trích xuất email, tên và ID Google từ token
   - Gọi `usersServices.loginWithGoogleId()`
   - Xử lý ba trường hợp:
     - Tài khoản mới: đăng ký người dùng
     - Tài khoản hiện có với ID Google trùng khớp: đăng nhập
     - Tài khoản hiện có với ID Google khác: trả về lỗi
3. **Service**:
   - Quản lý luồng xác thực
   - Tạo tài khoản hoặc tạo token khi cần
   - Trả về phản hồi phù hợp dựa trên trường hợp

### 5. 🔐 Đăng xuất

- **Phương thức**: POST
- **Đường dẫn**: `/user/logout`
- **Mô tả**: Đăng xuất người dùng bằng cách vô hiệu hóa token làm mới
- **Thân yêu cầu**:
  ```json
  {
    "refresh_token": "string"
  }
  ```

**Luồng xử lý**:

1. **Middleware** (`logoutValidator`):
   - Xác minh tính hợp lệ của token làm mới
   - Trích xuất ID người dùng từ token
2. **Controller** (`logoutController`):
   - Lấy ID người dùng từ token làm mới đã giải mã
   - Gọi dịch vụ đăng xuất
3. **Service** (`usersServices.logout`):
   - Xóa token làm mới khỏi Redis với `redisUtils.deleteRefreshToken()`
   - Trả về trạng thái 200 với thông báo `LOGOUT_SUCCESS`

### 6. 🔐 Quên Mật khẩu

- **Phương thức**: POST
- **Đường dẫn**: `/user/forgot-password`
- **Mô tả**: Khởi động quá trình đặt lại mật khẩu
- **Thân yêu cầu**:
  ```json
  {
    "email": "string"
  }
  ```

**Luồng xử lý**:

1. **Middleware** (`forgotPasswordValidator`):
   - Xác thực định dạng email
2. **Controller** (`forgotPasswordController`):
   - Kiểm tra xem email tồn tại và có mật khẩu
   - Gọi service để xử lý đặt lại mật khẩu
3. **Service** (`usersServices.forgotPassword`):
   - Tạo token quên mật khẩu với `signForgotPasswordToken()`
   - Lưu token trong Redis với `redisUtils.saveForgotPasswordToken()`
   - Gửi email với liên kết đặt lại thông qua `emailServices.sendForgotPasswordEmail()`
   - Trả về trạng thái 200 với thông báo `CHECK_EMAIL_TO_RESET_PASSWORD`

### 7. 🔐 Đặt lại Mật khẩu

- **Phương thức**: POST
- **Đường dẫn**: `/user/reset-password`
- **Mô tả**: Đặt lại mật khẩu người dùng bằng token từ email
- **Thân yêu cầu**:
  ```json
  {
    "password": "string",
    "confirm_password": "string",
    "forgot_password_token": "string"
  }
  ```

**Luồng xử lý**:

1. **Middleware** (`resetPasswordValidator`, `forgotPasswordTokenValidator`):
   - Xác thực định dạng mật khẩu và token
2. **Controller** (`resetPasswordController`):
   - Lấy ID người dùng từ token đã giải mã
   - Chuyển đến tầng service
3. **Service** (`usersServices.resetPassword`):
   - Cập nhật mật khẩu với `userRepository.updatePasswordById()`
   - Sử dụng `hashPassword()` để băm mật khẩu an toàn
   - Trả về trạng thái 200 với thông báo `RESET_PASSWORD_SUCCESS`

## API Cuộc hẹn

### 1. 📅 Đặt Cuộc hẹn

- **Phương thức**: POST
- **Đường dẫn**: `/appointment/book`
- **Mô tả**: Đặt cuộc hẹn với tư vấn viên
- **Thân yêu cầu**:
  ```json
  {
    "topic": "enum_topic",
    "booking_date": "Date",
    "time_slot": "string"
  }
  ```

**Luồng xử lý**:

1. **Middleware** (`accessTokenValidator`, `bookAppointmentValidator`):
   - Xác minh token truy cập và trích xuất ID người dùng
   - Xác thực chi tiết cuộc hẹn
2. **Controller** (`bookAppointmentController`):
   - Lấy tư vấn viên có sẵn cho chủ đề
   - Sử dụng phân bổ round-robin thông qua Redis để phân phối tải
   - Tạo bản ghi cuộc hẹn
3. **Service** (`appointmentServices`):
   - Lưu cuộc hẹn trong cơ sở dữ liệu
   - Trả về trạng thái 200 với thông báo thành công

### 2. 📅 Lấy Cuộc hẹn của Khách hàng

- **Phương thức**: GET
- **Đường dẫn**: `/appointment/customer`
- **Mô tả**: Lấy tất cả cuộc hẹn cho một khách hàng
- **Tham số truy vấn**: Phân trang và bộ lọc tùy chọn

**Luồng xử lý**:

1. **Controller** (`customerAppointmentsController`):
   - Lấy ID người dùng từ token hoặc yêu cầu
   - Gọi service để lấy cuộc hẹn
2. **Service**:
   - Truy vấn cơ sở dữ liệu cho cuộc hẹn theo ID người dùng
   - Trả về trạng thái 200 với danh sách cuộc hẹn

### 3. 📅 Lấy Cuộc hẹn của Tư vấn viên

- **Phương thức**: GET
- **Đường dẫn**: `/appointment/consultant`
- **Mô tả**: Lấy tất cả cuộc hẹn cho một tư vấn viên
- **Tham số truy vấn**: Phân trang và bộ lọc tùy chọn

**Luồng xử lý**:

1. **Controller** (`consultantAppointmentsController`):
   - Lấy ID tư vấn viên từ token
   - Gọi service để lấy cuộc hẹn
2. **Service**:
   - Truy vấn cơ sở dữ liệu cho cuộc hẹn theo ID tư vấn viên
   - Trả về trạng thái 200 với danh sách cuộc hẹn

### 4. 📅 Chỉnh sửa Trạng thái Cuộc hẹn

- **Phương thức**: PATCH
- **Đường dẫn**: `/appointment/:id/edit-status`
- **Mô tả**: Cập nhật trạng thái của cuộc hẹn
- **Tham số yêu cầu**: `id` (ID cuộc hẹn)
- **Thân yêu cầu**:
  ```json
  {
    "status": "string"
  }
  ```

**Luồng xử lý**:

1. **Middleware** (`editStatusAppointmentValidator`):
   - Xác thực ID cuộc hẹn và trạng thái
2. **Controller** (`editStatusAppointmentController`):
   - Cập nhật trạng thái cuộc hẹn
3. **Service**:
   - Chỉnh sửa bản ghi cuộc hẹn trong cơ sở dữ liệu
   - Trả về trạng thái 200 với thông báo thành công

## API Câu hỏi

### 1. ❓ Đặt Câu hỏi

- **Phương thức**: POST
- **Đường dẫn**: `/question/ask`
- **Mô tả**: Tạo câu hỏi mới cho tư vấn viên
- **Thân yêu cầu**:
  ```json
  {
    "topic": "enum_topic",
    "question": "string"
  }
  ```

**Luồng xử lý**:

1. **Middleware** (`accessTokenValidator`, `askQuestionValidator`):
   - Xác thực token và chi tiết câu hỏi
2. **Controller** (`askQuestionController`):
   - Lấy tư vấn viên có sẵn cho chủ đề
   - Sử dụng Redis để quản lý phân phối câu hỏi công bằng
   - Gán câu hỏi cho tư vấn viên tiếp theo trong vòng quay
3. **Service** (`questionServices.createQuestion`):
   - Lưu câu hỏi trong cơ sở dữ liệu
   - Trả về trạng thái 200 với thông báo thành công

### 2. ❓ Lấy Câu hỏi của Khách hàng

- **Phương thức**: GET
- **Đường dẫn**: `/question/customer`
- **Mô tả**: Lấy tất cả câu hỏi được đặt bởi một khách hàng
- **Tham số truy vấn**: Phân trang và bộ lọc tùy chọn

**Luồng xử lý**:

1. **Middleware** (`accessTokenValidator`, `getQuestionValidator`):
   - Xác thực token và tham số
2. **Controller** (`customerQuestionsController`):
   - Lấy ID người dùng từ token
   - Lấy câu hỏi cho người dùng đó
3. **Service**:
   - Truy vấn cơ sở dữ liệu cho câu hỏi theo ID người dùng
   - Trả về trạng thái 200 với danh sách câu hỏi

### 3. ❓ Lấy Câu hỏi của Tư vấn viên

- **Phương thức**: GET
- **Đường dẫn**: `/question/consultant`
- **Mô tả**: Lấy câu hỏi được gán cho một tư vấn viên
- **Tham số truy vấn**: Phân trang và bộ lọc tùy chọn

**Luồng xử lý**:

1. **Middleware** (`accessTokenValidator`, `getQuestionValidator`):
   - Xác thực token và tham số
2. **Controller** (`consultantQuestionsController`):
   - Lấy ID tư vấn viên từ token
   - Lấy câu hỏi được gán
3. **Service**:
   - Truy vấn cơ sở dữ liệu cho câu hỏi theo ID tư vấn viên
   - Trả về trạng thái 200 với danh sách câu hỏi

### 4. ❓ Trả lời Câu hỏi

- **Phương thức**: PATCH
- **Đường dẫn**: `/question/:id/answer`
- **Mô tả**: Cho phép tư vấn viên trả lời câu hỏi
- **Tham số yêu cầu**: `id` (ID câu hỏi)
- **Thân yêu cầu**:
  ```json
  {
    "answer": "string"
  }
  ```

**Luồng xử lý**:

1. **Middleware** (`accessTokenValidator`, `answerQuestionValidator`):
   - Xác thực token và nội dung câu trả lời
2. **Controller** (`answerQuestionsController`):
   - Xác minh tư vấn viên được gán cho câu hỏi
   - Cập nhật câu hỏi với câu trả lời
3. **Service**:
   - Lưu câu trả lời trong cơ sở dữ liệu
   - Trả về trạng thái 200 với thông báo thành công

### 5. ❓ Chỉnh sửa Câu trả lời

- **Phương thức**: PATCH
- **Đường dẫn**: `/question/:id/consultant-edit`
- **Mô tả**: Cho phép tư vấn viên chỉnh sửa câu trả lời của họ
- **Tham số yêu cầu**: `id` (ID câu hỏi)
- **Thân yêu cầu**:
  ```json
  {
    "answer": "string"
  }
  ```

**Luồng xử lý**:

1. **Middleware** (`accessTokenValidator`, `answerQuestionValidator`):
   - Xác thực token và câu trả lời mới
2. **Controller** (`editAnswerQuestionsController`):
   - Xác minh tư vấn viên sở hữu câu trả lời
   - Cập nhật nội dung câu trả lời
3. **Service**:
   - Chỉnh sửa câu trả lời trong cơ sở dữ liệu
   - Trả về trạng thái 200 với thông báo thành công

## API Câu hỏi cho Admin

### 1. 👑 Lấy Tất cả Câu hỏi (Admin)

- **Phương thức**: GET
- **Đường dẫn**: `/question/admin`
- **Mô tả**: Lấy tất cả câu hỏi để admin xem xét
- **Tham số truy vấn**: Phân trang và bộ lọc tùy chọn

**Luồng xử lý**:

1. **Controller** (`adminQuestionsController`):
   - Lấy câu hỏi với các tùy chọn lọc
2. **Service**:
   - Truy vấn cơ sở dữ liệu cho câu hỏi
   - Trả về trạng thái 200 với danh sách câu hỏi phân trang

### 2. 👑 Chỉnh sửa Trạng thái Công khai của Câu hỏi

- **Phương thức**: PATCH
- **Đường dẫn**: `/question/:id/edit`
- **Mô tả**: Chuyển đổi khả năng hiển thị câu hỏi (công khai/riêng tư)
- **Tham số yêu cầu**: `id` (ID câu hỏi)
- **Thân yêu cầu**:
  ```json
  {
    "is_public": boolean
  }
  ```

**Luồng xử lý**:

1. **Middleware** (`editStateQuestionValidator`):
   - Xác thực ID câu hỏi và trạng thái công khai
2. **Controller** (`editStateQuestionController`):
   - Cập nhật trạng thái hiển thị câu hỏi
3. **Service**:
   - Chỉnh sửa bản ghi câu hỏi trong cơ sở dữ liệu
   - Trả về trạng thái 200 với thông báo thành công

### 3. 👑 Xóa Câu hỏi

- **Phương thức**: DELETE
- **Đường dẫn**: `/question/:id/delete`
- **Mô tả**: Xóa vĩnh viễn một câu hỏi
- **Tham số yêu cầu**: `id` (ID câu hỏi)

**Luồng xử lý**:

1. **Middleware** (`deleteQuestionValidator`):
   - Xác thực ID câu hỏi
2. **Controller** (`deleteQuestionController`):
   - Xóa câu hỏi khỏi cơ sở dữ liệu
3. **Service**:
   - Xóa bản ghi câu hỏi
   - Trả về trạng thái 200 với thông báo thành công

## API Quản lý Người dùng cho Admin

### 1. 👑 Lấy Người dùng

- **Phương thức**: GET
- **Đường dẫn**: `/user/get-users`
- **Mô tả**: Lấy tất cả người dùng để quản lý admin
- **Tham số truy vấn**: Phân trang và bộ lọc tùy chọn

**Luồng xử lý**:

1. **Middleware** (`getUsersValidator`):
   - Xác thực tham số truy vấn
2. **Controller** (`getUsersController`):
   - Gọi service để lấy người dùng
3. **Service** (`usersServices.getUsersForAdmin`):
   - Truy vấn cơ sở dữ liệu với bộ lọc
   - Trả về trạng thái 200 với danh sách người dùng phân trang

### 2. 👑 Chỉnh sửa Trạng thái Người dùng

- **Phương thức**: PATCH
- **Đường dẫn**: `/user/:id/edit-status`
- **Mô tả**: Cập nhật trạng thái của người dùng (hoạt động/bị cấm)
- **Tham số yêu cầu**: `id` (ID người dùng)
- **Thân yêu cầu**:
  ```json
  {
    "status": "string"
  }
  ```

**Luồng xử lý**:

1. **Middleware** (`accessTokenValidator`, `editStatusUserValidator`):
   - Xác thực token và tham số
2. **Controller** (`editStatusUserController`):
   - Gọi service để cập nhật trạng thái người dùng
3. **Service** (`usersServices.editStatusUser`):
   - Cập nhật trạng thái người dùng trong cơ sở dữ liệu
   - Trả về trạng thái 200 với thông báo `USER_STATUS_UPDATED_SUCCESSFULLY`

### 3. 👑 Tạo Người dùng

- **Phương thức**: POST
- **Đường dẫn**: `/user/create`
- **Mô tả**: Tạo người dùng mới bởi admin
- **Thân yêu cầu**: Chi tiết người dùng

**Luồng xử lý**:

1. **Middleware** (`createUserValidator`):
   - Xác thực dữ liệu người dùng
2. **Controller** (`createUserController`):
   - Kiểm tra xem email đã tồn tại chưa
   - Tạo người dùng mới nếu email chưa tồn tại
3. **Service** (`usersServices.createUser`):
   - Lưu người dùng trong cơ sở dữ liệu
   - Trả về trạng thái 201 với thông báo `CREATE_USER_SUCCESSFULLTY`

## API Tư vấn viên

### 1. 🧑‍⚕️ Chỉnh sửa Trạng thái Tư vấn viên

- **Phương thức**: PATCH
- **Đường dẫn**: `/consultant/:id/edit-status`
- **Mô tả**: Cập nhật trạng thái của tư vấn viên
- **Tham số yêu cầu**: `id` (ID tư vấn viên)
- **Thân yêu cầu**:
  ```json
  {
    "status": "string"
  }
  ```

**Luồng xử lý**:

1. **Middleware** (`editStatusConsultantValidator`):
   - Xác thực ID tư vấn viên và trạng thái
2. **Controller** (`editStatusConsultantController`):
   - Gọi service để cập nhật trạng thái tư vấn viên
3. **Service** (`usersServices.editStatusConsultant`):
   - Cập nhật trạng thái tư vấn viên trong cơ sở dữ liệu
   - Trả về trạng thái 200 với thông báo thành công

---

Tài liệu này bao gồm các API chính trong hệ thống GenderHealthcare. Mỗi API tuân theo kiến trúc phân lớp với sự phân tách rõ ràng giữa xác thực (middlewares), logic nghiệp vụ (controllers) và truy cập dữ liệu (services).

**Luồng xử lý**:

1. **Middleware** (`registerValidator`):
   - Xác thực tất cả các trường bắt buộc: name, email, gender, phone_number, password, confirm_password, date_of_birth, email_verify_token
   - Kiểm tra định dạng số điện thoại bằng regex `/(84|0[3|5|7|8|9])+([0-9]{8})\b/g`
   - Xác minh mã OTP bằng `redisUtils.verifyOTP()`
2. **Controller** (`registerController`):
   - Kiểm tra xem email đã tồn tại chưa với `usersServices.checkEmailExist()`
   - Nếu email chưa tồn tại → tạo tài khoản mới với `usersServices.register()`
   - Nếu email đã tồn tại nhưng không có mật khẩu → cập nhật người dùng với `usersServices.updateUserByEmail()`
   - Nếu email đã tồn tại với mật khẩu → trả về lỗi 422 với thông báo `EMAIL_ALREADY_EXISTS`
3. **Service**:
   - Tạo/cập nhật người dùng trong cơ sở dữ liệu
   - Trả về trạng thái 201/200 với thông báo `REGISTER_SUCCESS` khi thành công
