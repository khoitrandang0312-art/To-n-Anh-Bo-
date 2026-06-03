const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const dataDir = path.join(__dirname, 'data');

// API lấy danh sách câu hỏi
app.get('/api/questions', (req, res) => {
  try {
    const files = fs.readdirSync(dataDir);
    const questions = files.filter(f => f.endsWith('.md')).reduce((acc, file) => {
      try {
        const filePath = path.join(dataDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const stat = fs.statSync(filePath);
        
        // gray-matter sẽ bóc tách YAML
        const parsed = matter(fileContent);
        
        acc.push({
          id: file.replace('.md', ''),
          ...parsed.data, 
          content: parsed.content.trim(),
          createdAt: stat.birthtimeMs || stat.mtimeMs
        });
      } catch (err) {
        console.error(`Bỏ qua file bị lỗi định dạng: ${file}`, err.message);
      }
      return acc;
    }, []);
    
    // Sắp xếp câu hỏi mới nhất lên đầu
    questions.sort((a, b) => b.createdAt - a.createdAt);
    
    res.json(questions);
  } catch (error) {
    console.error("Lỗi khi đọc file:", error);
    res.status(500).json({ error: 'Lỗi server khi đọc dữ liệu câu hỏi' });
  }
});

// API thêm câu hỏi mới (Lưu file)
app.post('/api/questions', (req, res) => {
  try {
    const { id, rawContent } = req.body;
    if (!id || !rawContent) {
      return res.status(400).json({ error: 'Thiếu ID hoặc nội dung' });
    }
    const filePath = path.join(dataDir, `${id}.md`);
    fs.writeFileSync(filePath, rawContent, 'utf-8');
    res.json({ success: true, message: 'Đã lưu câu hỏi thành công!' });
  } catch (error) {
    console.error("Lỗi khi lưu file:", error);
    res.status(500).json({ error: 'Lỗi server khi lưu câu hỏi' });
  }
});

// API Xóa câu hỏi
app.delete('/api/questions/:id', (req, res) => {
  try {
    const id = req.params.id;
    const filePath = path.join(dataDir, `${id}.md`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'Đã xóa câu hỏi thành công!' });
    } else {
      res.status(404).json({ error: 'Không tìm thấy câu hỏi để xóa' });
    }
  } catch (error) {
    console.error("Lỗi khi xóa file:", error);
    res.status(500).json({ error: 'Lỗi server khi xóa câu hỏi' });
  }
});

// API Nhập Hàng Loạt (Bulk Import)
app.post('/api/questions/bulk', (req, res) => {
  try {
    const { bulkContent } = req.body;
    if (!bulkContent) {
      return res.status(400).json({ error: 'Thiếu nội dung Bulk' });
    }
    
    // Tách các câu hỏi bằng delimiter
    const rawQuestions = bulkContent.split('---END_QUESTION---');
    let importedCount = 0;
    const timestamp = Date.now();

    rawQuestions.forEach((rawQ, index) => {
      const qText = rawQ.trim();
      if (qText.length > 10) { // Đảm bảo không phải là chuỗi rỗng hoặc quá ngắn
        const id = `BULK_${timestamp}_${index + 1}`;
        const filePath = path.join(dataDir, `${id}.md`);
        fs.writeFileSync(filePath, qText, 'utf-8');
        importedCount++;
      }
    });

    res.json({ success: true, message: `Đã nhập thành công ${importedCount} câu hỏi!` });
  } catch (error) {
    console.error("Lỗi khi nhập hàng loạt:", error);
    res.status(500).json({ error: 'Lỗi server khi nhập hàng loạt' });
  }
});

// API Lấy nội dung RAW của 1 câu hỏi để Sửa
app.get('/api/questions/:id', (req, res) => {
  try {
    const id = req.params.id;
    const filePath = path.join(dataDir, `${id}.md`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      res.json({ success: true, content });
    } else {
      res.status(404).json({ error: 'Không tìm thấy câu hỏi' });
    }
  } catch (error) {
    console.error("Lỗi khi lấy file:", error);
    res.status(500).json({ error: 'Lỗi server khi lấy câu hỏi' });
  }
});

