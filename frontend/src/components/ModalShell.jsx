export default function ModalShell({ title, tone = 'slate', children, footer, onClose }) {
  const toneClasses = {
    slate: 'bg-slate-50 text-slate-800',
    blue: 'bg-blue-50 text-blue-800',
    emerald: 'bg-emerald-50 text-emerald-800',
    orange: 'bg-orange-50 text-orange-800',
    purple: 'bg-purple-50 text-purple-800'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className={`flex items-center justify-between border-b border-slate-200 p-4 ${toneClasses[tone]}`}>
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl font-bold text-slate-400 hover:bg-white/70 hover:text-red-500"
            aria-label="Đóng"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">{children}</div>

        {footer && (
          <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 p-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
