# Hiên Biển | Landing page slideshow

Website thuyết trình tương tác, 26 phần, tiếng Việt. Nội dung chuyển từ bản nghiên cứu tiền khả thi và bảng tính trong cuộc trao đổi về CLB dành cho người cao tuổi tại Đà Nẵng.

## Mở và trình bày

Mở `index.html` bằng trình duyệt có JavaScript. Không cần npm, build server, CDN, tài khoản hay API key.

Bản một file `Hien-Bien_Landing-Slideshow.html` được bàn giao riêng. Bản này nhúng toàn bộ CSS, JavaScript, minh họa và bảng tính gốc, phù hợp gửi cho người tham dự. Các liên kết nguồn bên ngoài chỉ mở khi người xem chủ động chọn.

Máy tính mặc định trình chiếu từng phần. Điện thoại mặc định đọc liên tục. Biểu tượng quyển sách đổi giữa hai chế độ. Một số phần dài có thể cuộn bên trong; không có nội dung bị cố tình cắt bỏ.

| Điều khiển | Tác dụng |
|---|---|
| ← / → hoặc Page Up / Page Down | Chuyển phần |
| Home / End | Phần đầu / phần cuối |
| M | Mục lục tìm kiếm, hỗ trợ nhập không dấu |
| N | Ghi chú thuyết trình của phần hiện tại |
| F | Bật/tắt toàn màn hình nếu trình duyệt cho phép |
| Esc | Đóng hộp thoại hoặc thoát toàn màn hình |
| Thanh tiến độ và tên chương | Đi trực tiếp đến nội dung |

Trên điện thoại, có thể cuộn ở chế độ đọc hoặc vuốt ngang ở chế độ trình chiếu. Thao tác trên thanh kéo, bảng và các điều khiển không bị chuyển phần ngoài ý muốn.

## Cấu trúc câu chuyện

01–04: luận điểm đầu tư, điều kiện mặt bằng và bối cảnh nhu cầu.

05–09: mô hình tham khảo, khách hàng, định vị, business model và gói giá.

10–12: chương trình, lịch một ngày và phân khu 500 m².

13–17: hành trình hội viên, nhân sự, an toàn, đối tác và tuyển/giữ khách.

18–22: ba kịch bản, bộ mô phỏng, ngân sách vốn, dòng tiền 12 tháng và bán trú có điều kiện.

23–26: thử nghiệm trả phí, lộ trình, checklist quyết định và nguồn.

Mỗi phần có ghi chú mở bằng N. `presenter-notes.md` chứa toàn bộ 104 đoạn ghi chú.

## Tương tác

- Ba kịch bản tài chính được tính lại bằng công thức, không phải ảnh chụp.
- Bộ mô phỏng thay đổi số hội viên, doanh thu bình quân, thuê, nhân sự và doanh thu bổ sung. Các giả định chi phí giữ cố định được ghi rõ.
- Biểu đồ EBITDA và tiền mặt chuyển qua lại, có bảng 12 tháng.
- Chọn từng khu vực để xem diện tích và vai trò. Sơ đồ không theo tỷ lệ và không phải bản vẽ hiện trạng.
- Lịch buổi sáng/buổi chiều có thể chuyển đổi.
- Checklist và ghi chú được lưu trên trình duyệt khi localStorage được phép. Không gửi dữ liệu ra máy chủ. Có xuất Markdown và xóa dữ liệu cục bộ.
- File Excel có thể tải trực tiếp từ website. Bản một file giải mã bản Excel nhúng, không cần kết nối mạng.

## Tệp và chỉnh sửa

```text
index.html                   Nội dung hiển thị và cấu trúc 26 phần
assets/styles.css            Thiết kế, responsive, reduced-motion, print styles
assets/app.js                Điều hướng, mô phỏng, biểu đồ, tương tác, lưu cục bộ
assets/content.js            Dữ liệu dùng tại runtime, sinh từ content.json
data/content.json            Metadata, ghi chú, khu vực, checklist và nguồn
data/*.xlsx                  Bảng tính gốc, không sửa
presenter-notes.md            Tài liệu cho người thuyết trình
tools/build_standalone.py     Đóng gói thành một file HTML
tests/smoke_test.py           Kiểm tra nhanh tùy chọn bằng Playwright
QA.md                        Phạm vi kiểm tra
```

Sửa nội dung hiển thị trong `index.html`; sửa ghi chú, dữ liệu khu vực và nguồn trong `data/content.json`. Khi thay đổi số phần hoặc khóa section, cập nhật đồng bộ mục lục/chương, bộ đếm và metadata. Các chuỗi dữ liệu tài chính nằm trong `assets/app.js`; các số tóm tắt cố định trong HTML và ghi chú cũng phải được cập nhật khi thay mô hình.

Sau khi sửa, chạy công cụ đóng gói (Python tiêu chuẩn, không cài thư viện):

```bash
python3 tools/build_standalone.py
```

Công cụ cập nhật `assets/content.js` từ JSON và tạo `dist/Hien-Bien_Landing-Slideshow.html`. Đây không phải hệ thống đồng bộ tự động với Excel. Khi thay file Excel, phải đối chiếu và cập nhật công thức/nội dung web riêng.

Thư mục có thể phục vụ như một website tĩnh. Không cần bước build để chạy bản nhiều file. Chưa triển khai lên hosting hoặc tạo URL công khai. Người nhận có thể dùng bản HTML độc lập mà không cần hosting.

## Giới hạn nội dung

Mặt bằng ~500 m², tầng 5, gần biển do người đề xuất cung cấp. Chưa xác nhận đúng tòa nhà, mã mặt bằng, quyền khai thác, công năng, hiện trạng, chi phí thuê, PCCC hoặc khả năng triển khai bán trú.

Toàn bộ giá, chi phí, công suất, tuyển khách, gia hạn, CAPEX và dòng tiền là giả định tiền khả thi. Không phải báo giá, kết quả khảo sát tại chỗ, ý kiến pháp lý, khuyến nghị đầu tư hoặc cam kết lợi nhuận.

Các nguồn được giữ từ bản nghiên cứu ban đầu. Dựng website không đồng nghĩa tái xác minh tình trạng pháp lý hoặc từng nguồn tại ngày triển khai. Liên kết bên ngoài có thể thay đổi.

Minh họa trên trang đầu là hình vector ý tưởng, không phải ảnh của mặt bằng. Tên Hiên Biển chưa được kiểm tra đăng ký thương hiệu. Không có font, ảnh thương mại, thư viện giao diện hoặc tài nguyên bên ngoài được đóng gói.
