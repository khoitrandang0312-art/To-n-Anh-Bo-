const {
  QUESTION_TYPES,
  normalizeQuestionType,
  getTrueFalseStatements
} = require("../utils/questionTypes");

function renderSolution(data) {
  if (!data.solution) {
    return "";
  }

  return `\\begin{loigiai}\n${data.solution}\n\\end{loigiai}\n\n`;
}

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
    answers.forEach(answer => {
      tex += `  \\task ${answer}\n`;
    });
    tex += `\\end{tasks}\n\n`;
  }

  return tex + renderSolution(data);
}

function renderTrueFalse(data) {
  const statements = getTrueFalseStatements(data);
  let tex = `\\begin{dungsai}\n`;

  statements.forEach(statement => {
    tex += `\\item ${statement}\n`;
  });

  tex += `\\end{dungsai}\n\n`;
  return tex + renderSolution(data);
}

function renderEssay(data) {
  const space = data.space || "3cm";
  return `\\vspace{${space}}\n\n` + renderSolution(data);
}

function renderShortAnswer(data) {
  const answer = data.answer || "";
  return `\\shortanswerbox{${answer}}\n\n` + renderSolution(data);
}

function renderShortAnswer4(data) {
  const answers = data.short_answers || ["", "", "", ""];
  const a = answers[0] || "";
  const b = answers[1] || "";
  const c = answers[2] || "";
  const d = answers[3] || "";

  return `\\fourshortanswers{${a}}{${b}}{${c}}{${d}}\n\n` + renderSolution(data);
}

function renderMedia(data) {
  let tex = "";

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

  return tex;
}

function renderQuestion(parsed) {
  const data = parsed.data || {};
  const type = normalizeQuestionType(data);
  let tex = "";

  tex += `\\cau ${parsed.content.trim()}\n\n`;
  tex += renderMedia(data);

  switch (type) {
    case QUESTION_TYPES.MCQ:
      tex += renderMCQ(data);
      break;

    case QUESTION_TYPES.TRUE_FALSE:
    case QUESTION_TYPES.TRUE_FALSE_ALIAS:
      tex += renderTrueFalse(data);
      break;

    case QUESTION_TYPES.SHORT_ANSWER:
      tex += renderShortAnswer(data);
      break;

    case QUESTION_TYPES.SHORT_ANSWER_4:
      tex += renderShortAnswer4(data);
      break;

    case QUESTION_TYPES.ESSAY:
    default:
      if (data.answers) {
        tex += renderMCQ(data);
      } else {
        tex += renderEssay(data);
      }
      break;
  }

  return `${tex}\n`;
}

module.exports = {
  renderQuestion,
  renderMCQ,
  renderTrueFalse,
  renderShortAnswer,
  renderShortAnswer4,
  renderEssay
};
