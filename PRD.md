# Robinson Auto-Checker - Product Requirements Document (PRD) v1.0

## 1. Tổng quan & Mục tiêu (Overview & Goals)
- **Tên dự án:** Robinson Auto-Checker.
- **Mục tiêu:** Cung cấp công cụ hỗ trợ sinh viên ngành Công nghệ thông tin/Toán tin tự học và kiểm tra bài tập Logic mệnh đề/vị từ. Hệ thống giúp minh bạch hóa quá trình biến đổi CNF và thuật toán hợp giải Robinson.
- **Giá trị cốt lõi:** Chính xác, chi tiết từng bước, giao diện thân thiện, hỗ trợ đối chiếu bài làm.

## 2. Phạm vi (Scope)

### 2.1. Trong phạm vi (MVP - Giai đoạn 1 & 2)
- **Logic mệnh đề (Propositional Logic):** Hỗ trợ các biến mệnh đề (p, q, r...) và các phép nối cơ bản.
- **Chuẩn hóa CNF (Conjunctive Normal Form):** Trình bày chi tiết từng bước biến đổi (loại bỏ `->`, phủ định, phân phối).
- **Thuật toán hợp giải Robinson (Resolution):** Thêm phủ định kết luận, tìm mâu thuẫn, xuất dãy hợp giải.
- **Giao diện Web:** 
    - Landing page (2 nút: Nhập text & Tải ảnh).
    - Form nhập liệu text (Tiền đề + Kết luận).
    - Trang kết quả 2 bước (CNF & Robinson).
    - Trang "Tài nguyên" (Bài tập mẫu & Lời giải chi tiết).
- **Quản lý lượt dùng:** Giới hạn 20 lượt kiểm tra/ngày dựa trên IP/Thiết bị.

### 2.2. Ngoài phạm vi (Giai đoạn 3 & 4 - Future Enhancements)
- **Logic vị từ (Predicate Logic):** Xử lý biến, lượng từ ($\forall, \exists$) và phép hợp nhất (Unification).
- **OCR (Optical Character Recognition):** Nhận diện công thức từ ảnh chụp bài làm (Tesseract/Vision API).
- **So sánh bài làm:** Hệ thống phân tích bài làm của sinh viên (từ OCR) và so sánh với kết quả đúng để chỉ ra lỗi sai.
- **Tích hợp LMS:** Kết nối với Moodle/Canvas cho giảng viên.
- **Hệ thống Tài khoản:** Đăng nhập để lưu lịch sử bài tập.

## 3. Sơ đồ Flow UX (User Flow)
1. **Trang chủ:** Giới thiệu + Nút "Nhập công thức" / "Tải ảnh bài làm".
2. **Nhập liệu:** Form văn bản (Tiền đề + Kết luận) + Chọn loại (Mệnh đề/Vị từ).
3. **Kết quả Bước 1 (CNF):** Hiển thị công thức gốc -> Các bước biến đổi -> Trạng thái (Xanh/Đỏ).
4. **Kết quả Bước 2 (Robinson):** Dãy hợp giải (từng cặp mệnh đề) -> Kết luận (Đúng/Sai).
5. **Giới hạn:** Thanh thông báo số lượt còn lại (VD: 12/20).

## 4. User Stories (MVP)

| ID | Module | User Story |
|---|---|---|
| **US01** | Nhập liệu | Là sinh viên, tôi muốn nhập tập hợp các tiền đề và kết luận dưới dạng văn bản để hệ thống xử lý. |
| **US02** | Xử lý CNF | Là sinh viên, tôi muốn xem các bước biến đổi công thức sang dạng chuẩn hội (CNF) để đối chiếu với bài làm. |
| **US03** | Hợp giải | Là sinh viên, tôi muốn xem dãy các bước hợp giải tìm mâu thuẫn để hiểu cách chứng minh. |
| **US04** | Giới hạn | Là người dùng, tôi muốn biết số lượt kiểm tra còn lại trong ngày để điều phối việc học tập. |
| **US05** | Tài nguyên | Là sinh viên, tôi muốn xem các bài tập mẫu có lời giải chi tiết để luyện tập thêm. |

## 5. Yêu cầu chức năng (Functional Requirements)

### FR1: Module Nhập liệu & Landing
- Landing page với 2 lựa chọn chính.
- Hỗ trợ ký hiệu: `~` (NOT), `&` (AND), `|` (OR), `->` (IMPLY), `<->` (EQUIVALENT).
- Cho phép chọn loại logic (Mệnh đề là mặc định cho MVP).

### FR2: Module Xử lý CNF
- Hiển thị công thức ban đầu.
- Hiển thị các bước biến đổi chi tiết (Tên quy tắc + Công thức sau biến đổi).
- Trạng thái: "CNF đúng" (Xanh) hoặc "CNF không đúng" (Đỏ + Giải thích).

### FR3: Module Hợp giải Robinson
- Thêm phủ định kết luận vào tập mệnh đề.
- Hiển thị dãy hợp giải (Clause i, Clause j -> Clause k).
- Kết luận: "Suy diễn đúng" (Có mâu thuẫn $\square$) hoặc "Suy diễn sai".

### FR4: Module Tài nguyên
- Danh sách bài tập Robinson mẫu.
- Lời giải chi tiết từng bước cho mỗi bài tập.
- Nút "Tải bài làm mẫu" (File JSON/Ảnh).

## 6. Acceptance Criteria (Given-When-Then)

| User Story | Acceptance Criteria |
|---|---|
| **US01** | **Given:** Người dùng ở trang Dashboard. **When:** Nhập các tiền đề `p->q`, `p` và kết luận `q`, nhấn "Kiểm tra". **Then:** Hệ thống chấp nhận và bắt đầu xử lý. |
| **US02** | **Given:** Công thức đầu vào hợp lệ. **When:** Hệ thống thực hiện chuẩn hóa. **Then:** Hiển thị các bước biến đổi kèm trạng thái Xanh/Đỏ. |
| **US03** | **Given:** Tập mệnh đề CNF đã sẵn sàng. **When:** Chạy thuật toán Robinson. **Then:** Hiển thị bảng dãy hợp giải và kết luận cuối cùng. |
| **US04** | **Given:** Người dùng truy cập Dashboard. **When:** Nhìn vào thanh thông báo. **Then:** Thấy số lượt còn lại (VD: "Bạn còn 15/20 lượt hôm nay"). |
| **US05** | **Given:** Người dùng ở trang Tài nguyên. **When:** Chọn một bài tập mẫu. **Then:** Xem được đề bài và lời giải chi tiết từng bước. |

## 7. Gợi ý Stack công nghệ
- **Frontend:** React (TypeScript), Tailwind CSS, Lucide React, Motion.
- **Backend:** Python + FastAPI (Ưu tiên cho logic engine).
- **Engine Logic:** Python (ast, pyparsing, networkx).
- **Cơ sở dữ liệu:** SQLite (Lưu lượt dùng & bài tập mẫu).

## 8. API Assumptions
- `POST /api/parse`: Nhận text -> Trả về AST.
- `POST /api/cnf`: Nhận AST -> Trả về quy trình chuẩn hóa.
- `POST /api/resolve`: Nhận tập mệnh đề -> Trả về sequence hợp giải + cây mâu thuẫn.
- `POST /api/ocr` (Phase 3): Nhận ảnh -> Trả về text logic.
