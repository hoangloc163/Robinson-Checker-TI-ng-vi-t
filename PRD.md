# Product Requirements Document (PRD) v1.0 - Robinson Auto-Checker

## 1. Tổng quan & Mục tiêu (Overview & Goals)
- **Tên sản phẩm:** Robinson Auto-Checker
- **Mục tiêu:** Xây dựng một ứng dụng Web giáo dục giúp sinh viên nhập công thức logic mệnh đề (và sau này là vị từ), tự động chuẩn hóa CNF, kiểm tra tính đúng đắn bằng thuật toán hợp giải Robinson và hiển thị chi tiết từng bước.
- **Giá trị cốt lõi:** Giúp sinh viên đối chiếu bài làm, hiểu rõ từng bước giải thay vì chỉ nhận kết quả cuối cùng.

## 2. Phạm vi dự án (Scope)
### 2.1. In-scope (MVP - Giai đoạn 1 & 2)
- **Giao diện (Frontend):** Landing page giới thiệu, Form nhập liệu văn bản.
- **Xử lý Logic Mệnh đề:** Hỗ trợ các công thức logic mệnh đề cơ bản.
- **Chuẩn hóa CNF:** Trình bày chi tiết từng bước biến đổi, báo trạng thái Xanh (Đúng) / Đỏ (Sai kèm giải thích).
- **Thuật toán Hợp giải Robinson:** Thêm phủ định kết luận, chạy vòng lặp tìm mâu thuẫn, xuất dãy hợp giải (từng cặp mệnh đề).
- **Quản lý lượt dùng:** Giới hạn số lượt kiểm tra (VD: 20 lượt/ngày) dựa trên IP/Thiết bị.

### 2.2. Out-of-scope (Future Phases 3 & 4)
- **Giai đoạn 3:** Upload ảnh/file PDF, tích hợp OCR (trích xuất mệnh đề từ ảnh), mở rộng hỗ trợ Logic Vị từ (có biến, unification), Tree visualization cho bước hợp giải.
- **Giai đoạn 4:** Tích hợp hệ thống tài khoản (Login), trang "Tài nguyên/Bài tập mẫu", tích hợp LMS (Moodle/Canvas), tạo channel cộng đồng.

## 3. Đối tượng người dùng (Personas)
- **Sinh viên:** Người học môn Cơ sở tri thức / Toán rời rạc. Cần công cụ để kiểm tra lại bài tập về nhà, xem chi tiết từng bước biến đổi CNF và hợp giải để hiểu bài sâu hơn.
- **Giảng viên:** Người dạy môn học. Cần công cụ để tạo nhanh đáp án chuẩn cho các bài tập, đề thi, hoặc dùng để demo trực quan trên lớp.

## 4. User Stories (MVP)
| ID | Module | User Story |
|---|---|---|
| US01 | Nhập liệu | Là sinh viên, tôi muốn nhập tập công thức ban đầu (tiền đề và kết luận) dưới dạng văn bản để hệ thống bắt đầu kiểm tra. |
| US02 | Xem kết quả CNF | Là sinh viên, tôi muốn xem chi tiết từng bước chuẩn hóa CNF của các công thức đã nhập để đối chiếu với các bước tôi tự làm. |
| US03 | Xem kết quả CNF | Là sinh viên, tôi muốn nhận được cảnh báo (màu Đỏ kèm giải thích) nếu công thức nhập vào sai cú pháp để tôi có thể sửa lại. |
| US04 | Xem kết quả Hợp giải | Là sinh viên, tôi muốn xem dãy các bước hợp giải (từng cặp mệnh đề) và kết luận cuối cùng (có mâu thuẫn hay không) để biết suy diễn của mình đúng hay sai. |
| US05 | Quản lý lượt dùng | Là sinh viên, tôi muốn biết mình còn bao nhiêu lượt kiểm tra trong ngày để có kế hoạch sử dụng hợp lý. |

## 5. Yêu cầu chức năng (Functional Requirements - FR)
### FR1. Module Giao diện & Nhập liệu
- **FR1.1 Landing Page:** Hiển thị giới thiệu ngắn gọn về ứng dụng và nút "Nhập công thức logic".
- **FR1.2 Form nhập liệu:**
  - Textarea để nhập tập công thức giả thiết (mỗi dòng một công thức).
  - Input để nhập công thức kết luận.
  - Nút "Chuẩn hóa & kiểm tra".
  - Hỗ trợ các ký hiệu logic cơ bản (AND, OR, NOT, IMPLY, EQUIVALENT).

### FR2. Module Xử lý CNF (Bước 1)
- **FR2.1 Hiển thị công thức gốc:** Hiển thị lại các công thức người dùng đã nhập.
- **FR2.2 Hiển thị các bước chuẩn hóa:** Trình bày từng bước biến đổi (loại bỏ kéo theo, phủ định, phân phối) cho đến khi ra dạng CNF.
- **FR2.3 Đánh giá trạng thái:**
  - Trạng thái Xanh: Nếu công thức hợp lệ và chuẩn hóa thành công.
  - Trạng thái Đỏ: Nếu công thức sai cú pháp, chỉ ra lỗi ở đâu và gợi ý cách sửa.

