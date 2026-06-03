export default function Header({
  cartCount,
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onOpenBulk,
  onOpenYaml,
  onOpenTemplate,
  onOpenCart,
  onGenerateExam
}) {
  return (
    <header className="mx-auto mb-8 flex max-w-6xl flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="text-center lg:text-left">
        <h1 className="flex items-center justify-center gap-2 text-3xl font-extrabold text-blue-900 lg:justify-start">
          <span className="text-4xl text-blue-600">Σ</span>
          Toán Anh Bo
          <span className="ml-1 text-2xl text-blue-500">∞</span>
        </h1>
        <p className="mt-1 text-slate-500">Ăn - Ngủ - Sáng tạo.</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <label className="flex min-w-56 flex-col gap-1 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
          Template
          <select
            value={selectedTemplateId}
            onChange={(event) => onSelectTemplate(event.target.value)}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-700 outline-none transition-colors focus:border-blue-500"
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={onOpenBulk}
          className="h-10 rounded-lg border border-orange-300 bg-orange-100 px-4 text-sm font-bold text-orange-700 transition-colors hover:bg-orange-200"
        >
          Nhập hàng loạt
        </button>

        <button
          type="button"
          onClick={onOpenYaml}
          className="h-10 rounded-lg border border-emerald-300 bg-emerald-100 px-4 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-200"
        >
          Nhập YAML
        </button>

        <button
          type="button"
          onClick={onOpenTemplate}
          className="h-10 rounded-lg border border-purple-300 bg-purple-100 px-4 text-sm font-bold text-purple-700 transition-colors hover:bg-purple-200"
        >
          Template
        </button>

        <button
          type="button"
          onClick={onOpenCart}
          className="relative h-10 rounded-lg border border-blue-300 bg-blue-100 px-4 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-200"
        >
          Gói đề
          <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
            {cartCount}
          </span>
        </button>

        <button
          type="button"
          onClick={onGenerateExam}
          className="h-10 rounded-lg bg-red-800 px-5 text-sm font-bold text-white shadow-md transition-colors hover:bg-red-900"
        >
          Tạo đề
        </button>
      </div>
    </header>
  );
}
