# Database Seeding Script

Script này sẽ khởi tạo dữ liệu mẫu cho database BloodHouse MongoDB.

## 📋 Dữ liệu được tạo

### 🏥 **2 Cơ sở y tế tại TP.HCM (Facilities)**
1. **Bệnh viện Chợ Rẫy - Khoa Huyết học**
   - Mã: CR_BLOOD_001
   - Địa chỉ: 201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP.HCM

2. **Viện Huyết học - Truyền máu TP.HCM**
   - Mã: IHTTM_HCM_001
   - Địa chỉ: 118 Hồng Bàng, Phường 12, Quận 5, TP.HCM

### 👥 **24 Users với các role**
- **2 ADMIN**: Quản trị hệ thống
- **2 MANAGER**: Quản lý cơ sở (1 cho mỗi facility)
- **4 DOCTOR**: Bác sĩ (2 cho mỗi facility)
- **6 NURSE**: Y tá (3 cho mỗi facility)  
- **10 MEMBER**: Người hiến máu (tăng từ 6 lên 10)

### 🩸 **8 Nhóm máu (Blood Groups)**
- O+, A+, B+, AB+, O-, A-, B-, AB-
- Đầy đủ thông tin đặc điểm và tỷ lệ dân số

### 🧪 **4 Thành phần máu (Blood Components)**
- **Máu toàn phần** (Whole Blood)
- **Hồng cầu** (Red Blood Cells) 
- **Huyết tương** (Plasma)
- **Tiểu cầu** (Platelets)

### 👨‍⚕️ **12 Facility Staff**
- Phân công nhân viên vào 2 cơ sở
- Mỗi cơ sở có: 1 Manager + 2 Doctor + 3 Nurse

### 📝 **20 Blood Donation Registrations (Tập trung data)**
- **Ngày mai**: 10 đăng ký (8 cho Chợ Rẫy, 2 cho Viện Huyết học)
- **Ngày kia**: 10 đăng ký (8 cho Chợ Rẫy, 2 cho Viện Huyết học)
- Trạng thái: `pending_approval`
- **Tập trung 80% data vào Bệnh viện Chợ Rẫy** để có nhiều data triển khai

## 🚀 Cách sử dụng

### 1. Cài đặt dependencies
```bash
cd WDP301-SE1757-Bloodhouse-BE
npm install
```

### 2. Cấu hình MongoDB
Đảm bảo MongoDB đang chạy và cập nhật connection string trong file `seedDatabase.js`:
```javascript
const MONGODB_URI = 'mongodb://localhost:27017/bloodhouse';
```

### 3. Chạy script
```bash
# Từ thư mục backend
node scripts/seedDatabase.js
```

Hoặc sử dụng npm script:
```bash
npm run seed
```

## 👤 Thông tin đăng nhập mẫu

Tất cả users đều có password: `password123`

### Admin
- Email: `admin1@bloodhouse.vn`
- Password: `password123`

### Manager (Chợ Rẫy) 
- Email: `manager1@choray.vn`
- Password: `password123`

### Manager (Viện Huyết học TP.HCM)
- Email: `manager2@ihttm-hcm.vn`
- Password: `password123`

### Doctor (Chợ Rẫy)
- Email: `doctor1@choray.vn` 
- Email: `doctor2@choray.vn`
- Password: `password123`

### Doctor (Viện Huyết học TP.HCM)
- Email: `doctor3@ihttm-hcm.vn`
- Email: `doctor4@ihttm-hcm.vn` 
- Password: `password123`

### Nurse (Chợ Rẫy)
- Email: `nurse1@choray.vn`
- Email: `nurse2@choray.vn`
- Email: `nurse3@choray.vn`
- Password: `password123`

### Nurse (Viện Huyết học TP.HCM)
- Email: `nurse4@ihttm-hcm.vn`
- Email: `nurse5@ihttm-hcm.vn`
- Email: `nurse6@ihttm-hcm.vn`
- Password: `password123`

### Donor (Người hiến máu)
- Email: `donor1@gmail.com` đến `donor10@gmail.com` (10 donors)
- Password: `password123`

## ⚠️ Lưu ý

1. **Script sẽ XÓA TẤT CẢ dữ liệu hiện có** trong các collection:
   - Users
   - Facilities  
   - FacilityStaffs
   - BloodGroups
   - BloodDonationRegistrations

2. **Chỉ chạy trên database dev/test**, không chạy trên production!

3. Đảm bảo MongoDB đang chạy trước khi chạy script

4. **Data được tập trung vào Bệnh viện Chợ Rẫy** (80% registrations) để thuận tiện cho testing

## 🐛 Troubleshooting

### Nếu chỉ thấy 1 registration thay vì 20:

1. **Kiểm tra console output** khi chạy script:
   ```bash
   npm run seed
   ```

2. **Các log quan trọng cần xem:**
   - `🔍 Found X donors for registrations` 
   - `👨‍⚕️ Nurse staff facility 1: X`
   - `📝 Total registrations to create: 20`
   - `✅ Created X blood donation registrations`

3. **Nguyên nhân thường gặp:**
   - MongoDB connection bị gián đoạn
   - Thiếu foreign key relationships (users, facilities, staff)
   - Validation errors trong model

4. **Cách khắc phục:**
   ```bash
   # Xóa database và chạy lại
   mongosh bloodhouse --eval "db.dropDatabase()"
   npm run seed
   ```

## 📊 Kết quả mong đợi

Sau khi chạy thành công, bạn sẽ có:
- ✅ Database được reset hoàn toàn
- ✅ 8 Blood Groups  
- ✅ 4 Blood Components
- ✅ 2 Facilities tại TP.HCM
- ✅ 24 Users (phân chia theo role)
- ✅ 12 Facility Staff assignments
- ✅ 20 Blood Donation Registrations (tập trung vào Chợ Rẫy)
- ✅ Dữ liệu nhất quán và địa chỉ thực tế tại TP.HCM
- ✅ Debug logging chi tiết để troubleshooting

🎯 **Bệnh viện Chợ Rẫy sẽ có 16/20 registrations** để bạn có nhiều data test các chức năng Manager, Doctor, Nurse! 