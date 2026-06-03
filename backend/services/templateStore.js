const fs = require("fs");
const path = require("path");

const REQUIRED_PLACEHOLDERS = [
  "% --- PHAN_I_CAU_HOI ---",
  "% --- PHAN_II_CAU_HOI ---",
  "% --- PHAN_III_CAU_HOI ---"
];

function readCatalog(templatesDir) {
  const catalogPath = path.join(templatesDir, "catalog.json");
  const rawCatalog = fs.readFileSync(catalogPath, "utf-8");
  return JSON.parse(rawCatalog);
}

function listTemplates(templatesDir) {
  return readCatalog(templatesDir).map(template => ({
    id: template.id,
    name: template.name,
    description: template.description,
    default: Boolean(template.default)
  }));
}

function getDefaultTemplateId(templatesDir) {
  const catalog = readCatalog(templatesDir);
  const defaultTemplate = catalog.find(template => template.default) || catalog[0];
  return defaultTemplate.id;
}

function getTemplateConfig(templatesDir, templateId) {
  const catalog = readCatalog(templatesDir);
  const targetId = templateId || getDefaultTemplateId(templatesDir);
  const template = catalog.find(item => item.id === targetId);

  if (!template) {
    return null;
  }

  return template;
}

function getTemplatePath(templatesDir, templateId) {
  const template = getTemplateConfig(templatesDir, templateId);
  if (!template) {
    return null;
  }

  const resolvedPath = path.resolve(templatesDir, template.file);
  const backendRoot = path.resolve(templatesDir, "..");

  if (!resolvedPath.startsWith(backendRoot)) {
    throw new Error("Đường dẫn template không hợp lệ.");
  }

  return resolvedPath;
}

function getTemplateContent(templatesDir, templateId) {
  const templatePath = getTemplatePath(templatesDir, templateId);
  if (!templatePath || !fs.existsSync(templatePath)) {
    return null;
  }

  return fs.readFileSync(templatePath, "utf-8");
}

function validateTemplateContent(content) {
  const missing = REQUIRED_PLACEHOLDERS.filter(placeholder => !content.includes(placeholder));
  return {
    valid: missing.length === 0,
    errors: missing.map(placeholder => `Template thiếu placeholder ${placeholder}.`)
  };
}

function saveTemplateContent(templatesDir, templateId, content) {
  const templatePath = getTemplatePath(templatesDir, templateId);
  if (!templatePath) {
    return { success: false, status: 404, error: "Không tìm thấy template." };
  }

  const validation = validateTemplateContent(content);
  if (!validation.valid) {
    return {
      success: false,
      status: 400,
      error: "Template chưa hợp lệ.",
      errors: validation.errors
    };
  }

  fs.writeFileSync(templatePath, content, "utf-8");
  return { success: true, message: "Đã lưu template thành công!" };
}

module.exports = {
  REQUIRED_PLACEHOLDERS,
  listTemplates,
  getDefaultTemplateId,
  getTemplateConfig,
  getTemplateContent,
  getTemplatePath,
  saveTemplateContent,
  validateTemplateContent
};
