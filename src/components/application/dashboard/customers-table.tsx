"use client";

import { useState } from "react";
import {
  RiDeleteBin6Line,
  RiEdit2Line,
  RiMore2Fill,
  RiSearchLine,
} from "@remixicon/react";
import { Avatar } from "@/components/base/avatar/avatar";
import { Chip } from "@/components/base/badges/chip";
import { StatusDot } from "@/components/base/badges/status-dot";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Input } from "@/components/base/input/input";
import { Pagination } from "@/components/base/pagination/pagination";
import { Select, SelectItem } from "@/components/base/select/select";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@/components/base/table/table";

/* ---------------------------------------------------------------------------
 * Board UI → dashboard 1 (Home) → customers table. Composed from BoardUI
 * primitives: `table` + `checkbox` + `avatar` + `chip` + `status-dot` +
 * `select` + `pagination`. Shared by Home and Penjualan.
 * ------------------------------------------------------------------------- */

type PurchaseStatus = "Waiting" | "Processing" | "Completed";
type DeliveryStatus = "Delivery failed" | "Shipped" | "Delivery waiting" | "Confirmed";

interface CustomerRow {
  name: string;
  initials: string;
  color: "neutral" | "blue" | "lime" | "pink";
  purchase: PurchaseStatus;
  status: DeliveryStatus;
  date: string;
  price: string;
  checked: boolean;
}

const CUSTOMER_ROWS: CustomerRow[] = [
  { name: "John Clarkson", initials: "JC", color: "neutral", purchase: "Waiting", status: "Delivery failed", date: "Sep 05, 2026", price: "$3.412", checked: false },
  { name: "Aspen Lubin", initials: "AL", color: "blue", purchase: "Waiting", status: "Delivery failed", date: "Mar 25, 2026", price: "$1.899", checked: false },
  { name: "Michael Ekstrom", initials: "ME", color: "lime", purchase: "Completed", status: "Shipped", date: "Aug 01, 2026", price: "$2.752", checked: true },
  { name: "Kianna Vaccaro", initials: "KV", color: "pink", purchase: "Completed", status: "Shipped", date: "Apr 02, 2026", price: "$145", checked: true },
  { name: "Livia Saris", initials: "LS", color: "neutral", purchase: "Processing", status: "Delivery failed", date: "Nov 14, 2026", price: "$708", checked: true },
  { name: "Jaydon Aminoff", initials: "JA", color: "blue", purchase: "Processing", status: "Delivery waiting", date: "Jul 17, 2026", price: "$224", checked: true },
  { name: "Maria Lubin", initials: "ML", color: "lime", purchase: "Completed", status: "Shipped", date: "Nov 15, 2026", price: "$2.959", checked: true },
  { name: "Ann Press", initials: "AP", color: "pink", purchase: "Processing", status: "Delivery waiting", date: "Sep 20, 2026", price: "$2.646", checked: true },
  { name: "Zaire Torff", initials: "ZT", color: "neutral", purchase: "Completed", status: "Confirmed", date: "Feb 04, 2026", price: "$3.770", checked: true },
  { name: "Gretchen Septimus", initials: "GS", color: "blue", purchase: "Completed", status: "Shipped", date: "Apr 20, 2026", price: "$3.740", checked: true },
  { name: "Omar Vetrovs", initials: "OV", color: "lime", purchase: "Waiting", status: "Delivery failed", date: "Jul 10, 2026", price: "$1.747", checked: true },
  { name: "Talan Calzoni", initials: "TC", color: "pink", purchase: "Completed", status: "Confirmed", date: "Nov 13, 2026", price: "$3.976", checked: true },
];

const PURCHASE_DOT: Record<PurchaseStatus, "green" | "yellow" | "indigo"> = {
  Waiting: "yellow",
  Completed: "green",
  Processing: "indigo",
};

const STATUS_CHIP: Record<DeliveryStatus, "rose" | "lime" | "yellow" | "cyan"> = {
  "Delivery failed": "rose",
  Shipped: "lime",
  "Delivery waiting": "yellow",
  Confirmed: "cyan",
};

function FilterSelect({
  label,
  options,
}: {
  label: string;
  options: string[];
}) {
  return (
    <Select defaultSelectedKey={options[0]} aria-label={label}>
      {options.map((option) => (
        <SelectItem key={option} id={option}>
          {option}
        </SelectItem>
      ))}
    </Select>
  );
}

