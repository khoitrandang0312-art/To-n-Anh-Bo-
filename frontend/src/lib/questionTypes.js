export const questionTypeLabels = {
  mcq: 'Trắc nghiệm',
  true_false: 'Đúng/Sai',
  dung_sai: 'Đúng/Sai',
  short_answer: 'Trả lời ngắn',
  short_answer_4: 'Trả lời ngắn 4 ý',
  essay: 'Tự luận'
};

export const defaultQuestionTypes = [
  'mcq',
  'true_false',
  'dung_sai',
  'short_answer',
  'short_answer_4',
  'essay'
];

export const examParts = [
  {
    key: 'part1',
    label: 'Phần I',
    name: 'Trắc nghiệm',
    rule: 'type: mcq',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  {
    key: 'part2',
    label: 'Phần II',
    name: 'Đúng/Sai',
    rule: 'type: true_false, dung_sai',
    badgeClass: 'bg-cyan-100 text-cyan-700 border-cyan-200'
  },
  {
    key: 'part3',
    label: 'Phần III',
    name: 'Trả lời ngắn',
    rule: 'type: short_answer, short_answer_4',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  }
];

export function getQuestionType(question = {}) {
  if (question.type) return question.type;
  if (question.statements || question.items || question.assertions) return 'true_false';
  if (question.answers?.length) return 'mcq';
  return 'essay';
}

export function formatQuestionType(type) {
  return questionTypeLabels[type] || type;
}

export function getQuestionPartKey(question = {}) {
  const type = getQuestionType(question);
  if (type === 'mcq') return 'part1';
  if (type === 'true_false' || type === 'dung_sai') return 'part2';
  return 'part3';
}

export function getQuestionPart(question = {}) {
  return examParts.find(part => part.key === getQuestionPartKey(question)) || examParts[2];
}

export function getTrueFalseStatements(question = {}) {
  const statements = question.statements || question.items || question.assertions || question.answers || [];
  if (!Array.isArray(statements)) return [];

  return statements
    .map(item => {
      if (typeof item === 'string') return item;
      return item.text || item.statement || item.content || item.label || '';
    })
    .filter(Boolean);
}
