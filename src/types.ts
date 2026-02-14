export interface Product {
  productName: string;
  offerLink: string;
  price: string | number;
  imageUrl?: string;
  commission?: string | number;
  commissionRate?: string | number;
  productLink?: string;
  shopName?: string;
}

export interface SheetMeta {
  count: number;
  lastUpdate: string;
}

export interface FetchProductsOptions {
  appId: string;
  secretKey: string;
  sortType?: number;
  pages?: number;
  limit?: number;
}

export interface SendToSheetsResult {
  rows: number;
  response: unknown;
}
