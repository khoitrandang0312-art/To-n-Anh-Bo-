import ModalShell from './ModalShell';

const requiredPlaceholders = [
  '% --- PHAN_I_CAU_HOI ---',
  '% --- PHAN_II_CAU_HOI ---',
  '% --- PHAN_III_CAU_HOI ---'
];

export default function TemplateModal({
  templateName,
  templateInput,
  templateErrors,
  onTemplateChange,
  onSave,
  onClose
}) {
  return (
    <ModalShell
      title={`Chỉnh sửa template: ${templateName || 'Template'}`}
      tone="purple"
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
            onClick={onSave}
            className="rounded-lg bg-purple-600 px-4 py-2 font-bold text-white shadow-md hover:bg-purple-700"
          >
            Lưu template
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4 p-4">
        <div className="rounded-lg border border-purple-100 bg-purple-50 p-3 text-sm text-purple-900">
          <div className="mb-2 font-bold">Template cần giữ đủ 3 điểm chèn:</div>
          <div className="flex flex-wrap gap-2">
            {requiredPlaceholders.map((placeholder) => (
              <code
                key={placeholder}
                className="rounded bg-white px-2 py-1 font-mono text-xs text-purple-700"
              >
                {placeholder}
              </code>
            ))}
          </div>
        </div>

        {templateErrors.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <div className="mb-1 font-bold">Template chưa hợp lệ:</div>
            <ul className="list-disc space-y-1 pl-5">
              {templateErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <textarea
          value={templateInput}
          onChange={(event) => onTemplateChange(event.target.value)}
          className="h-[60vh] w-full whitespace-pre rounded-lg border border-slate-300 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-800 outline-none focus:border-purple-500"
        />
      </div>
    </ModalShell>
  );
}