function renderMCQ(data) {
  const answers = data.answers || [];
  const layout = parseInt(data.layout || 4, 10);

  let tex = "";

  if (answers.length === 4) {
    const command = layout === 1 ? "motcot" : layout === 2 ? "haipa" : "bonpa";
    tex += `\\${command}\n`;
    tex += `{${answers[0]}}\n`;
    tex += `{${answers[1]}}\n`;
    tex += `{${answers[2]}}\n`;
    tex += `{${answers[3]}}\n\n`;
  } else {
    tex += `\\begin{tasks}(${layout})\n`;

    answers.forEach(ans => {
      tex += `  \\task ${ans}\n`;
    });

    tex += `\\end{tasks}\n\n`;
  }

  if (data.solution) {
    tex += `\\begin{loigiai}\n${data.solution}\n\\end{loigiai}\n\n`;
  }

  return tex;
}

function getTrueFalseStatements(data) {
  const statements = data.statements || data.items || data.assertions || data.answers || [];

  if (!Array.isArray(statements)) {
    return [];
  }

  return statements
    .map(item => {
      if (typeof item === 'string') return item;
      return item.text || item.statement || item.content || item.label || "";
    })
    .filter(Boolean);
}

function renderTrueFalse(data) {
  const statements = getTrueFalseStatements(data);
  let tex = `\\begin{dungsai}\n`;

  statements.forEach(statement => {
    tex += `\\item ${statement}\n`;
  });

  tex += `\\end{dungsai}\n\n`;

  if (data.solution) {
    tex += `\\begin{loigiai}\n${data.solution}\n\\end{loigiai}\n\n`;
  }

  return tex;
}

function renderEssay(data) {
  const space = data.space || "3cm";

  let tex = `\\vspace{${space}}\n\n`;

  if (data.solution) {
    tex += `\\begin{loigiai}\n${data.solution}\n\\end{loigiai}\n\n`;
  }

  return tex;
}

function renderShortAnswer(data) {
  const answer = data.answer || "";

  let tex = `\\shortanswerbox{${answer}}\n\n`;

  if (data.solution) {
    tex += `\\begin{loigiai}\n${data.solution}\n\\end{loigiai}\n\n`;
  }

  return tex;
}

function renderShortAnswer4(data) {
  const answers = data.short_answers || ["", "", "", ""];

  const a = answers[0] || "";
  const b = answers[1] || "";
  const c = answers[2] || "";
  const d = answers[3] || "";

  let tex = `\\fourshortanswers{${a}}{${b}}{${c}}{${d}}\n\n`;

  if (data.solution) {
    tex += `\\begin{loigiai}\n${data.solution}\n\\end{loigiai}\n\n`;
  }

  return tex;
}

function normalizeQuestionType(data) {
  if (data.type) {
    return String(data.type).trim();
  }

  if (data.statements || data.items || data.assertions) {
    return "true_false";
  }

  if (data.answers) {
    return "mcq";
  }

  if (data.short_answers) {
    return "short_answer_4";
  }

  return "essay";
}

function getExamPartKey(data) {
  const type = normalizeQuestionType(data);

  if (type === "mcq") {
    return "part1";
  }

  if (type === "true_false" || type === "dung_sai") {
    return "part2";
  }

  return "part3";
}

function renderQuestion(parsed, index) {
  const data = parsed.data || {};
  const type = normalizeQuestionType(data);
  let tex = "";

  tex += `\\cau ${parsed.content.trim()}\n\n`;

  if (data.image) {
    const imageWidth = data.image_width || "0.5\\textwidth";

    tex += `\\begin{center}\n`;
    tex += `\\includegraphics[width=${imageWidth}]{${data.image}}\n`;
    tex += `\\end{center}\n\n`;
  }

  if (data.equation) {
    tex += `\\[\n${data.equation}\n\\]\n\n`;
  }

  if (data.tikz) {
    tex += `\\begin{center}\n`;
    tex += `${data.tikz}\n`;
    tex += `\\end{center}\n\n`;
  }

  switch (type) {
    case "mcq":
      tex += renderMCQ(data);
      break;

    case "true_false":
    case "dung_sai":
      tex += renderTrueFalse(data);
      break;

    case "essay":
      tex += renderEssay(data);
      break;

    case "short_answer":
      tex += renderShortAnswer(data);
      break;

    case "short_answer_4":
      tex += renderShortAnswer4(data);
      break;

    default:
      if (data.answers) {
        tex += renderMCQ(data);
      } else {
        tex += renderEssay(data);
      }
  }

  tex += "\n";
  return tex;
}

