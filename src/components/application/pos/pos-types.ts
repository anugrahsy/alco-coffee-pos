export type PosCategory = "minuman" | "snack" | "makanan";

export interface PosProduct {
  id: string;
  name: string;
  category: PosCategory;
  price: number;
  active?: boolean;
  available?: boolean;
}

export interface PosCartItem {
  id: string;
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
}
