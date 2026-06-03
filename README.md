# Toán Anh Bo - Ngân hàng câu hỏi Toán

Ứng dụng quản lý ngân hàng câu hỏi Toán bằng Markdown + YAML, lọc theo thuộc tính học thuật, gom câu hỏi vào gói đề và sinh file LaTeX theo nhiều template khác nhau.

Điểm quan trọng của repo này: `backend/data/` là dữ liệu thật của bạn và đã được đưa vào `.gitignore`, vì vậy câu hỏi riêng không bị đẩy lên GitHub. Repo chỉ lưu code, template và dữ liệu mẫu trong `backend/sample-data/`.

## Tính năng chính

- Quản lý câu hỏi theo từng file `.md`.
- Nhập một câu hỏi bằng Markdown + YAML.
- Nhập hàng loạt câu hỏi bằng delimiter `---END_QUESTION---`.
- Validate YAML/schema trước khi lưu.
- Lọc theo `topic`, `chapter`, `theme`, `difficulty`, `type`.
- Hiển thị công thức bằng KaTeX ở frontend.
- Gom câu hỏi vào gói đề và tự chia theo 3 phần:
  - Phần I: `type: mcq`.
  - Phần II: `type: true_false` hoặc `type: dung_sai`.
  - Phần III: `type: short_answer`, `type: short_answer_4`, `type: essay`.
- Chọn nhiều template LaTeX từ catalog.
- Chỉnh template trong UI, backend kiểm tra đủ placeholder trước khi lưu.

## Cấu trúc dự án

```text
Ngan_Hang_Toan/
├── backend/
│   ├── data/                 # Dữ liệu thật, không commit
│   ├── sample-data/          # File mẫu được commit
│   ├── services/             # Logic backend đã tách
│   ├── templates/            # Catalog và template phụ
│   ├── utils/                # Schema/type helpers
│   ├── server.js             # API Express mỏng
│   ├── template.tex          # Template THPT mặc định
│   └── exam.tex              # File sinh ra, không commit
├── frontend/
│   └── src/
│       ├── components/       # UI components
│       ├── lib/              # API, type helpers, render toán
│       └── App.jsx           # Điều phối state và workflow
├── run.bat
├── .gitignore
└── README.md
```

## Chạy dự án

Cài dependency:

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

Chạy thủ công:

```bash
cd backend
node server.js
```

```bash
cd frontend
npm run dev
```

Mở frontend tại:

```text
http://localhost:5173
```

Backend chạy tại:

```text
http://localhost:3000
```

## Workflow dữ liệu thật

`backend/data/` là nơi chứa toàn bộ câu hỏi thật. Thư mục này không được commit.

Khi clone repo mới hoặc chuyển sang máy khác, tạo lại thư mục dữ liệu:

```bash
mkdir backend/data
```

Nếu muốn thử nhanh bằng dữ liệu mẫu, copy các file trong `backend/sample-data/` sang `backend/data/`:

```bash
cp backend/sample-data/*.md backend/data/
```

Trên Windows PowerShell:

```powershell
Copy-Item backend/sample-data/*.md backend/data/
```

Khi thêm câu hỏi thật, bạn có thể dùng UI `Nhập YAML` hoặc tự tạo file `.md` trong `backend/data/`. Vì `backend/data/` đã bị ignore, Git sẽ không đưa các file này lên GitHub.

## Schema câu hỏi chuẩn

Mỗi câu hỏi là một file Markdown có YAML front matter ở đầu file:

```md
---
topic: "Phân môn"
chapter: "Chương"
theme: "Chủ đề"
difficulty: "Mức độ"
type: "mcq"
---
Nội dung câu hỏi ở đây.
```

Các field bắt buộc:

| Field | Ý nghĩa |
| --- | --- |
| `topic` | Phân môn, ví dụ `Đại số`, `Hình học`, `Giải tích` |
| `chapter` | Chương |
| `theme` | Chủ đề nhỏ |
| `difficulty` | Mức độ |
| `type` | Loại bài tập |

Các `type` hợp lệ:

| Type | Dùng cho | Yêu cầu schema |
| --- | --- | --- |
| `mcq` | Trắc nghiệm | `answers` đúng 4 phương án |
| `true_false` | Đúng/Sai | `statements` đúng 4 ý |
| `dung_sai` | Alias của Đúng/Sai | `statements` đúng 4 ý |
| `short_answer` | Trả lời ngắn | nên có `answer` |
| `short_answer_4` | Trả lời ngắn 4 ý | `short_answers` đúng 4 đáp án |
| `essay` | Tự luận | có thể dùng `space` để chừa khoảng làm bài |

Ví dụ trắc nghiệm:

```md
---
topic: "Đại số"
chapter: "Phương trình"
theme: "Phương trình bậc hai"
difficulty: "Cơ bản"
type: "mcq"
layout: 4
answers:
  - "$x=1$"
  - "$x=2$"
  - "$x=3$"
  - "$x=4$"
answer: "B"
solution: |
  Thay $x=2$ vào phương trình.
---
Nghiệm của phương trình $x+1=3$ là
```

Ví dụ đúng/sai:

```md
---
topic: "Giải tích"
chapter: "Đạo hàm"
theme: "Ứng dụng đạo hàm"
difficulty: "Vận dụng"
type: "true_false"
statements:
  - "Hàm số có đạo hàm $f'(x)=3x^2-12$."
  - "Phương trình $f'(x)=0$ có nghiệm $x=2$."
  - "$f(2)=24$."
  - "Giá trị lớn nhất trên đoạn $[-3;3]$ bằng $24$."
---
Cho hàm số $f(x)=x^3-12x-8$.
```