### FR3. Module Xử lý Hợp giải Robinson (Bước 2)
- **FR3.1 Chuẩn bị tập mệnh đề:** Tự động thêm phủ định của kết luận vào tập mệnh đề đã chuẩn hóa CNF.
- **FR3.2 Thực hiện hợp giải:** Tìm các cặp mệnh đề có literal trái dấu để hợp giải.
- **FR3.3 Hiển thị kết quả:**
  - In ra dãy hợp giải theo từng bước (Mệnh đề 1 + Mệnh đề 2 -> Mệnh đề kết quả).
  - Kết luận cuối cùng: Nếu ra mệnh đề rỗng (mâu thuẫn) -> "Suy diễn đúng". Nếu không thể hợp giải tiếp -> "Suy diễn sai".

### FR4. Module Quản lý lượt dùng
- **FR4.1 Đếm lượt dùng:** Theo dõi số lần nhấn "Chuẩn hóa & kiểm tra" dựa trên IP (hoặc LocalStorage cho frontend MVP).
- **FR4.2 Thanh thông báo:** Hiển thị số lượt còn lại (VD: "Bạn còn 12/20 lượt kiểm tra hôm nay").
- **FR4.3 Chặn sử dụng:** Khi hết lượt, vô hiệu hóa nút kiểm tra và hiển thị thông báo yêu cầu đợi đến ngày hôm sau.

## 6. Acceptance Criteria (Tiêu chí nghiệm thu)
| ID | User Story | Acceptance Criteria (Given - When - Then) |
|---|---|---|
| AC01.1 | US01 | **Given** người dùng đang ở trang Nhập liệu<br>**When** người dùng nhập tập tiền đề hợp lệ, kết luận hợp lệ và nhấn "Chuẩn hóa & kiểm tra"<br>**Then** hệ thống chuyển sang trạng thái loading và gọi API xử lý. |
| AC02.1 | US02 | **Given** hệ thống đã xử lý xong dữ liệu hợp lệ<br>**When** người dùng xem phần "Kết quả Bước 1"<br>**Then** hệ thống hiển thị danh sách các bước biến đổi CNF với trạng thái màu Xanh. |
| AC03.1 | US03 | **Given** người dùng nhập công thức sai cú pháp (VD: thiếu ngoặc)<br>**When** người dùng nhấn "Chuẩn hóa & kiểm tra"<br>**Then** hệ thống hiển thị thông báo lỗi màu Đỏ, chỉ ra vị trí lỗi và không gọi API hợp giải. |
| AC04.1 | US04 | **Given** hệ thống đã hoàn thành chuẩn hóa CNF thành công<br>**When** người dùng xem phần "Kết quả Bước 2"<br>**Then** hệ thống hiển thị danh sách các cặp mệnh đề được hợp giải và dòng kết luận "Suy diễn đúng" hoặc "Suy diễn sai". |
| AC05.1 | US05 | **Given** người dùng truy cập vào ứng dụng<br>**When** người dùng nhìn lên thanh công cụ/header<br>**Then** hệ thống hiển thị dòng chữ "Bạn còn X/20 lượt kiểm tra hôm nay". |
| AC05.2 | US05 | **Given** người dùng đã sử dụng hết 20 lượt trong ngày<br>**When** người dùng cố gắng nhấn "Chuẩn hóa & kiểm tra"<br>**Then** hệ thống chặn thao tác và hiển thị thông báo "Bạn đã hết lượt, vui lòng quay lại vào ngày mai". |

## 7. Yêu cầu phi chức năng (Non-functional Requirements)
- **Hiệu năng (Performance):** Thời gian phản hồi từ khi nhấn nút kiểm tra đến khi hiển thị kết quả (CNF & Hợp giải) không vượt quá 3 giây đối với các bài toán cơ bản.
- **Giao diện (Usability):** Giao diện thân thiện, rõ ràng, phù hợp với sinh viên. Sử dụng màu sắc để phân biệt trạng thái (Xanh/Đỏ). Responsive tốt trên cả Desktop và Mobile. Sử dụng LaTeX (KaTeX) để render các ký tự logic ($\forall, \exists, \neg, \vee, \wedge, \rightarrow, \leftrightarrow$) một cách chuyên nghiệp thay vì text thuần.
- **Độ tin cậy (Reliability):** Engine logic phải đảm bảo tính chính xác tuyệt đối theo các quy tắc toán học của thuật toán Robinson.

## 8. API Assumptions (Giả định API)
Các API dự kiến sẽ được xử lý thông qua Gemini API (LLM) đóng vai trò là Inference Engine:
- `POST /generateContent`: Gửi prompt chứa "Mệnh đề cho trước" và "Kết luận cần chứng minh" tới model `gemini-2.5-flash`.
- Model sẽ trả về một chuỗi JSON hợp lệ chứa danh sách các bước (`steps`), kết hợp cả quá trình chuẩn hóa CNF và hợp giải Robinson.
- Frontend sẽ parse JSON này và hiển thị lên giao diện.
