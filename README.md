# Toán Anh Bo - Ngân Hàng Câu Hỏi Toán

Ứng dụng quản lý ngân hàng câu hỏi Toán học, nhập câu hỏi bằng Markdown + YAML, lọc theo thuộc tính học thuật, gom câu vào giỏ và sinh file đề thi LaTeX theo cấu trúc đề THPT 3 phần.

## Mục Tiêu

Dự án được thiết kế để hỗ trợ xây dựng ngân hàng câu hỏi Toán theo dạng dữ liệu có cấu trúc. Mỗi câu hỏi là một file Markdown có phần metadata YAML ở đầu file, giúp hệ thống đọc được phân môn, chương, chủ đề, mức độ và loại bài tập.

Từ các câu hỏi đã chọn, hệ thống tự động sinh file `exam.tex` dựa trên template LaTeX, đồng thời tự phân phối câu hỏi vào đúng phần của đề:

- Phần I: câu hỏi trắc nghiệm một đáp án, `type: mcq`.
- Phần II: câu hỏi đúng sai 4 ý, `type: true_false` hoặc `type: dung_sai`.
- Phần III: câu hỏi trả lời ngắn, `type: short_answer`, `type: short_answer_4` hoặc tự luận.

## Tính Năng Chính

- Quản lý câu hỏi theo từng file `.md` trong `backend/data`.
- Nhập một câu hỏi mới bằng YAML + Markdown.
- Nhập hàng loạt nhiều câu hỏi bằng delimiter `---END_QUESTION---`.
- Lọc câu hỏi theo:
  - Phân môn, lấy từ `topic`.
  - Chương, lấy từ `chapter`.
  - Chủ đề, lấy từ `theme`.
  - Mức độ, lấy từ `difficulty`.
  - Loại bài tập, lấy từ `type`.
- Xem trước nội dung câu hỏi có hỗ trợ công thức KaTeX.
- Thêm câu hỏi vào giỏ đề.
- Bốc ngẫu nhiên câu hỏi theo bộ lọc hiện tại.
- Giỏ câu hỏi được nhóm theo Phần I, Phần II, Phần III.
- Sinh file đề thi LaTeX theo template THPT mới.
- Chỉnh sửa template LaTeX trực tiếp trong giao diện.

## Công Nghệ

Frontend:

- React
- Vite
- Tailwind CSS
- KaTeX

Backend:

- Node.js
- Express
- gray-matter để đọc YAML front matter
- File system để lưu câu hỏi và sinh file `.tex`

LaTeX:

- XeLaTeX khuyến nghị để hỗ trợ tiếng Việt và `fontspec`.
- Template dùng các package như `amsmath`, `tikz`, `tasks`, `enumitem`, `fancyhdr`, `tabularx`.

## Cấu Trúc Thư Mục

```text
Ngan_Hang_Toan/
├── backend/
│   ├── data/              # Câu hỏi Markdown + YAML
│   ├── server.js          # API backend và logic sinh đề
│   ├── template.tex       # Template đề THPT 3 phần
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Giao diện chính
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   └── package-lock.json
├── run.bat                # Chạy nhanh backend + frontend trên Windows
├── .gitignore
└── README.md
```

## Cài Đặt

Yêu cầu:

- Node.js
- npm
- Git
- Một bộ LaTeX có hỗ trợ XeLaTeX nếu muốn biên dịch file `.tex` thành PDF

Cài dependency backend:

```bash
cd backend
npm install
```

Cài dependency frontend:

```bash
cd frontend
npm install
```

## Chạy Dự Án

Cách nhanh trên Windows:

```bash
run.bat
```

Lệnh này mở 2 cửa sổ terminal:

- Backend tại `http://localhost:3000`
- Frontend tại `http://localhost:5173`

Chạy thủ công:

```bash
cd backend
node server.js
```

```bash
cd frontend
npm run dev
```

Sau đó mở:

```text
http://localhost:5173
```

## Định Dạng Câu Hỏi

Mỗi câu hỏi là một file `.md` trong `backend/data`. File gồm 2 phần:

- YAML front matter nằm giữa `---`.
- Nội dung Markdown của câu hỏi nằm bên dưới.

Ví dụ câu trắc nghiệm:

```md
---
topic: "Đại số"
chapter: "Phương trình"
theme: "Bậc hai"
difficulty: "Cơ bản"
type: "mcq"
layout: 4
answers:
  - "$x = 1$"
  - "$x = 2$"
  - "$x = 3$"
  - "$x = 4$"
---
Giải phương trình $x^2 - 5x + 6 = 0$.
```

Ví dụ câu đúng sai:

