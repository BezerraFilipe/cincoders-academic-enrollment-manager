export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function toPage<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): Page<T> {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export function toSkip(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}
