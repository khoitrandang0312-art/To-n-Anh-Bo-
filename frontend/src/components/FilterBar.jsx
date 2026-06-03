import { formatQuestionType } from '../lib/questionTypes';

const fieldLabels = {
  topic: 'Phân môn',
  theme: 'Chủ đề',
  chapter: 'Chương',
  difficulty: 'Mức độ',
  type: 'Loại bài tập'
};

function SelectField({ field, value, options, onChange }) {
  return (
    <label className="flex min-w-40 flex-1 flex-col gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
      {fieldLabels[field]}
      <select
        value={value}
        onChange={(event) => onChange(field, event.target.value)}
        className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-700 outline-none transition-colors focus:border-blue-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {field === 'type' && option !== 'All' ? formatQuestionType(option) : option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function FilterBar({
  filters,
  options,
  filteredCount,
  randomCount,
  onFilterChange,
  onRandomCountChange,
  onRandomPick
}) {
  const fields = ['topic', 'chapter', 'theme', 'difficulty', 'type'];

  return (
    <section className="mx-auto mb-8 max-w-6xl rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-1 flex-wrap gap-4">
          {fields.map((field) => (
            <SelectField
              key={field}
              field={field}
              value={filters[field]}
              options={options[field]}
              onChange={onFilterChange}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <span className="text-sm text-slate-500">
            Tìm thấy <strong className="font-bold text-blue-600">{filteredCount}</strong> câu hỏi
          </span>
          <input
            type="number"
            min="1"
            value={randomCount}
            onChange={(event) => onRandomCountChange(event.target.value)}
            className="h-10 w-20 rounded-lg border border-amber-300 bg-amber-50 px-3 text-center font-bold text-amber-900 outline-none focus:border-amber-500"
          />
          <button
            type="button"
            onClick={onRandomPick}
            className="h-10 rounded-lg bg-amber-500 px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-amber-600"
          >
            Bốc ngẫu nhiên
          </button>
        </div>
      </div>
    </section>
  );
}
