# QR Code Guide - Blood Donation Check-in System

## 1. QR Code Data Format

### Khi tạo QR Code (trong updateBloodDonationRegistration)
```javascript
const qrData = {
  registrationId: "60d0fe4f5311236168a109ca",  // ObjectId của registration
  userId: "60d0fe4f5311236168a109cb",           // ObjectId của user
  bloodGroupId: "60d0fe4f5311236168a109cc"     // ObjectId của blood group
};

// Được stringify thành JSON và encode thành QR code
const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrData));
```

### QR Code chứa chuỗi JSON:
```json
{
  "registrationId": "60d0fe4f5311236168a109ca",
  "userId": "60d0fe4f5311236168a109cb", 
  "bloodGroupId": "60d0fe4f5311236168a109cc"
}
```

## 2. Cách sử dụng API Check-in

### API Endpoint:
```
POST /blood-donation-registration/check-in
```

### Request Body có thể truyền theo 2 cách:

#### Cách 1: Truyền chuỗi JSON đã stringify
```json
{
  "qrData": "{\"registrationId\":\"60d0fe4f5311236168a109ca\",\"userId\":\"60d0fe4f5311236168a109cb\",\"bloodGroupId\":\"60d0fe4f5311236168a109cc\"}"
}
```

#### Cách 2: Truyền object JSON trực tiếp
```json
{
  "qrData": {
    "registrationId": "60d0fe4f5311236168a109ca",
    "userId": "60d0fe4f5311236168a109cb",
    "bloodGroupId": "60d0fe4f5311236168a109cc"
  }
}
```

## 3. Ví dụ cụ thể với OpenAPI/Swagger

### Trong Swagger UI, Request Body:
```json
{
  "qrData": "{\"registrationId\":\"675a1b2c3d4e5f6789012345\",\"userId\":\"675a1b2c3d4e5f6789012346\",\"bloodGroupId\":\"675a1b2c3d4e5f6789012347\"}"
}
```

### Hoặc:
```json
{
  "qrData": {
    "registrationId": "675a1b2c3d4e5f6789012345",
    "userId": "675a1b2c3d4e5f6789012346",
    "bloodGroupId": "675a1b2c3d4e5f6789012347"
  }
}
```

## 4. Test với cURL

```bash
# Test với JSON string
curl -X POST "http://localhost:3000/blood-donation-registration/check-in" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrData": "{\"registrationId\":\"675a1b2c3d4e5f6789012345\",\"userId\":\"675a1b2c3d4e5f6789012346\",\"bloodGroupId\":\"675a1b2c3d4e5f6789012347\"}"
  }'

# Test với JSON object
curl -X POST "http://localhost:3000/blood-donation-registration/check-in" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrData": {
      "registrationId": "675a1b2c3d4e5f6789012345",
      "userId": "675a1b2c3d4e5f6789012346", 
      "bloodGroupId": "675a1b2c3d4e5f6789012347"
    }
  }'
```

## 5. Trình duyệt & Tools hỗ trợ scan QR Code

### A. Chrome Extensions:
1. **QR Code Reader** - Scan QR from webcam
2. **QR Code Generator and Reader** - Tạo và đọc QR
3. **QR Scanner** - Simple QR scanner

### B. Online QR Code Tools:
1. **QR Code Generator**: https://www.qr-code-generator.com/
2. **QR Code Decoder**: https://webqr.com/
3. **QR Stuff**: https://www.qrstuff.com/

### C. Tạo QR Code để test:
1. Vào https://www.qr-code-generator.com/
2. Chọn "Text"
3. Paste JSON string:
```json
{"registrationId":"675a1b2c3d4e5f6789012345","userId":"675a1b2c3d4e5f6789012346","bloodGroupId":"675a1b2c3d4e5f6789012347"}
```
4. Generate QR Code
5. Download và test scan

### D. Mobile Apps cho test:
1. **QR & Barcode Scanner** (Android/iOS)
2. **QR Code Reader** (iOS)
3. **Camera app** trên iPhone (built-in)

