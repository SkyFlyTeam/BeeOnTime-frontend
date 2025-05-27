import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button"; // Caso queira usar botão, mas aqui usamos PaginationLink para páginas

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPreviousNext?: boolean;
}

const TablePagination = ({ currentPage, totalPages, onPageChange, showPreviousNext = true }: TablePaginationProps) => {
  // Função para gerar os links das páginas (você pode ajustar janela de páginas se quiser)
  const generatePaginationLinks = () => {
    const pages = [];
    const startPage = Math.max(currentPage - 1, 1);
    const endPage = Math.min(currentPage + 1, totalPages);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={i === currentPage}
            onClick={() => onPageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return pages;
  };

  return (
    <Pagination className="w-fit">
      <PaginationContent>
        {showPreviousNext && totalPages > 1 && (
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              className={currentPage === 1 ? "cursor-not-allowed opacity-50" : ""}
              aria-disabled={currentPage === 1}
            />
          </PaginationItem>
        )}

        {generatePaginationLinks()}

        {showPreviousNext && totalPages > 1 && (
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              className={currentPage === totalPages ? "cursor-not-allowed opacity-50" : ""}
              aria-disabled={currentPage === totalPages}
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};

export default TablePagination;
