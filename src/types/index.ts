export interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;
  stock: number;
  category: string;
  hsnCode: string;
  gstRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  price: number;
  gstAmount: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  subtotal: number;
  gstTotal: number;
  total: number;
  date: string;
  customerName?: string;
  customerPhone?: string;
  customerGstin?: string;
}

export interface Analytics {
  totalSales: number;
  totalRevenue: number;
  topProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  monthlySales: Array<{
    month: string;
    sales: number;
    revenue: number;
  }>;
}

// New interfaces for GST Report
export interface GSTReportItem {
  date: string;
  productName: string;
  category: string;
  quantitySold: number;
  basePrice: number;
  gstRate: number;
  priceWithGST: number;
  totalBaseAmount: number;
  totalGSTAmount: number;
  totalAmount: number;
}

export interface GSTReportResponse {
  data: GSTReportItem[];
  totalBaseAmount: number;
  totalGSTAmount: number;
  totalAmount: number;
}

export interface GSTReportParams {
  months: number;
}
