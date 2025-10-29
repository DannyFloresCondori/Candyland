'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { PaginationInfo } from '@/types';

interface PaginationControlsProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PaginationControls({ 
  pagination, 
  onPageChange, 
  className = '' 
}: PaginationControlsProps) {
  const { page, totalPages, hasNextPage, hasPrevPage } = pagination;

  // Generar array de páginas a mostrar
  const getVisiblePages = () => {
    const delta = 2; // Número de páginas a mostrar a cada lado de la página actual
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* Botón Anterior */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevPage}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </Button>

      {/* Páginas */}
      <div className="flex items-center gap-1">
        {getVisiblePages().map((pageNum, index) => {
          if (pageNum === '...') {
            return (
              <div key={`dots-${index}`} className="flex items-center justify-center w-8 h-8">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </div>
            );
          }

          const pageNumber = pageNum as number;
          const isCurrentPage = pageNumber === page;

          return (
            <Button
              key={pageNumber}
              variant={isCurrentPage ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(pageNumber)}
              className="w-8 h-8 p-0"
            >
              {pageNumber}
            </Button>
          );
        })}
      </div>

      {/* Botón Siguiente */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNextPage}
        className="flex items-center gap-1"
      >
        Siguiente
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Componente más simple para casos básicos
interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function SimplePagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = '' 
}: SimplePaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex justify-center gap-2 ${className}`}>
      {Array.from({ length: totalPages }, (_, index) => {
        const pageNumber = index + 1;
        return (
          <Button
            key={pageNumber}
            variant={currentPage === pageNumber ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        );
      })}
    </div>
  );
}
