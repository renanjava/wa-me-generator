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
  count?: number;
  lastUpdate?: string;
}

export interface SheetResponse {
  products: Product[];
  meta?: SheetMeta;
}

export interface FormInputs {
  nomeProduto: HTMLInputElement | null;
  precoAtual: HTMLInputElement | null;
  linkAfiliado: HTMLInputElement | null;
}

export interface FormResult {
  valid: boolean;
  data?: {
    nomeProduto: string;
    precoAtualStr: string;
    link: string;
  };
}
