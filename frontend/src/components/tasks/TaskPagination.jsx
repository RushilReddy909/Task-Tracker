import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';

// Builds a compact page list like [1, '...', 4, 5, 6, '...', 12] instead
// of rendering every page number when there are many pages.
function buildPageList(current, total) {
  const pages = [];
  const window = 1;
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || (p >= current - window && p <= current + window)) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }
  return pages;
}

export default function TaskPagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  const pageList = buildPageList(page, pages);

  const go = (e, target) => {
    e.preventDefault();
    if (target < 1 || target > pages) return;
    onPageChange(target);
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => go(e, page - 1)}
            aria-disabled={page <= 1}
            className={page <= 1 ? 'pointer-events-none opacity-50' : undefined}
          />
        </PaginationItem>

        {pageList.map((p, i) =>
          p === '...' ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink href="#" isActive={p === page} onClick={(e) => go(e, p)}>
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => go(e, page + 1)}
            aria-disabled={page >= pages}
            className={page >= pages ? 'pointer-events-none opacity-50' : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
