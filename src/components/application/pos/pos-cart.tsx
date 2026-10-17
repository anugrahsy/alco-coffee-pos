"use client";

import {
  RiAddLine,
  RiDeleteBin6Line,
  RiSave3Line,
  RiShoppingBag3Line,
  RiSubtractLine,
  RiWallet3Line,
} from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";
import { SoftScroll } from "@/components/application/layout/soft-scroll";
import type { PosCartItem } from "./pos-types";

interface PosCartProps {
  cart: PosCartItem[];
  onChangeQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

function formatRupiah(value: number) {
  return "Rp" + value.toLocaleString("id-ID");
}

export function PosCart({ cart, onChangeQuantity, onRemove }: PosCartProps) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="flex min-h-0 h-full flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-separator-border p-4">
        <h2 className="text-title-3-semibold text-text-primary">Keranjang</h2>
        <span className="text-body-2-regular text-text-tertiary">
          {cart.length} item
        </span>
      </div>

      {/* Items */}
      {cart.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-text-tertiary">
          <RiShoppingBag3Line className="size-12" aria-hidden />
          <p className="text-body-regular">Keranjang kosong</p>
          <p className="text-body-2-regular">
            Tambahkan produk dari katalog
          </p>
        </div>
      ) : (
        <SoftScroll contentClassName="p-4">
          <div className="flex flex-col gap-3">
            {cart.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border-button-default bg-background-primary-default p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-body-medium text-text-primary">
                      {item.name}
                    </p>
                    <p className="text-body-2-regular text-text-tertiary">
                      {formatRupiah(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-body-medium tabular-nums text-text-primary">
                    {formatRupiah(item.price * item.quantity)}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="small"
                    iconOnly
                    leadingIcon={RiSubtractLine}
                    className="min-h-11 min-w-11 lg:min-h-0 lg:min-w-0"
                    aria-label="Kurangi"
                    onClick={() => onChangeQuantity(item.id, -1)}
                  />
                  <span className="w-8 text-center text-body-medium tabular-nums text-text-primary">
                    {item.quantity}
                  </span>
                  <Button
                    variant="secondary"
                    size="small"
                    iconOnly
                    leadingIcon={RiAddLine}
                    className="min-h-11 min-w-11 lg:min-h-0 lg:min-w-0"
                    aria-label="Tambah"
                    onClick={() => onChangeQuantity(item.id, 1)}
                  />
                  <Button
                    variant="ghost"
                    size="small"
                    iconOnly
                    leadingIcon={RiDeleteBin6Line}
                    aria-label="Hapus"
                    className="ms-auto min-h-11 min-w-11 text-text-error-primary lg:min-h-0 lg:min-w-0"
                    onClick={() => onRemove(item.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </SoftScroll>
      )}

      {/* Summary */}
      {cart.length > 0 && (
        <div className="flex flex-col gap-4 border-t border-separator-border p-4">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-body-regular text-text-secondary">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-title-3-semibold text-text-primary">
              <span>Total</span>
              <span className="tabular-nums">{formatRupiah(subtotal)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              className="w-full"
              leadingIcon={RiWallet3Line}
              onClick={() => {
                // TODO: bayar.
              }}
            >
              Bayar Sekarang
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              leadingIcon={RiSave3Line}
              onClick={() => {
                // TODO: simpan order.
              }}
            >
              Simpan Order
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
