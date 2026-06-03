export const API_BASE = 'http://localhost:3000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const error = new Error(data?.error || 'Có lỗi xảy ra.');
    error.data = data;
    throw error;
  }

  return data;
}

export function fetchQuestions() {
  return request('/api/questions');
}

export function fetchQuestionRaw(id) {
  return request(`/api/questions/${id}`);
}

export function saveQuestion({ id, rawContent }) {
  return request('/api/questions', {
    method: 'POST',
    body: JSON.stringify({ id, rawContent })
  });
}

export function validateQuestion(rawContent) {
  return request('/api/questions/validate', {
    method: 'POST',
    body: JSON.stringify({ rawContent })
  });
}

export function deleteQuestion(id) {
  return request(`/api/questions/${id}`, { method: 'DELETE' });
}

export function deleteQuestions(ids) {
  return request('/api/questions/delete-bulk', {
    method: 'POST',
    body: JSON.stringify({ ids })
  });
}

export function saveBulkQuestions(bulkContent) {
  return request('/api/questions/bulk', {
    method: 'POST',
    body: JSON.stringify({ bulkContent })
  });
}

export function generateExam({ questionIds, templateId }) {
  return request('/api/generate-exam', {
    method: 'POST',
    body: JSON.stringify({ questionIds, templateId })
  });
}

export function fetchTemplates() {
  return request('/api/templates');
}

export function fetchTemplateContent(templateId) {
  return request(`/api/templates/${templateId}`);
}

export function saveTemplateContent({ templateId, templateContent }) {
  return request(`/api/templates/${templateId}`, {
    method: 'POST',
    body: JSON.stringify({ templateContent })
  });
}

export function getDownloadExamUrl() {
  return `${API_BASE}/download-exam`;
}
