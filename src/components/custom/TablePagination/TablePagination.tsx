import { Button } from  "@/components/ui/button"; // Ajuste conforme o nome do componente de botão do ShadCN
import { PaginationItem, Pagination, PaginationContent, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Ícones de navegação

const generatePaginationLinks = (currentPage: number, totalPages: number, onPageChange: (page: number) => void) => {
  const pages = [];
  
  let startPage = Math.max(currentPage - 1, 1);  // A página inicial não pode ser menor que 1
  let endPage = Math.min(currentPage + 1, totalPages);  // A página final não pode ser maior que o total de páginas
  
  // Adiciona as páginas dentro da janela visível
  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <PaginationItem key={i}>
        <Button
          variant="ghost"
          size="sm"
          className={`text-black ${i === currentPage ? "font-bold bg-[#FFB503] rounded" : ""}`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </Button>
      </PaginationItem>
    );
  }

  return pages;
};

const TablePagination  = ({ currentPage, totalPages, onPageChange, showPreviousNext = true }: any) => {
  return (
    <Pagination className="w-fit">
      <PaginationContent>
        {showPreviousNext && totalPages ? (
          <PaginationItem>
            <PaginationPrevious
              className="bg-transparent border-none cursor-pointer"
              onClick={() => onPageChange(currentPage - 1)}
              isActive={currentPage > totalPages - 1}  
            />
          </PaginationItem>
        ) : null}

        {/* Gerar links de paginação */}
        {generatePaginationLinks(currentPage, totalPages, onPageChange)}

        {showPreviousNext && totalPages ? (
          <PaginationItem>
            <PaginationNext
              className="bg-transparent border-none cursor-pointer"
              onClick={() => onPageChange(currentPage + 1)}
              isActive={currentPage - 1 < 1} 
            />
          </PaginationItem>
        ) : null}
      </PaginationContent>
    </Pagination>
  );
};

export default TablePagination;