```md
---
topic: "Giải tích"
chapter: "Đạo hàm"
theme: "Ứng dụng đạo hàm"
difficulty: "Vận dụng"
type: "true_false"
statements:
  - "Hàm số đã cho có đạo hàm là $f'(x)=3x^2-12$."
  - "Phương trình $f'(x)=0$ có nghiệm $x=2$."
  - "$f(2)=24$."
  - "Giá trị lớn nhất trên đoạn $[-3;3]$ bằng $24$."
---
Cho hàm số $f(x)=x^3-12x-8$.
```

Ví dụ câu trả lời ngắn:

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

## Các Thuộc Tính YAML Quan Trọng

```yaml
topic: "Phân môn"
chapter: "Chương"
theme: "Chủ đề"
difficulty: "Mức độ"
type: "mcq | true_false | dung_sai | short_answer | short_answer_4 | essay"
```

Một số trường tùy chọn:

```yaml
image: "duong-dan-anh-hoac-url"
image_width: "0.5\\textwidth"
equation: "x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}"
tikz: |
  \\begin{tikzpicture}
  ...
  \\end{tikzpicture}
solution: |
  Nội dung lời giải.
```

## Quy Tắc Phân Phần Khi Sinh Đề

Backend tự đọc `type` của từng câu hỏi trong giỏ và đưa vào đúng phần:

| Type | Phần Trong Đề | Ghi Chú |
| --- | --- | --- |
| `mcq` | Phần I | Trắc nghiệm một đáp án |
| `true_false` | Phần II | Đúng/Sai 4 ý |
| `dung_sai` | Phần II | Alias tiếng Việt không dấu |
| `short_answer` | Phần III | Trả lời ngắn một đáp án |
| `short_answer_4` | Phần III | Trả lời ngắn 4 ý |
| `essay` | Phần III | Tự luận hoặc câu cần khoảng trống làm bài |

Template dùng 3 placeholder:

```tex
% --- PHAN_I_CAU_HOI ---
% --- PHAN_II_CAU_HOI ---
% --- PHAN_III_CAU_HOI ---
```

Không nên xóa 3 dòng này khi chỉnh template, vì backend cần chúng để chèn câu hỏi vào đúng phần.

## API Backend

Lấy danh sách câu hỏi:

```http
GET /api/questions
```

Lấy nội dung raw của một câu hỏi:

```http
GET /api/questions/:id
```

Thêm hoặc cập nhật một câu hỏi:

```http
POST /api/questions
```

Body:

```json
{
  "id": "Q_NEW_1",
  "rawContent": "---\\ntopic: 'Toán'\\n---\\nNội dung câu hỏi"
}
```

Nhập hàng loạt:

```http
POST /api/questions/bulk
```

Xóa câu hỏi:

```http
DELETE /api/questions/:id
```

Sinh đề:

```http
POST /api/generate-exam
```

Body:

```json
{
  "questionIds": ["Q1", "Q2", "Q3"]
}
```

Tải file đề vừa sinh:

```http
GET /download-exam
```

Đọc template:

```http
GET /api/template
```

Lưu template:

```http
POST /api/template
```

## Kiểm Tra Trước Khi Commit

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

Backend:

```bash
cd backend
node --check server.js
```

## Quy Trình Git

Lần đầu đã được thiết lập với remote:

```text
https://github.com/khoitrandang0312-art/To-n-Anh-Bo-.git
```

Sau mỗi lần thay đổi:

```bash
git status
git add .
git commit -m "Mô tả thay đổi"
git push
```

Ví dụ:

```bash
git add .
git commit -m "Cập nhật template đề THPT"
git push
```

## Các File Không Nên Commit

`.gitignore` hiện loại bỏ:

- `node_modules/`
- `dist/`
- `.env`
- log files
- file LaTeX tạm
- `backend/exam.tex`
- `backend/test_output.json`

Điều này giúp repo nhẹ hơn, sạch hơn và tránh đẩy file sinh tự động lên GitHub.

## Ghi Chú Khi Biên Dịch LaTeX

Template dùng `fontspec`, vì vậy nên biên dịch bằng XeLaTeX:

```bash
xelatex exam.tex
```

Nếu dùng Overleaf, hãy chọn compiler là XeLaTeX.

## Trạng Thái Hiện Tại

Ứng dụng hiện hỗ trợ template đề THPT 3 phần:

- Phần I: trắc nghiệm.
- Phần II: đúng sai.
- Phần III: trả lời ngắn.

Frontend đã hiển thị badge phần tương ứng trên từng câu hỏi và nhóm giỏ câu hỏi theo đúng cấu trúc đề trước khi sinh file LaTeX.