function PurchaseSelect({ row }: { row: CustomerRow }) {
  return (
    <Select
      defaultSelectedKey={row.purchase}
      aria-label={`Purchase status for ${row.name}`}
      className="w-[142px]"
    >
      {(["Waiting", "Processing", "Completed"] as const).map((status) => (
        <SelectItem key={status} id={status}>
          <span className="flex items-center gap-1.25">
            <StatusDot color={PURCHASE_DOT[status]} />
            {status}
          </span>
        </SelectItem>
      ))}
    </Select>
  );
}

export function CustomersTable() {
  const [page, setPage] = useState(1);

  return (
    <section className="flex min-w-0 w-full flex-col rounded-2xl border border-border-button-default px-0.5 pb-3 pt-2">
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 px-3 py-1">
        <div className="flex h-10 flex-col justify-center">
          <span className="text-body-medium text-text-tertiary">Total Results</span>
          <span className="text-body-medium text-text-primary">660 customers</span>
        </div>
        <div className="flex max-w-full flex-wrap items-center justify-end gap-2.5">
          <FilterSelect
            label="All prices"
            options={["All prices", "Under $500", "$500 - $1,000", "Over $1,000"]}
          />
          <FilterSelect
            label="All products"
            options={["All products", "Coffee", "Tea", "Pastry"]}
          />
          <FilterSelect
            label="All regions"
            options={["All regions", "North", "South", "East", "West"]}
          />
          <Input
            placeholder="Search"
            aria-label="Search customers"
            leadingIcon={RiSearchLine}
            className="min-w-[153px] flex-1 sm:w-[153px] sm:min-w-0 sm:flex-none"
            fieldClassName="rounded-full bg-background-secondary-default"
            inputClassName="text-body-medium"
          />
        </div>
      </div>

      <Table aria-label="Customers" className="min-w-[1100px]">
        <TableHeader>
          <TableColumn id="name" isRowHeader className="w-[178px]">
            <div className="flex items-center gap-2">
              <Checkbox slot="selection" size="sm" isIndeterminate defaultSelected aria-label="Select all" />
              <span>ID Transaksi</span>
            </div>
          </TableColumn>
          <TableColumn id="purchase" className="w-[202px]">
            Purchase
          </TableColumn>
          <TableColumn id="status" className="w-[202px]">
            Status
          </TableColumn>
          <TableColumn id="updated" className="w-[202px]">
            Last updated
          </TableColumn>
          <TableColumn id="price" className="w-[202px]">
            Price
          </TableColumn>
          <TableColumn id="actions" className="w-[140px]">
            Actions
          </TableColumn>
        </TableHeader>
        <TableBody>
          {CUSTOMER_ROWS.map((row) => (
            <TableRow key={row.name} id={row.name}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Checkbox slot="selection" size="sm" defaultSelected={row.checked} aria-label={row.name} />
                  <div className="flex items-center gap-2">
                    <Avatar size="sm" color={row.color} initials={row.initials} />
                    <span className="whitespace-nowrap">{row.name}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <PurchaseSelect row={row} />
              </TableCell>
              <TableCell>
                <Chip variant="bold" color={STATUS_CHIP[row.status]}>
                  {row.status}
                </Chip>
              </TableCell>
              <TableCell>
                <span className="whitespace-nowrap">{row.date}</span>
              </TableCell>
              <TableCell>
                <Chip variant="subtle" color="gray">
                  {row.price}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2.5">
                  <Button
                    variant="secondary"
                    size="small"
                    iconOnly
                    leadingIcon={RiDeleteBin6Line}
                    aria-label={`Delete ${row.name}`}
                  />
                  <Button
                    variant="secondary"
                    size="small"
                    iconOnly
                    leadingIcon={RiEdit2Line}
                    aria-label={`Edit ${row.name}`}
                  />
                  <Button
                    variant="secondary"
                    size="small"
                    iconOnly
                    leadingIcon={RiMore2Fill}
                    aria-label={`More actions for ${row.name}`}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-3 px-3">
        <Pagination page={page} totalPages={55} onChange={setPage} />
      </div>
    </section>
  );
}
