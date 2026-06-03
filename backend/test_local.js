const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const dataDir = path.join(__dirname, 'data');

function renderMCQ(data) {
  const answers = data.answers || [];
  const layout = data.layout || 4;
  let tex = `\\begin{choicesABCD}[${layout}]\n`;
  answers.forEach(ans => {
    tex += `  \\task ${ans}\n`;
  });
  tex += `\\end{choicesABCD}\n\n`;
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

function renderQuestion(parsed, index) {
  const data = parsed.data || {};
  let tex = "";
  tex += `\\question ${parsed.content.trim()}\n\n`;
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
  switch (data.type) {
    case "mcq":
      tex += renderMCQ(data);
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

const qIds = ['Q1', 'Q2', 'Q3'];
let examContent = "";
qIds.forEach((id, index) => {
  const filePath = path.join(dataDir, `${id}.md`);
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const parsed = matter(fileContent);
    examContent += renderQuestion(parsed, index);
  }
});

const templatePath = path.join(__dirname, 'template.tex');
let template = fs.readFileSync(templatePath, 'utf-8');
const finalTex = template.replace('% --- NOI_DUNG_CAU_HOI ---', examContent);

console.log(finalTex.substring(finalTex.indexOf('\\begin{questions}')));
