// components/marketplace/Pagination.tsx
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }
  
  export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;
  
    return (
      <div className="flex justify-center items-center gap-4 mt-12">
        <button 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Sebelumnya
        </button>
        <span className="text-sm text-gray-600 font-medium">
          Halaman {currentPage} dari {totalPages}
        </span>
        <button 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Selanjutnya
        </button>
      </div>
    );
  }