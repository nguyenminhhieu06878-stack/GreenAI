# Environment Variables cho Vercel Backend

## Cách thêm:

1. Vào: https://vercel.com/nguyenminhhieu06878-stacks-projects/greenenergy-backend/settings/environment-variables
2. Click "Add New"
3. Copy-paste từng cặp Name/Value dưới đây
4. Chọn Environment: **Production, Preview, Development** (chọn cả 3)
5. Click "Save"

---

## Danh sách Environment Variables:

### 1. NODE_ENV
```
Name: NODE_ENV
Value: production
```

### 2. MONGODB_URI
```
Name: MONGODB_URI
Value: mongodb+srv://quocbao:Hieunguyen1002@cluster0.segxwna.mongodb.net/greenenergy?retryWrites=true&w=majority&appName=Cluster0
```

### 3. JWT_SECRET
```
Name: JWT_SECRET
Value: your-super-secret-jwt-key-change-this-in-production-2024
```

### 4. JWT_EXPIRES_IN
```
Name: JWT_EXPIRES_IN
Value: 7d
```

### 5. UPLOAD_DIR
```
Name: UPLOAD_DIR
Value: /tmp/uploads
```

### 6. MAX_FILE_SIZE
```
Name: MAX_FILE_SIZE
Value: 5242880
```

### 7. GROQ_API_KEY
```
Name: GROQ_API_KEY
Value: your-groq-api-key-here
```

### 8. PAYOS_CLIENT_ID
```
Name: PAYOS_CLIENT_ID
Value: c6b38db6-d4b5-47d7-8dd7-9d295ece27a3
```

### 9. PAYOS_API_KEY
```
Name: PAYOS_API_KEY
Value: 8909c3a3-d25a-4eb8-8a09-64426e4616be
```

### 10. PAYOS_CHECKSUM_KEY
```
Name: PAYOS_CHECKSUM_KEY
Value: 3bb07e9c6e00c4699b49b5f28ec2d095783286360de53a0442a187f820bbd16f
```

### 11. GOOGLE_CLIENT_ID
```
Name: GOOGLE_CLIENT_ID
Value: your-google-client-id.apps.googleusercontent.com
```

### 12. GOOGLE_CLIENT_SECRET
```
Name: GOOGLE_CLIENT_SECRET
Value: your-google-client-secret
```

### 13. CORS_ORIGIN (Tạm thời, sẽ update sau khi deploy frontend)
```
Name: CORS_ORIGIN
Value: https://greenenergy-backend.vercel.app
```

### 14. FRONTEND_URL (Tạm thời, sẽ update sau khi deploy frontend)
```
Name: FRONTEND_URL
Value: https://greenenergy-backend.vercel.app
```

### 15. GOOGLE_CALLBACK_URL
```
Name: GOOGLE_CALLBACK_URL
Value: https://greenenergy-backend.vercel.app/api/auth/google/callback
```

### 16. PAYOS_RETURN_URL (Tạm thời, sẽ update sau khi deploy frontend)
```
Name: PAYOS_RETURN_URL
Value: https://greenenergy-backend.vercel.app/thanh-toan/thanh-cong
```

### 17. PAYOS_CANCEL_URL (Tạm thời, sẽ update sau khi deploy frontend)
```
Name: PAYOS_CANCEL_URL
Value: https://greenenergy-backend.vercel.app/thanh-toan/that-bai
```

---

## Sau khi thêm xong:

1. Click "Redeploy" trong Vercel Dashboard
2. Hoặc chạy: `vercel --prod` trong terminal

---

## Lưu ý:

- Các biến `CORS_ORIGIN`, `FRONTEND_URL`, `PAYOS_RETURN_URL`, `PAYOS_CANCEL_URL` sẽ cần update sau khi deploy frontend
- Sau khi deploy frontend, quay lại đây và update các URL này
