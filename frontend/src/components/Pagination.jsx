function getPageNumbers(currentPage, totalPages) {
  const pages = [];

  if (totalPages <= 7) {
    for (let page = 1; page <= totalPages; page += 1) pages.push(page);
    return pages;
  }

  if (currentPage <= 4) {
    for (let page = 1; page <= 6; page += 1) pages.push(page);
    pages.push('...');
    pages.push(totalPages);
    return pages;
  }

  if (currentPage >= totalPages - 3) {
    pages.push(1);
    pages.push('...');
    for (let page = totalPages - 4; page <= totalPages; page += 1) pages.push(page);
    return pages;
  }

  pages.push(1);
  pages.push('...');
  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) pages.push(page);
  pages.push('...');
  pages.push(totalPages);
  return pages;
}

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <nav className="mx-auto mt-8 flex max-w-6xl items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className={`flex h-10 w-10 items-center justify-center rounded transition-colors ${
          currentPage === 1
            ? 'cursor-not-allowed bg-slate-200 text-slate-400'
            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
        }`}
      >
        &lt;
      </button>

      <div className="flex gap-1.5">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`dots-${index}`}
                className="flex h-10 w-10 items-center justify-center rounded bg-slate-200 font-bold text-slate-600"
              >
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`flex h-10 w-10 items-center justify-center rounded font-bold transition-all ${
                currentPage === page
                  ? 'bg-red-800 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={`flex h-10 w-10 items-center justify-center rounded transition-colors ${
          currentPage === totalPages
            ? 'cursor-not-allowed bg-slate-200 text-slate-400'
            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
        }`}
      >
        &gt;
      </button>
    </nav>
  );
}