## 6. Test Flow hoàn chỉnh

### Bước 1: Tạo registration và approve
```bash
# 1. Tạo registration
POST /blood-donation-registration
{
  "facilityId": "facility_id",
  "bloodGroupId": "blood_group_id",
  "preferredDate": "2024-01-15T09:00:00.000Z"
}

# 2. Approve registration (Manager role)
PUT /blood-donation-registration/{id}
{
  "status": "registered",
  "staffId": "staff_id"
}
# → QR Code được tạo và trả về trong qrCodeUrl
```

### Bước 2: Scan QR và extract data
- Scan QR code được tạo ở bước 1
- Extract JSON string từ QR

### Bước 3: Check-in
```bash
POST /blood-donation-registration/check-in
{
  "qrData": "JSON_STRING_FROM_QR"
}
```

## 7. Debugging QR Code

### Kiểm tra QR Code data:
```javascript
// Nếu có qrCodeUrl từ API response
const qrCodeUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...";

// Để decode QR, có thể dùng online tools hoặc:
// 1. Save image từ base64
// 2. Upload lên https://webqr.com/ 
// 3. Xem content
```

### Validate JSON format:
```javascript
const qrContent = '{"registrationId":"675a1b2c3d4e5f6789012345","userId":"675a1b2c3d4e5f6789012346","bloodGroupId":"675a1b2c3d4e5f6789012347"}';

try {
  const parsed = JSON.parse(qrContent);
  console.log("Valid JSON:", parsed);
} catch (error) {
  console.log("Invalid JSON:", error);
}
```

## 8. Error Cases và Solutions

### Lỗi thường gặp:
1. **"QR code data không hợp lệ"**
   - Solution: Kiểm tra JSON format có đúng không
   
2. **"QR code không chứa thông tin registration ID"**
   - Solution: Đảm bảo QR có field `registrationId`
   
3. **"Không tìm thấy đăng ký hiến máu"**
   - Solution: Kiểm tra `registrationId` có tồn tại trong DB không
   
4. **"Đăng ký này đã được check-in hoặc không ở trạng thái cho phép check-in"**
   - Solution: Chỉ registration có status = "registered" mới check-in được

## 9. Web-based QR Scanner cho testing

### Tạo simple HTML test page:
```html
<!DOCTYPE html>
<html>
<head>
    <title>QR Scanner Test</title>
    <script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>
</head>
<body>
    <div id="reader" width="600px"></div>
    <div id="result"></div>
    
    <script>
        function onScanSuccess(decodedText, decodedResult) {
            console.log(`QR decoded: ${decodedText}`);
            document.getElementById('result').innerHTML = `
                <h3>Scanned QR:</h3>
                <pre>${decodedText}</pre>
                <button onclick="testCheckIn('${decodedText}')">Test Check-in</button>
            `;
        }
        
        function testCheckIn(qrData) {
            fetch('/blood-donation-registration/check-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_TOKEN'
                },
                body: JSON.stringify({ qrData })
            })
            .then(response => response.json())
            .then(data => console.log('Check-in result:', data));
        }
        
        const html5QrCode = new Html5Qrcode("reader");
        html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            onScanSuccess
        );
    </script>
</body>
</html>
```

## 10. Postman Collection

### Import vào Postman:
```json
{
  "info": {
    "name": "Blood Donation QR Check-in",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Check-in with QR String",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"qrData\": \"{\\\"registrationId\\\":\\\"675a1b2c3d4e5f6789012345\\\",\\\"userId\\\":\\\"675a1b2c3d4e5f6789012346\\\",\\\"bloodGroupId\\\":\\\"675a1b2c3d4e5f6789012347\\\"}\"\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{base_url}}/blood-donation-registration/check-in",
          "host": ["{{base_url}}"],
          "path": ["blood-donation-registration", "check-in"]
        }
      }
    }
  ]
}
``` 