// API Sinh đề thi (Ghép LaTeX)
app.post('/api/generate-exam', (req, res) => {
  try {
    const { questionIds } = req.body;
    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ error: 'Danh sách câu hỏi trống' });
    }

    const examSections = {
      part1: "",
      part2: "",
      part3: ""
    };
    const sectionCounts = {
      part1: 0,
      part2: 0,
      part3: 0
    };
    
    questionIds.forEach((id, index) => {
      const filePath = path.join(dataDir, `${id}.md`);
      if (fs.existsSync(filePath)) {
        try {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const parsed = matter(fileContent);
          const partKey = getExamPartKey(parsed.data || {});
          
          examSections[partKey] += renderQuestion(parsed, index);
          sectionCounts[partKey]++;
        } catch (err) {
          console.error(`Bỏ qua câu hỏi bị lỗi định dạng khi sinh đề: ${id}`, err.message);
        }
      }
    });

    const templatePath = path.join(__dirname, 'template.tex');
    let template = fs.readFileSync(templatePath, 'utf-8');
    
    let finalTex = template
      .replace('% --- PHAN_I_CAU_HOI ---', examSections.part1)
      .replace('% --- PHAN_II_CAU_HOI ---', examSections.part2)
      .replace('% --- PHAN_III_CAU_HOI ---', examSections.part3);

    if (finalTex === template && template.includes('% --- NOI_DUNG_CAU_HOI ---')) {
      const legacyContent = [
        examSections.part1,
        examSections.part2,
        examSections.part3
      ].join('\n');
      finalTex = template.replace('% --- NOI_DUNG_CAU_HOI ---', legacyContent);
    }
    
    // Lưu file tex ra ổ cứng để frontend có thể download
    fs.writeFileSync(path.join(__dirname, 'exam.tex'), finalTex, 'utf-8');

    res.json({ success: true, texData: finalTex, sectionCounts });

  } catch (error) {
    console.error("Lỗi khi sinh đề:", error);
    res.status(500).json({ error: 'Lỗi server khi sinh đề thi' });
  }
});

// API Lấy nội dung Template
app.get('/api/template', (req, res) => {
  try {
    const templatePath = path.join(__dirname, 'template.tex');
    if (fs.existsSync(templatePath)) {
      const template = fs.readFileSync(templatePath, 'utf-8');
      res.json({ success: true, template });
    } else {
      res.status(404).json({ error: 'Không tìm thấy template' });
    }
  } catch (error) {
    console.error("Lỗi khi đọc template:", error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// API Lưu nội dung Template
app.post('/api/template', (req, res) => {
  try {
    const { templateContent } = req.body;
    if (!templateContent) {
      return res.status(400).json({ error: 'Nội dung template rỗng' });
    }
    const templatePath = path.join(__dirname, 'template.tex');
    fs.writeFileSync(templatePath, templateContent, 'utf-8');
    res.json({ success: true, message: 'Đã lưu template thành công!' });
  } catch (error) {
    console.error("Lỗi khi lưu template:", error);
    res.status(500).json({ error: 'Lỗi server khi lưu template' });
  }
});

// API Download file đề thi
app.get('/download-exam', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'exam.tex');
    if (fs.existsSync(filePath)) {
      // Thiết lập header để trình duyệt hiểu là file tải xuống
      res.setHeader('Content-Disposition', 'attachment; filename="de_thi.tex"');
      // Thêm tùy chọn dotfiles: 'allow' vì đường dẫn hệ thống chứa thư mục ẩn (.gemini)
      res.sendFile(filePath, { dotfiles: 'allow' }, (err) => {
        if (err) {
          console.error("Lỗi khi gửi file tải xuống:", err);
          if (!res.headersSent) {
            res.status(500).send("Lỗi server khi tải file.");
          }
        }
      });
    } else {
      res.status(404).send('Không tìm thấy file đề thi. Vui lòng tạo đề trước.');
    }
  } catch (error) {
    console.error("Lỗi khi tải file:", error);
    res.status(500).send('Lỗi server');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend server đang chạy tại http://localhost:${PORT}`);
});
