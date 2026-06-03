const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { validateRawQuestion } = require("../utils/questionSchema");

const QUESTION_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

function ensureDataDir(dataDir) {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function assertQuestionId(id) {
  if (!id || !QUESTION_ID_PATTERN.test(id)) {
    throw new Error("ID câu hỏi chỉ được gồm chữ, số, dấu gạch dưới hoặc gạch ngang.");
  }
}

function formatQuestionIdTimestamp(date = new Date()) {
  const pad = value => String(value).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());

  return `Q_${year}${month}${day}_${hour}${minute}${second}`;
}

function createQuestionId(dataDir) {
  const baseId = formatQuestionIdTimestamp();
  let candidateId = baseId;
  let suffix = 2;

  while (fs.existsSync(path.join(dataDir, `${candidateId}.md`))) {
    candidateId = `${baseId}_${suffix}`;
    suffix += 1;
  }

  return candidateId;
}

function resolveQuestionId(dataDir, id) {
  const trimmedId = id ? String(id).trim() : "";

  if (!trimmedId) {
    return createQuestionId(dataDir);
  }

  assertQuestionId(trimmedId);
  return trimmedId;
}

function getQuestionFilePath(dataDir, id) {
  assertQuestionId(id);
  return path.join(dataDir, `${id}.md`);
}

function listQuestions(dataDir) {
  ensureDataDir(dataDir);

  const files = fs.readdirSync(dataDir);
  const questions = files
    .filter(file => file.endsWith(".md"))
    .reduce((acc, file) => {
      try {
        const filePath = path.join(dataDir, file);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const stat = fs.statSync(filePath);
        const parsed = matter(fileContent);

        acc.push({
          id: file.replace(".md", ""),
          ...parsed.data,
          content: parsed.content.trim(),
          createdAt: stat.mtimeMs || stat.birthtimeMs,
          updatedAt: stat.mtimeMs || stat.birthtimeMs
        });
      } catch (error) {
        console.error(`Bỏ qua file câu hỏi lỗi định dạng: ${file}`, error.message);
      }

      return acc;
    }, []);

  questions.sort((a, b) => b.updatedAt - a.updatedAt);
  return questions;
}

function getQuestionRaw(dataDir, id) {
  ensureDataDir(dataDir);
  const filePath = getQuestionFilePath(dataDir, id);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  return fs.readFileSync(filePath, "utf-8");
}

function saveQuestion(dataDir, id, rawContent) {
  ensureDataDir(dataDir);

  if (!rawContent || !rawContent.trim()) {
    return {
      success: false,
      status: 400,
      error: "Nội dung câu hỏi rỗng.",
      errors: ["Nội dung câu hỏi rỗng."]
    };
  }

  let targetId;
  try {
    targetId = resolveQuestionId(dataDir, id);
  } catch (error) {
    return {
      success: false,
      status: 400,
      error: error.message,
      errors: [error.message]
    };
  }

  const validation = validateRawQuestion(rawContent);
  if (!validation.valid) {
    return {
      success: false,
      status: 400,
      error: "Câu hỏi chưa đúng schema.",
      errors: validation.errors,
      warnings: validation.warnings || []
    };
  }

  const filePath = getQuestionFilePath(dataDir, targetId);
  fs.writeFileSync(filePath, rawContent, "utf-8");

  return {
    success: true,
    id: targetId,
    message: "Đã lưu câu hỏi thành công!",
    warnings: validation.warnings || []
  };
}

function deleteQuestion(dataDir, id) {
  ensureDataDir(dataDir);
  const filePath = getQuestionFilePath(dataDir, id);

  if (!fs.existsSync(filePath)) {
    return { success: false, status: 404, error: "Không tìm thấy câu hỏi để xóa." };
  }

  fs.unlinkSync(filePath);
  return { success: true, message: "Đã xóa câu hỏi thành công!" };
}

function bulkImportQuestions(dataDir, bulkContent) {
  ensureDataDir(dataDir);

  if (!bulkContent || !bulkContent.trim()) {
    return {
      success: false,
      status: 400,
      error: "Thiếu nội dung bulk."
    };
  }

  const rawQuestions = bulkContent.split("---END_QUESTION---");
  const timestamp = Date.now();
  const skipped = [];
  let importedCount = 0;

  rawQuestions.forEach((rawQuestion, index) => {
    const rawContent = rawQuestion.trim();
    if (rawContent.length <= 10) {
      return;
    }

    const validation = validateRawQuestion(rawContent);
    if (!validation.valid) {
      skipped.push({
        index: index + 1,
        errors: validation.errors
      });
      return;
    }

    const id = `BULK_${timestamp}_${index + 1}`;
    const filePath = getQuestionFilePath(dataDir, id);
    fs.writeFileSync(filePath, rawContent, "utf-8");
    importedCount++;
  });

  return {
    success: true,
    importedCount,
    skipped,
    message: `Đã nhập thành công ${importedCount} câu hỏi${skipped.length ? `, bỏ qua ${skipped.length} câu lỗi schema` : ""}.`
  };
}

module.exports = {
  listQuestions,
  getQuestionRaw,
  saveQuestion,
  deleteQuestion,
  bulkImportQuestions,
  createQuestionId,
  getQuestionFilePath,
  ensureDataDir
};
