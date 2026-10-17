export type PosCategory = "minuman" | "snack" | "makanan";

export interface PosProduct {
  id: string;
  name: string;
  category: PosCategory;
  price: number;
}

export interface PosCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}
