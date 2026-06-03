import ModalShell from './ModalShell';

function BulkResult({ result }) {
  if (!result) return null;

  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900">
      <div className="font-bold">{result.message}</div>
      {result.skipped?.length > 0 && (
        <div className="mt-2">
          <div className="mb-1 font-semibold">Các câu bị bỏ qua:</div>
          <ul className="max-h-32 list-disc space-y-1 overflow-auto pl-5">
            {result.skipped.map((item) => (
              <li key={item.index}>
                Câu #{item.index}: {(item.errors || []).join('; ')}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function BulkImportModal({
  bulkInput,
  bulkResult,
  onBulkChange,
  onSave,
  onClose
}) {
  return (
    <ModalShell
      title="Nhập hàng loạt câu hỏi"
      tone="orange"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 font-medium text-slate-600 hover:bg-slate-200"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-lg bg-orange-600 px-4 py-2 font-bold text-white shadow-md hover:bg-orange-700"
          >
            Nhập tất cả
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4 p-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          Mỗi câu kết thúc bằng <code className="rounded bg-white px-1.5 py-0.5 font-mono text-orange-700">---END_QUESTION---</code>.
          Backend sẽ validate schema từng câu trước khi lưu.
        </div>

        <BulkResult result={bulkResult} />

        <textarea
          value={bulkInput}
          onChange={(event) => onBulkChange(event.target.value)}
          placeholder={`---
topic: "Đại số"
chapter: "Phương trình"
theme: "Bậc hai"
difficulty: "Cơ bản"
type: "mcq"
answers:
  - "$x=1$"
  - "$x=2$"
  - "$x=3$"
  - "$x=4$"
---
Nội dung câu hỏi
---END_QUESTION---`}
          className="h-[60vh] w-full whitespace-pre rounded-lg border border-slate-300 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-800 outline-none focus:border-orange-500"
        />
      </div>
    </ModalShell>
  );
}
