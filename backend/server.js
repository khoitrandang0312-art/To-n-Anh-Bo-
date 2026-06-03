const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const {
  listQuestions,
  getQuestionRaw,
  saveQuestion,
  deleteQuestion,
  bulkImportQuestions,
  ensureDataDir
} = require("./services/questionStore");
const {
  listTemplates,
  getDefaultTemplateId,
  getTemplateContent,
  saveTemplateContent
} = require("./services/templateStore");
const { generateExam } = require("./services/examGenerator");
const { validateRawQuestion } = require("./utils/questionSchema");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const dataDir = path.join(__dirname, "data");
const templatesDir = path.join(__dirname, "templates");
const examOutputPath = path.join(__dirname, "exam.tex");

ensureDataDir(dataDir);

function sendServiceResult(res, result) {
  if (!result.success) {
    return res.status(result.status || 500).json(result);
  }

  return res.json(result);
}

app.get("/api/questions", (req, res) => {
  try {
    res.json(listQuestions(dataDir));
  } catch (error) {
    console.error("Lỗi khi đọc câu hỏi:", error);
    res.status(500).json({ error: "Lỗi server khi đọc dữ liệu câu hỏi." });
  }
});

app.post("/api/questions/validate", (req, res) => {
  try {
    const { rawContent } = req.body;
    if (!rawContent) {
      return res.status(400).json({
        success: false,
        error: "Thiếu nội dung YAML.",
        errors: ["Thiếu nội dung YAML."]
      });
    }

    const validation = validateRawQuestion(rawContent);
    res.status(validation.valid ? 200 : 400).json({
      success: validation.valid,
      valid: validation.valid,
      type: validation.type,
      errors: validation.errors || [],
      warnings: validation.warnings || []
    });
  } catch (error) {
    console.error("Lỗi khi validate câu hỏi:", error);
    res.status(500).json({ error: "Lỗi server khi validate câu hỏi." });
  }
});

app.post("/api/questions", (req, res) => {
  try {
    const { id, rawContent } = req.body;
    if (!rawContent) {
      return res.status(400).json({
        success: false,
        error: "Thiếu nội dung.",
        errors: ["Thiếu nội dung."]
      });
    }

    return sendServiceResult(res, saveQuestion(dataDir, id, rawContent));
  } catch (error) {
    console.error("Lỗi khi lưu câu hỏi:", error);
    res.status(500).json({ success: false, error: error.message || "Lỗi server khi lưu câu hỏi." });
  }
});

app.delete("/api/questions/:id", (req, res) => {
  try {
    return sendServiceResult(res, deleteQuestion(dataDir, req.params.id));
  } catch (error) {
    console.error("Lỗi khi xóa câu hỏi:", error);
    res.status(500).json({ success: false, error: error.message || "Lỗi server khi xóa câu hỏi." });
  }
});

app.post("/api/questions/bulk", (req, res) => {
  try {
    const { bulkContent } = req.body;
    return sendServiceResult(res, bulkImportQuestions(dataDir, bulkContent));
  } catch (error) {
    console.error("Lỗi khi nhập hàng loạt:", error);
    res.status(500).json({ success: false, error: error.message || "Lỗi server khi nhập hàng loạt." });
  }
});

app.get("/api/questions/:id", (req, res) => {
  try {
    const content = getQuestionRaw(dataDir, req.params.id);
    if (!content) {
      return res.status(404).json({ success: false, error: "Không tìm thấy câu hỏi." });
    }

    return res.json({ success: true, content });
  } catch (error) {
    console.error("Lỗi khi lấy câu hỏi:", error);
    res.status(500).json({ success: false, error: error.message || "Lỗi server khi lấy câu hỏi." });
  }
});

app.get("/api/templates", (req, res) => {
  try {
    res.json({
      success: true,
      defaultTemplateId: getDefaultTemplateId(templatesDir),
      templates: listTemplates(templatesDir)
    });
  } catch (error) {
    console.error("Lỗi khi đọc danh sách template:", error);
    res.status(500).json({ success: false, error: "Lỗi server khi đọc danh sách template." });
  }
});

app.get("/api/templates/:id", (req, res) => {
  try {
    const template = getTemplateContent(templatesDir, req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: "Không tìm thấy template." });
    }

    return res.json({ success: true, template });
  } catch (error) {
    console.error("Lỗi khi đọc template:", error);
    res.status(500).json({ success: false, error: error.message || "Lỗi server khi đọc template." });
  }
});

app.post("/api/templates/:id", (req, res) => {
  try {
    const { templateContent } = req.body;
    if (!templateContent) {
      return res.status(400).json({ success: false, error: "Nội dung template rỗng." });
    }

    return sendServiceResult(res, saveTemplateContent(templatesDir, req.params.id, templateContent));
  } catch (error) {
    console.error("Lỗi khi lưu template:", error);
    res.status(500).json({ success: false, error: error.message || "Lỗi server khi lưu template." });
  }
});

app.get("/api/template", (req, res) => {
  try {
    const templateId = req.query.templateId || getDefaultTemplateId(templatesDir);
    const template = getTemplateContent(templatesDir, templateId);
    if (!template) {
      return res.status(404).json({ success: false, error: "Không tìm thấy template." });
    }

    return res.json({ success: true, template, templateId });
  } catch (error) {
    console.error("Lỗi khi đọc template:", error);
    res.status(500).json({ success: false, error: error.message || "Lỗi server khi đọc template." });
  }
});

app.post("/api/template", (req, res) => {
  try {
    const { templateContent, templateId } = req.body;
    if (!templateContent) {
      return res.status(400).json({ success: false, error: "Nội dung template rỗng." });
    }

    return sendServiceResult(
      res,
      saveTemplateContent(templatesDir, templateId || getDefaultTemplateId(templatesDir), templateContent)
    );
  } catch (error) {
    console.error("Lỗi khi lưu template:", error);
    res.status(500).json({ success: false, error: error.message || "Lỗi server khi lưu template." });
  }
});

app.post("/api/generate-exam", (req, res) => {
  try {
    const { questionIds, templateId } = req.body;
    return sendServiceResult(
      res,
      generateExam({
        dataDir,
        templatesDir,
        outputPath: examOutputPath,
        questionIds,
        templateId
      })
    );
  } catch (error) {
    console.error("Lỗi khi sinh đề:", error);
    res.status(500).json({ success: false, error: error.message || "Lỗi server khi sinh đề thi." });
  }
});

app.get("/download-exam", (req, res) => {
  try {
    if (!fs.existsSync(examOutputPath)) {
      return res.status(404).send("Không tìm thấy file đề thi. Vui lòng tạo đề trước.");
    }

    res.setHeader("Content-Disposition", 'attachment; filename="de_thi.tex"');
    return res.sendFile(examOutputPath, { dotfiles: "allow" });
  } catch (error) {
    console.error("Lỗi khi tải file:", error);
    return res.status(500).send("Lỗi server");
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend server đang chạy tại http://localhost:${PORT}`);
});
