# Robinson Auto-Checker - Product Requirements Document (PRD) v1.0

## 1. Tổng quan & Mục tiêu (Overview & Goals)
- **Tên dự án:** Robinson Auto-Checker.
- **Mục tiêu:** Cung cấp công cụ hỗ trợ sinh viên ngành Công nghệ thông tin/Toán tin tự học và kiểm tra bài tập Logic mệnh đề. Hệ thống giúp minh bạch hóa quá trình biến đổi CNF và thuật toán hợp giải Robinson.
- **Giá trị cốt lõi:** Chính xác, chi tiết từng bước, giao diện thân thiện.

## 2. Phạm vi (Scope)
### 2.1. Trong phạm vi (MVP - Giai đoạn 1 & 2)
- **Logic mệnh đề (Propositional Logic):** Hỗ trợ các biến mệnh đề (p, q, r...) và các phép nối cơ bản.
- **Chuẩn hóa CNF (Conjunctive Normal Form):** Trình bày chi tiết từng bước biến đổi.
- **Thuật toán hợp giải Robinson (Resolution):** Thêm phủ định kết luận, tìm mâu thuẫn, xuất dãy hợp giải.
- **Giao diện Web:** Landing page và Dashboard xử lý chính.
- **Quản lý lượt dùng:** Giới hạn 20 lượt kiểm tra/ngày/thiết bị.

### 2.2. Ngoài phạm vi (Giai đoạn 3 & 4 - Future Enhancements)
- **Logic vị từ (Predicate Logic):** Xử lý biến, lượng từ ($\forall, \exists$) và phép hợp nhất (Unification).
- **OCR/Image Upload:** Nhận diện công thức từ ảnh chụp bài làm.
- **Tích hợp LMS:** Kết nối với Moodle/Canvas cho giảng viên chấm bài.
- **Lịch sử người dùng:** Lưu trữ các bài toán đã giải vào tài khoản cá nhân.

## 3. Đối tượng sử dụng (Personas)
- **Sinh viên:** Cần công cụ đối chiếu đáp án bài tập về nhà, muốn hiểu rõ các bước trung gian thay vì chỉ biết kết quả cuối cùng.
- **Giảng viên:** Cần công cụ tạo nhanh bộ test case hoặc đáp án mẫu cho đề thi.

## 4. User Stories (MVP)

| ID | Module | User Story |
|---|---|---|
| **US01** | Nhập liệu | Là sinh viên, tôi muốn nhập tập hợp các tiền đề và kết luận dưới dạng văn bản để hệ thống xử lý. |
| **US02** | Xử lý CNF | Là sinh viên, tôi muốn xem các bước biến đổi công thức sang dạng chuẩn hội (CNF) để đối chiếu với bài làm của mình. |
| **US03** | Hợp giải | Là sinh viên, tôi muốn xem dãy các bước hợp giải tìm mâu thuẫn để hiểu cách chứng minh tính đúng đắn của lập luận. |
| **US04** | Giới hạn | Là người dùng, tôi muốn biết số lượt kiểm tra còn lại trong ngày để điều phối việc học tập hiệu quả. |

## 5. Yêu cầu chức năng (Functional Requirements)

### FR1: Module Nhập liệu & Landing
- Trang Landing giới thiệu ngắn gọn về thuật toán Robinson.
- Form nhập liệu gồm:
    - Danh sách tiền đề (Premises): Mỗi dòng một công thức.
    - Kết luận (Conclusion): Một công thức duy nhất.
- Hỗ trợ ký hiệu: `~` (NOT), `&` (AND), `|` (OR), `->` (IMPLY), `<->` (EQUIVALENT).

### FR2: Module Xử lý CNF
- Tự động chuẩn hóa từng công thức sang CNF.
- Hiển thị các bước: Loại bỏ `->`, `<->`; Đưa `~` vào trong; Phân phối `|` trên `&`.
- Trạng thái Xanh (Hợp lệ) / Đỏ (Lỗi cú pháp kèm giải thích).

### FR3: Module Hợp giải Robinson
- Tự động thêm phủ định của kết luận vào tập mệnh đề.
- Thực hiện vòng lặp hợp giải: Chọn 2 mệnh đề có cặp literal đối ngẫu.
- Xuất kết quả: Dãy các bước hợp giải (Mệnh đề A, Mệnh đề B => Kết quả).
- Thông báo kết luận: "Lập luận đúng" (Tìm thấy mâu thuẫn) hoặc "Lập luận sai" (Không tìm thấy thêm cặp hợp giải).

### FR4: Module Quản lý lượt dùng
- Theo dõi số lượt dùng (mặc định 20 lượt/ngày).
- Hiển thị badge số lượt còn lại trên giao diện.

## 6. Acceptance Criteria (Given-When-Then)

| User Story | Acceptance Criteria |
|---|---|
| **US01** | **Given:** Người dùng ở trang Dashboard. <br>**When:** Nhập các tiền đề `p->q`, `p` và kết luận `q`, sau đó nhấn "Kiểm tra". <br>**Then:** Hệ thống chấp nhận và bắt đầu xử lý. |
| **US01** | **Given:** Người dùng nhập sai cú pháp (VD: `p -> & q`). <br>**When:** Nhấn "Kiểm tra". <br>**Then:** Hệ thống hiển thị thông báo lỗi màu đỏ tại dòng công thức sai. |
| **US02** | **Given:** Công thức đầu vào hợp lệ. <br>**When:** Hệ thống thực hiện chuẩn hóa. <br>**Then:** Hiển thị ít nhất 3 bước biến đổi trung gian (nếu có) kèm tên quy tắc áp dụng. |
| **US03** | **Given:** Tập mệnh đề CNF đã được tạo. <br>**When:** Chạy thuật toán Robinson. <br>**Then:** Hiển thị bảng dãy hợp giải. Nếu tìm thấy mâu thuẫn, dòng cuối cùng phải là ký hiệu rỗng ($\square$). |
| **US04** | **Given:** Người dùng đã sử dụng hết 20 lượt trong ngày. <br>**When:** Truy cập trang Dashboard. <br>**Then:** Nút "Kiểm tra" bị vô hiệu hóa và hiển thị thông báo "Hết lượt dùng". |

## 7. Yêu cầu phi chức năng (Non-functional Requirements)
- **Hiệu năng:** Xử lý logic và trả kết quả trong < 2 giây.
- **Giao diện:** Thân thiện với sinh viên, phong cách tối giản (Minimalist), hỗ trợ Responsive.
- **Độ tin cậy:** Kết quả hợp giải phải chính xác tuyệt đối theo lý thuyết Logic toán.

## 8. API Assumptions (Sơ bộ)
- `POST /api/parse`: Gửi chuỗi text, nhận về cấu trúc cây (AST) hoặc thông báo lỗi cú pháp.
- `POST /api/cnf`: Nhận AST, trả về danh sách các bước biến đổi CNF.
- `POST /api/resolve`: Nhận danh sách các mệnh đề CNF, trả về mảng các bước hợp giải Robinson.
