const QUESTION_TYPES = {
  MCQ: "mcq",
  TRUE_FALSE: "true_false",
  TRUE_FALSE_ALIAS: "dung_sai",
  SHORT_ANSWER: "short_answer",
  SHORT_ANSWER_4: "short_answer_4",
  ESSAY: "essay"
};

const QUESTION_TYPE_LABELS = {
  [QUESTION_TYPES.MCQ]: "Trắc nghiệm",
  [QUESTION_TYPES.TRUE_FALSE]: "Đúng/Sai",
  [QUESTION_TYPES.TRUE_FALSE_ALIAS]: "Đúng/Sai",
  [QUESTION_TYPES.SHORT_ANSWER]: "Trả lời ngắn",
  [QUESTION_TYPES.SHORT_ANSWER_4]: "Trả lời ngắn 4 ý",
  [QUESTION_TYPES.ESSAY]: "Tự luận"
};

const VALID_QUESTION_TYPES = Object.values(QUESTION_TYPES);

function normalizeQuestionType(data = {}) {
  if (data.type) {
    return String(data.type).trim();
  }

  if (data.statements || data.items || data.assertions) {
    return QUESTION_TYPES.TRUE_FALSE;
  }

  if (data.answers) {
    return QUESTION_TYPES.MCQ;
  }

  if (data.short_answers) {
    return QUESTION_TYPES.SHORT_ANSWER_4;
  }

  return QUESTION_TYPES.ESSAY;
}

function getExamPartKey(data = {}) {
  const type = normalizeQuestionType(data);

  if (type === QUESTION_TYPES.MCQ) {
    return "part1";
  }

  if (type === QUESTION_TYPES.TRUE_FALSE || type === QUESTION_TYPES.TRUE_FALSE_ALIAS) {
    return "part2";
  }

  return "part3";
}

function getTrueFalseStatements(data = {}) {
  const statements = data.statements || data.items || data.assertions || data.answers || [];

  if (!Array.isArray(statements)) {
    return [];
  }

  return statements
    .map(item => {
      if (typeof item === "string") return item;
      return item.text || item.statement || item.content || item.label || "";
    })
    .filter(Boolean);
}

module.exports = {
  QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
  VALID_QUESTION_TYPES,
  normalizeQuestionType,
  getExamPartKey,
  getTrueFalseStatements
};
