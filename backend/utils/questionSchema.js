const matter = require("gray-matter");
const {
  VALID_QUESTION_TYPES,
  QUESTION_TYPES,
  normalizeQuestionType,
  getTrueFalseStatements
} = require("./questionTypes");

const REQUIRED_METADATA_FIELDS = ["topic", "chapter", "theme", "difficulty"];

function parseRawQuestion(rawContent) {
  try {
    return { parsed: matter(rawContent), errors: [] };
  } catch (error) {
    return { parsed: null, errors: [`YAML không hợp lệ: ${error.message}`] };
  }
}

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function validateQuestion(parsed) {
  const errors = [];
  const warnings = [];

  if (!parsed) {
    return { valid: false, errors: ["Không đọc được nội dung câu hỏi."], warnings };
  }

  const data = parsed.data || {};
  const content = (parsed.content || "").trim();
  const type = normalizeQuestionType(data);

  REQUIRED_METADATA_FIELDS.forEach(field => {
    if (isBlank(data[field])) {
      errors.push(`Thiếu metadata '${field}'.`);
    }
  });

  if (isBlank(data.type)) {
    errors.push("Thiếu metadata 'type'.");
  } else if (!VALID_QUESTION_TYPES.includes(type)) {
    errors.push(`type '${type}' chưa được hỗ trợ. Hợp lệ: ${VALID_QUESTION_TYPES.join(", ")}.`);
  }

  if (!content) {
    errors.push("Nội dung câu hỏi đang rỗng.");
  }

  if (type === QUESTION_TYPES.MCQ) {
    if (!Array.isArray(data.answers) || data.answers.length !== 4) {
      errors.push("Câu mcq cần trường 'answers' gồm đúng 4 phương án.");
    }
  }

  if (type === QUESTION_TYPES.TRUE_FALSE || type === QUESTION_TYPES.TRUE_FALSE_ALIAS) {
    const statements = getTrueFalseStatements(data);
    if (statements.length !== 4) {
      errors.push("Câu đúng/sai cần trường 'statements' gồm đúng 4 ý.");
    }
    if (!data.statements) {
      warnings.push("Nên dùng field chuẩn 'statements' cho câu đúng/sai.");
    }
  }

  if (type === QUESTION_TYPES.SHORT_ANSWER && isBlank(data.answer)) {
    warnings.push("Câu trả lời ngắn chưa có field 'answer'; đề vẫn sinh được nhưng đáp án sẽ trống.");
  }

  if (type === QUESTION_TYPES.SHORT_ANSWER_4) {
    if (!Array.isArray(data.short_answers) || data.short_answers.length !== 4) {
      errors.push("Câu short_answer_4 cần trường 'short_answers' gồm đúng 4 đáp án.");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    type
  };
}

function validateRawQuestion(rawContent) {
  const { parsed, errors } = parseRawQuestion(rawContent);
  if (errors.length > 0) {
    return { valid: false, parsed: null, errors, warnings: [] };
  }

  return { parsed, ...validateQuestion(parsed) };
}

module.exports = {
  parseRawQuestion,
  validateQuestion,
  validateRawQuestion
};
