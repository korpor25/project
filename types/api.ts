// Shared response shapes that mirror the backend envelope.
// Concrete resource types are added as features land.

export type ApiResponse<T> = { data: T; meta?: PageMeta };

export type PageMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type Role = "USER" | "ADMIN" | "SUPER_ADMIN";
