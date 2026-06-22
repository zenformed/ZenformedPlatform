'use client';

import type { ReactElement, ReactNode } from 'react';
import adminStyles from './admin.module.css';

export type AdminDataTableColumn<T> = {
  id: string;
  header: string;
  sortable?: boolean;
  render: (row: T) => ReactNode;
};

export type AdminDataTableProps<T> = {
  columns: readonly AdminDataTableColumn<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onSort: (columnId: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  errorMessage?: string | null;
  page: number;
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  pageLabel: string;
  previousLabel: string;
  nextLabel: string;
  showPagination?: boolean;
};

export function AdminDataTable<T>({
  columns,
  rows,
  rowKey,
  sortBy,
  sortDir,
  onSort,
  isLoading = false,
  emptyMessage = 'No results found.',
  errorMessage = null,
  page,
  totalPages,
  onPreviousPage,
  onNextPage,
  pageLabel,
  previousLabel,
  nextLabel,
  showPagination = true,
}: AdminDataTableProps<T>): ReactElement {
  return (
    <>
      {errorMessage ? (
        <p className={adminStyles.adminError} role="alert">
          {errorMessage}
        </p>
      ) : null}
      <div className={adminStyles.adminTableWrap}>
        <table className={adminStyles.adminTable}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.id} scope="col">
                  {column.sortable ? (
                    <button
                      type="button"
                      className={adminStyles.adminSortButton}
                      onClick={() => onSort(column.id)}
                    >
                      <span>{column.header}</span>
                      {sortBy === column.id ? (
                        <span className={adminStyles.adminSortIndicator} aria-hidden="true">
                          {sortDir === 'asc' ? '▲' : '▼'}
                        </span>
                      ) : null}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length}>Loading…</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>{emptyMessage}</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((column) => (
                    <td key={column.id}>{column.render(row)}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showPagination ? (
        <div className={adminStyles.adminPagination}>
          <span>{pageLabel}</span>
          <div className={adminStyles.adminPaginationButtons}>
            <button
              type="button"
              className={adminStyles.adminButton}
              onClick={onPreviousPage}
              disabled={page <= 1 || isLoading}
            >
              {previousLabel}
            </button>
            <button
              type="button"
              className={adminStyles.adminButton}
              onClick={onNextPage}
              disabled={page >= totalPages || totalPages === 0 || isLoading}
            >
              {nextLabel}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function AdminFilterBar({ children }: { children: ReactNode }): ReactElement {
  return <div className={adminStyles.adminFilters}>{children}</div>;
}

export function AdminSearchInput({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}): ReactElement {
  return (
    <input
      type="search"
      className={`${adminStyles.adminFilterControl} ${adminStyles.adminSearchControl}`}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function AdminSelectFilter({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}): ReactElement {
  return (
    <select
      className={adminStyles.adminFilterControl}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
