'use client';

import React from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/table';
import { Pagination } from '@heroui/pagination';
import { Spinner } from '@heroui/spinner';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  isLoading?: boolean;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  emptyContent?: React.ReactNode;
  className?: string;
  removeWrapper?: boolean;
}

export function DataTable<TData>({
  data,
  columns,
  isLoading = false,
  pagination,
  emptyContent = 'Không có dữ liệu',
  className = '',
  removeWrapper = false,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination?.pageCount ?? -1,
  });

  return (
    <div className={`w-full`}>
      <Table
        aria-label="Data table"
        removeWrapper={removeWrapper}
        classNames={{
          wrapper: `min-h-[400px] ${removeWrapper ? 'shadow-none' : ''}`,
          th: 'bg-gray-50 text-gray-600 font-semibold',
          td: 'py-3',
          base: removeWrapper ? 'rounded-none' : '',
        }}
        className={className}
        bottomContent={
          pagination && pagination.pageCount > 1 ? (
            <div className="flex w-full justify-between items-center px-2 py-2">
              <span className="text-sm text-gray-500">
                Hiển thị {(pagination.pageIndex * pagination.pageSize) + 1} -{' '}
                {Math.min((pagination.pageIndex + 1) * pagination.pageSize, pagination.total)} trong {pagination.total}
              </span>
              <Pagination
                isCompact
                showControls
                showShadow
                color="danger"
                page={pagination.pageIndex + 1}
                total={pagination.pageCount}
                onChange={(page) => pagination.onPageChange(page)}
              />
            </div>
          ) : null
        }
      >
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header) => (
              <TableColumn key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </TableColumn>
            ))
          ).flat()}
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          loadingContent={<Spinner color="danger" label="Đang tải..." />}
          emptyContent={emptyContent}
        >
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