Ví dụ trả lời ngắn:

```md
---
topic: "Xác suất"
chapter: "Tổ hợp - Xác suất"
theme: "Xác suất cổ điển"
difficulty: "Thông hiểu"
type: "short_answer"
answer: "$\\frac{31}{66}$"
---
Một hộp có $5$ bi đỏ và $7$ bi xanh. Lấy ngẫu nhiên $2$ viên bi.
Tính xác suất để lấy được hai viên bi cùng màu.
```

## Validate trước khi lưu

Frontend có nút `Kiểm tra YAML`. Khi bấm `Lưu vào server`, app cũng tự validate trước khi ghi file.

Backend luôn validate lại bằng `backend/utils/questionSchema.js`. Nếu câu hỏi sai schema, API sẽ trả lỗi và không ghi vào `backend/data/`.

Endpoint validate:

```http
POST /api/questions/validate
```

Body:

```json
{
  "rawContent": "---\ntopic: \"Đại số\"\n...\n---\nNội dung"
}
```

## ID câu hỏi

Khi thêm câu mới trong UI, bạn có thể để trống ô `Mã câu hỏi (ID)`. Backend sẽ tự tạo ID theo dạng:

```text
Q_YYYYMMDD_HHMMSS
```

Ví dụ:

```text
Q_20260603_175251
```

Nếu có nhiều câu được tạo trong cùng một giây, hệ thống tự thêm hậu tố như `_2`, `_3` để không trùng file.

API `POST /api/questions` cũng có thể bỏ qua `id`:

```json
{
  "rawContent": "---\ntopic: \"Đại số\"\n...\n---\nNội dung"
}
```

Nếu muốn sửa một câu cũ hoặc tự đặt ID thủ công, vẫn có thể gửi `id` như trước.

## Template LaTeX

Danh sách template nằm trong:

```text
backend/templates/catalog.json
```

Mỗi template có dạng:

```json
{
  "id": "practice-basic",
  "name": "Phiếu luyện tập 3 phần",
  "description": "Template gọn để luyện tập hoặc in nhanh.",
  "file": "practice-basic.tex",
  "default": false
}
```

Template bắt buộc giữ đủ 3 placeholder:

```tex
% --- PHAN_I_CAU_HOI ---
% --- PHAN_II_CAU_HOI ---
% --- PHAN_III_CAU_HOI ---
```

Khi sinh đề, backend sẽ đưa câu hỏi vào đúng phần dựa trên `type`.

Muốn thêm template mới:

1. Tạo file `.tex` trong `backend/templates/`.
2. Đảm bảo file có đủ 3 placeholder trên.
3. Thêm entry vào `backend/templates/catalog.json`.
4. Chạy lại app, template mới sẽ xuất hiện trong dropdown ở frontend.

## Backend đã tách logic

`backend/server.js` chỉ còn vai trò định nghĩa API. Logic chính nằm ở:

- `backend/services/questionStore.js`: đọc, lưu, xóa, bulk import câu hỏi.
- `backend/services/templateStore.js`: đọc catalog, đọc/lưu/validate template.
- `backend/services/examGenerator.js`: sinh `exam.tex`.
- `backend/services/latexRenderer.js`: chuyển câu hỏi sang LaTeX.
- `backend/utils/questionSchema.js`: chuẩn hóa và validate schema.
- `backend/utils/questionTypes.js`: map `type` sang phần đề.

## Frontend đã tách component

`frontend/src/App.jsx` giữ state và workflow. UI nằm ở:

- `Header.jsx`
- `FilterBar.jsx`
- `ExamPartSummary.jsx`
- `QuestionCard.jsx`
- `Pagination.jsx`
- `YamlModal.jsx`
- `BulkImportModal.jsx`
- `TemplateModal.jsx`
- `CartModal.jsx`

Các helper nằm trong:

- `frontend/src/lib/api.js`
- `frontend/src/lib/questionTypes.js`
- `frontend/src/lib/mathRender.jsx`

## API chính

```http
GET /api/questions
GET /api/questions/:id
POST /api/questions/validate
POST /api/questions
DELETE /api/questions/:id
POST /api/questions/bulk
GET /api/templates
GET /api/templates/:id
POST /api/templates/:id
POST /api/generate-exam
GET /download-exam
```

Sinh đề:

```json
{
  "questionIds": ["Q1", "Q2", "Q3"],
  "templateId": "thpt-2025"
}
```

## Kiểm tra trước khi commit

Backend:

```bash
cd backend
node --check server.js
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

## Quy trình Git hằng ngày

Kiểm tra thay đổi:

```bash
git status
```

Commit code/template/README:

```bash
git add .
git commit -m "Mô tả thay đổi"
git push
```

Không cần commit `backend/data/`, vì đó là dữ liệu riêng. Nếu muốn backup dữ liệu thật, hãy dùng cách riêng tư hơn như ổ cứng cá nhân, Google Drive private, hoặc repo private khác chỉ dành cho dữ liệu.

## Biên dịch LaTeX

File được sinh tại:

```text
backend/exam.tex
```

Nên biên dịch bằng XeLaTeX để hỗ trợ tiếng Việt:

```bash
cd backend
xelatex exam.tex
```

Nếu dùng Overleaf, chọn compiler là XeLaTeX.
