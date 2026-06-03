import { formatQuestionType, getQuestionType } from '../lib/questionTypes';
import ModalShell from './ModalShell';

export default function CartModal({
  cartCount,
  selectedQuestionsByPart,
  onToggleCart,
  onGenerateExam,
  onClose
}) {
  return (
    <ModalShell
      title={`Gói câu hỏi đã chọn (${cartCount})`}
      tone="blue"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-600 hover:bg-slate-100"
          >
            Đóng
          </button>
          {cartCount > 0 && (
            <button
              type="button"
              onClick={onGenerateExam}
              className="rounded-lg bg-amber-500 px-6 py-2 font-bold text-white shadow-md transition-colors hover:bg-amber-600"
            >
              Tạo đề ngay
            </button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-3 bg-slate-50 p-4">
        {cartCount === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <p className="font-medium text-slate-500">Chưa có câu hỏi nào trong gói.</p>
            <p className="mt-1 text-sm text-slate-400">
              Hãy chọn câu hỏi từ danh sách bên ngoài.
            </p>
          </div>
        ) : (
          selectedQuestionsByPart.map((part) => (
            <section key={part.key} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={`rounded border px-2 py-1 text-xs font-bold uppercase ${part.badgeClass}`}>
                    {part.label}
                  </span>
                  <span className="text-sm font-bold text-slate-700">{part.name}</span>
                </div>
                <span className="text-xs font-semibold text-slate-500">{part.questions.length} câu</span>
              </div>

              <div className="flex flex-col gap-2 p-3">
                {part.questions.length === 0 ? (
                  <div className="px-2 py-3 text-xs text-slate-400">
                    Chưa có câu hỏi trong phần này.
                  </div>
                ) : (
                  part.questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-3 transition-shadow hover:shadow-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                            Câu {index + 1}
                          </span>
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                            {formatQuestionType(getQuestionType(question))}
                          </span>
                          <span className="text-sm font-bold text-slate-700">
                            {question.topic} - {question.chapter}
                          </span>
                        </div>
                        <div className="truncate text-xs italic text-slate-500">
                          {question.content}
                        </div>
                        <div className="mt-1 text-xs text-blue-500">ID: {question.id}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggleCart(question.id)}
                        className="whitespace-nowrap rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 shadow-sm transition-colors hover:bg-red-500 hover:text-white"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          ))
        )}
      </div>
    </ModalShell>
  );
}
