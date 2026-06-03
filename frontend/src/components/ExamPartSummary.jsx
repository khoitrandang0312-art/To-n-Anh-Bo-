export default function ExamPartSummary({ parts }) {
  return (
    <section className="mx-auto mb-6 grid max-w-6xl gap-3 md:grid-cols-3">
      {parts.map((part) => (
        <div
          key={part.key}
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className={`rounded border px-2 py-1 text-xs font-bold uppercase ${part.badgeClass}`}>
              {part.label}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {part.questions.length}/{part.availableCount} câu
            </span>
          </div>
          <div className="text-sm font-bold text-slate-800">{part.name}</div>
          <div className="mt-1 text-xs text-slate-500">{part.rule}</div>
        </div>
      ))}
    </section>
  );
}
