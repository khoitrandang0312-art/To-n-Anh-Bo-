import {
  formatQuestionType,
  getQuestionPart,
  getQuestionType,
  getTrueFalseStatements
} from '../lib/questionTypes';
import {
  renderAnswer,
  renderBlockMath,
  renderTextWithMath
} from '../lib/mathRender';

function MetadataBadge({ children, className = '' }) {
  return (
    <span className={`rounded-md px-3 py-1 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}

function QuestionMeta({ question }) {
  const questionType = getQuestionType(question);
  const questionPart = getQuestionPart(question);
  const createdAt = question.createdAt ? new Date(question.createdAt) : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`rounded border px-2 py-1 text-xs font-bold uppercase ${questionPart.badgeClass}`}>
        {questionPart.label}
      </span>
      <MetadataBadge className="border border-slate-200 bg-slate-100 text-slate-700">
        {formatQuestionType(questionType)}
      </MetadataBadge>
      {question.topic && (
        <MetadataBadge className="bg-blue-100 text-blue-700">
          {question.topic}
        </MetadataBadge>
      )}
      {question.chapter && (
        <MetadataBadge className="bg-purple-100 text-purple-700">
          {question.chapter}
        </MetadataBadge>
      )}
      {question.theme && (
        <MetadataBadge className="bg-pink-100 text-pink-700">
          {question.theme}
        </MetadataBadge>
      )}
      {question.difficulty && (
        <MetadataBadge className="bg-amber-100 text-amber-700">
          {question.difficulty}
        </MetadataBadge>
      )}
      <span className="text-xs text-slate-400">ID: {question.id}</span>
      {createdAt && !Number.isNaN(createdAt.getTime()) && (
        <span className="rounded border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
          {createdAt.toLocaleDateString('vi-VN')} {createdAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
}

function TrueFalseAnswers({ question }) {
  const statements = getTrueFalseStatements(question);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {statements.map((statement, index) => (
        <div
          key={`${question.id}-statement-${index}`}
          className="flex items-start gap-3 rounded-lg border border-cyan-100 bg-cyan-50/70 p-3 text-slate-700"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-200 bg-white text-xs font-bold text-cyan-700">
            {String.fromCharCode(97 + index)}
          </span>
          <div className="overflow-x-auto overflow-y-hidden">
            {renderTextWithMath(statement)}
          </div>
        </div>
      ))}
    </div>
  );
}

function MultipleChoiceAnswers({ question }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {question.answers.map((answer, index) => (
        <div
          key={`${question.id}-answer-${index}`}
          className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-700 transition-colors hover:bg-slate-100"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-xs font-bold text-slate-600">
            {String.fromCharCode(65 + index)}
          </span>
          <div className="overflow-x-auto overflow-y-hidden">
            {renderAnswer(answer)}
          </div>
        </div>
      ))}
    </div>
  );
}

function ShortAnswers({ question }) {
  const shortAnswers = question.short_answers || [];

  if (shortAnswers.length > 0) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {shortAnswers.map((answer, index) => (
          <div
            key={`${question.id}-short-${index}`}
            className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-900"
          >
            <span className="mr-2 font-bold">{String.fromCharCode(97 + index)}.</span>
            {renderAnswer(answer)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-slate-500">
      <p className="mb-2 text-sm font-semibold">Câu hỏi trả lời ngắn / tự luận:</p>
      <input
        type="text"
        placeholder="Nhập đáp án của bạn..."
        className="w-full rounded-md border border-slate-300 p-2 outline-none focus:border-blue-500"
        disabled
      />
    </div>
  );
}

function QuestionAnswers({ question }) {
  const questionType = getQuestionType(question);
  const isTrueFalseQuestion = questionType === 'true_false' || questionType === 'dung_sai';

  if (isTrueFalseQuestion) {
    return <TrueFalseAnswers question={question} />;
  }

  if (Array.isArray(question.answers) && question.answers.length > 0) {
    return <MultipleChoiceAnswers question={question} />;
  }

  return <ShortAnswers question={question} />;
}

export default function QuestionCard({
  question,
  isSelected,
  onToggleCart,
  onEdit,
  onDelete
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
        <QuestionMeta question={question} />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(question.id)}
            className="rounded-lg border border-transparent px-3 py-1.5 text-sm font-bold text-purple-600 transition-all hover:border-purple-200 hover:bg-purple-50 hover:text-purple-800"
          >
            Sửa
          </button>
          <button
            type="button"
            onClick={() => onDelete(question.id)}
            className="rounded-lg border border-transparent px-3 py-1.5 text-sm font-bold text-red-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            Xóa
          </button>
          <button
            type="button"
            onClick={() => onToggleCart(question.id)}
            className={`rounded-lg border px-4 py-1.5 text-sm font-bold transition-all ${
              isSelected
                ? 'border-blue-200 bg-blue-100 text-blue-700'
                : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white'
            }`}
          >
            {isSelected ? 'Đã thêm' : 'Thêm vào đề'}
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 text-lg leading-relaxed text-slate-800">
        <div className="w-full">
          <div className="mb-4 leading-relaxed">{renderTextWithMath(question.content)}</div>

          {question.image && (
            <div className="mb-4 flex w-full justify-center">
              <img
                src={question.image}
                alt="Minh họa"
                className="max-w-full rounded-lg border border-slate-200 shadow-sm"
              />
            </div>
          )}

          {question.equation && (
            <div className="mb-6 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-blue-900">
              {renderBlockMath(question.equation, `equation-${question.id}`)}
            </div>
          )}
        </div>
      </div>

      <QuestionAnswers question={question} />
    </article>
  );
}
