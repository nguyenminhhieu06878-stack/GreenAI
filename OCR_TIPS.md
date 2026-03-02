# 📸 Hướng Dẫn Chụp Ảnh Đồng Hồ Điện Để OCR Chính Xác

## ✅ Cách Chụp Ảnh Tốt Nhất

### 1. Ánh Sáng
- ✅ Chụp ở nơi có đủ ánh sáng
- ✅ Tránh chụp ngược sáng
- ✅ Không để bóng che khuất số
- ❌ Không chụp khi quá tối hoặc quá sáng gây chói

### 2. Góc Chụp
- ✅ Chụp thẳng góc với đồng hồ
- ✅ Giữ camera song song với mặt đồng hồ
- ❌ Tránh chụp nghiêng, xiên góc

### 3. Khoảng Cách
- ✅ Chụp đủ gần để thấy rõ số
- ✅ Số chiếm ít nhất 50% khung hình
- ❌ Không chụp quá xa (số nhỏ, mờ)
- ❌ Không chụp quá gần (mất nét)

### 4. Độ Nét
- ✅ Đợi camera lấy nét xong mới chụp
- ✅ Giữ tay thật vững
- ❌ Tránh ảnh bị mờ, rung

### 5. Làm Sạch
- ✅ Lau sạch mặt kính đồng hồ trước khi chụp
- ✅ Đảm bảo không có vết bẩn che số

## 🎯 Ví Dụ Ảnh Tốt vs Ảnh Xấu

### ✅ Ảnh Tốt
```
- Ánh sáng đều
- Số rõ ràng, sắc nét
- Chụp thẳng góc
- Không có phản chiếu
- Số chiếm phần lớn khung hình
```

### ❌ Ảnh Xấu
```
- Quá tối hoặc quá sáng
- Số bị mờ
- Chụp nghiêng
- Có phản chiếu ánh sáng
- Số quá nhỏ trong khung hình
```

## 🔧 Cải Thiện Độ Chính Xác OCR

### Backend đã được tối ưu với:
1. **Whitelist chỉ nhận diện số:** `0123456789.`
2. **PSM Mode:** Single block text detection
3. **OCR Engine:** LSTM (Long Short-Term Memory) - chính xác hơn
4. **Smart number extraction:** Lọc và chọn số hợp lý nhất
5. **Range validation:** Chỉ chấp nhận số trong khoảng 0-999999

### Nếu OCR vẫn sai:
- Thử chụp lại với ánh sáng tốt hơn
- Chụp nhiều ảnh và chọn ảnh rõ nhất
- Hoặc nhập thủ công bằng tính năng "Nhập Thủ Công"

## 📱 Tips Cho Mobile

1. Bật đèn flash nếu chụp trong nhà tối
2. Dùng chế độ HDR nếu có
3. Zoom vào trước khi chụp (không zoom sau)
4. Chạm vào màn hình để lấy nét chính xác
5. Giữ điện thoại bằng 2 tay để tránh rung

## 🎓 Lưu Ý Quan Trọng

- OCR có độ chính xác 70-90% tùy chất lượng ảnh
- Luôn kiểm tra lại số sau khi OCR
- Có thể chỉnh sửa nếu sai
- Nếu không chắc, dùng nhập thủ công an toàn hơn

## 🔍 Troubleshooting

### OCR trả về 0 hoặc số lạ?
→ Ảnh quá mờ hoặc không có số rõ ràng
→ Thử chụp lại với ánh sáng tốt hơn

### OCR đọc thiếu số?
→ Một số chữ số bị che hoặc mờ
→ Lau sạch đồng hồ và chụp lại

### OCR đọc sai số?
→ Góc chụp không tốt hoặc phản chiếu
→ Chụp thẳng góc và tránh ánh sáng phản chiếu

## 💡 Pro Tips

1. **Chụp vào ban ngày** - ánh sáng tự nhiên tốt nhất
2. **Dùng chế độ chụp tài liệu** nếu điện thoại có
3. **Chụp nhiều ảnh** rồi chọn ảnh rõ nhất
4. **Kiểm tra preview** trước khi upload
5. **Backup bằng ảnh chụp màn hình** nếu cần

---

**Lưu ý:** Hệ thống đã được tối ưu để đọc số chính xác hơn. Nếu vẫn gặp vấn đề, hãy liên hệ support!
