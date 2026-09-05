# Phạm vi kiểm tra

Kiểm tra trên Chromium headless bằng Playwright, dựng từ bản HTML một file.

## Đã kiểm tra

- 26 phần hiển thị, không lỗi JavaScript trong quá trình thử.
- Kích thước desktop 1440×900, laptop 1366×768 và mobile 390×844.
- Không tràn ngang toàn trang tại các kích thước kiểm tra. Bảng rộng và biểu đồ trên mobile có vùng cuộn riêng.
- Phần nội dung dài có cuộn, không bị cắt khỏi khả năng truy cập.
- Phím điều hướng, nút điều hướng, đổi chế độ đọc/trình chiếu, mục lục không dấu và đóng hộp thoại bằng Escape.
- Thanh kéo sử dụng phím mũi tên mà không chuyển phần; không chuyển phần khi đang nhập ghi chú.
- Chọn phân khu, chuyển lịch buổi sáng/chiều, ba kịch bản, biểu đồ dòng tiền và bảng số liệu.
- Các kịch bản EBITDA: thấp −59,5; cơ sở +15; tốt +61,5 triệu/tháng.
- Độ nhạy: thuê 80 triệu cho EBITDA −5 triệu; giá thu bình quân 1,4 triệu cho EBITDA −17 triệu tại các giả định cơ sở khác.
- Năm đầu: EBITDA lũy kế −471,1 triệu; tiền mặt cuối năm 628,9 triệu; cần 268 khách mới; tiền mặt thấp nhất tại tháng 7.
- Tổng diện tích phân khu đúng 500 m².
- File Excel tải từ bản một file có SHA-256 trùng file gốc.
- Xuất ghi chú gồm dấu chọn, văn bản nhập và giả định mô phỏng; không gọi máy chủ.
- Lưu cục bộ có xử lý trường hợp trình duyệt chặn storage. Không giả định storage luôn sẵn có.

## Chưa phải phạm vi xác nhận

Chưa kiểm thử trên thiết bị thật, mọi phiên bản Safari/Firefox, công cụ đọc màn hình hoặc mọi môi trường hosting. Toàn màn hình và lưu trữ cục bộ phụ thuộc chính sách của trình duyệt.

Đây không phải báo cáo kiểm định khả năng tiếp cận WCAG đầy đủ. Chưa xác nhận pháp lý, công năng, sức mua hoặc an toàn của địa điểm thực tế.

Bản nhiều file dùng cùng CSS, JavaScript và nội dung với bản một file. Nguồn ngoài không cần truy cập để chạy trang; chưa thực hiện kiểm tra tình trạng toàn bộ URL nguồn trong bước dựng website này.
