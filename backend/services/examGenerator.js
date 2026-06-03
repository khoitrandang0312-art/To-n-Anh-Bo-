const fs = require("fs");
const matter = require("gray-matter");
const { getQuestionRaw } = require("./questionStore");
const { renderQuestion } = require("./latexRenderer");
const { getExamPartKey } = require("../utils/questionTypes");
const { getTemplateContent, getDefaultTemplateId } = require("./templateStore");

function createEmptyExamSections() {
  return {
    part1: "",
    part2: "",
    part3: ""
  };
}

function createEmptySectionCounts() {
  return {
    part1: 0,
    part2: 0,
    part3: 0
  };
}

function injectSections(template, examSections) {
  let finalTex = template
    .replace("% --- PHAN_I_CAU_HOI ---", examSections.part1)
    .replace("% --- PHAN_II_CAU_HOI ---", examSections.part2)
    .replace("% --- PHAN_III_CAU_HOI ---", examSections.part3);

  if (finalTex === template && template.includes("% --- NOI_DUNG_CAU_HOI ---")) {
    const legacyContent = [
      examSections.part1,
      examSections.part2,
      examSections.part3
    ].join("\n");
    finalTex = template.replace("% --- NOI_DUNG_CAU_HOI ---", legacyContent);
  }

  return finalTex;
}

function generateExam({ dataDir, templatesDir, outputPath, questionIds, templateId }) {
  if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
    return {
      success: false,
      status: 400,
      error: "Danh sách câu hỏi trống."
    };
  }

  const selectedTemplateId = templateId || getDefaultTemplateId(templatesDir);
  const template = getTemplateContent(templatesDir, selectedTemplateId);
  if (!template) {
    return {
      success: false,
      status: 404,
      error: "Không tìm thấy template."
    };
  }

  const examSections = createEmptyExamSections();
  const sectionCounts = createEmptySectionCounts();
  const skipped = [];

  questionIds.forEach(id => {
    const rawQuestion = getQuestionRaw(dataDir, id);
    if (!rawQuestion) {
      skipped.push({ id, error: "Không tìm thấy file câu hỏi." });
      return;
    }

    try {
      const parsed = matter(rawQuestion);
      const partKey = getExamPartKey(parsed.data || {});
      examSections[partKey] += renderQuestion(parsed);
      sectionCounts[partKey]++;
    } catch (error) {
      skipped.push({ id, error: error.message });
    }
  });

  const finalTex = injectSections(template, examSections);
  fs.writeFileSync(outputPath, finalTex, "utf-8");

  return {
    success: true,
    texData: finalTex,
    sectionCounts,
    skipped,
    templateId: selectedTemplateId
  };
}

module.exports = {
  generateExam,
  injectSections
};
