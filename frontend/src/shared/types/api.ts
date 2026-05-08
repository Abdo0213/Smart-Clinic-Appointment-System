export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
