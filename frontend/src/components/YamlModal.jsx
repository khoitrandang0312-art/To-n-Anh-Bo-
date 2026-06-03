import ModalShell from './ModalShell';

function MessageList({ title, items, tone }) {
  if (!items.length) return null;

  const toneClasses = {
    red: 'border-red-200 bg-red-50 text-red-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-800',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800'
  };

  return (
    <div className={`rounded-lg border p-3 text-sm ${toneClasses[tone]}`}>
      <div className="mb-1 font-bold">{title}</div>
      <ul className="list-disc space-y-1 pl-5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function YamlModal({
  questionId,
  yamlInput,
  yamlErrors,
  yamlWarnings,
  validationMessage,
  onQuestionIdChange,
  onYamlChange,
  onValidate,
  onSave,
  onClose
}) {
  return (
    <ModalShell
      title="Thêm / sửa câu hỏi Markdown + YAML"
      tone="emerald"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 font-medium text-slate-600 hover:bg-slate-200"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onValidate}
            className="rounded-lg border border-emerald-300 bg-white px-4 py-2 font-bold text-emerald-700 hover:bg-emerald-50"
          >
            Kiểm tra YAML
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white shadow-md hover:bg-blue-700"
          >
            Lưu vào server
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4 p-4">
        <div>
          <label className="mb-1 block text-sm font-bold text-slate-600">
            Mã câu hỏi (ID)
          </label>
          <input
            type="text"
            value={questionId}
            onChange={(event) => onQuestionIdChange(event.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-blue-500"
            placeholder="Ví dụ: Q_NEW_1"
          />
        </div>

        <MessageList title="Lỗi schema" items={yamlErrors} tone="red" />
        <MessageList title="Cảnh báo" items={yamlWarnings} tone="amber" />
        <MessageList title="Kết quả kiểm tra" items={validationMessage ? [validationMessage] : []} tone="emerald" />

        <div>
          <label className="mb-1 block text-sm font-bold text-slate-600">
            Nội dung YAML + Markdown
          </label>
          <textarea
            value={yamlInput}
            onChange={(event) => onYamlChange(event.target.value)}
            className="h-[55vh] w-full rounded-lg border border-slate-300 p-3 font-mono text-sm outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </ModalShell>
  );
}
