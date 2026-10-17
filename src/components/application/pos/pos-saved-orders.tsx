"use client";

import {
  RiAddLine,
  RiArrowRightSLine,
  RiDownload2Line,
  RiFolder3Line,
  RiMoreFill,
  RiNotification3Line,
} from "@remixicon/react";
import { Avatar } from "@/components/base/avatar/avatar";
import { Chip } from "@/components/base/badges/chip";
import { Button } from "@/components/base/buttons/button";
import { IconButton } from "@/components/base/buttons/icon-button";
import { cx } from "@/utils/cx";
import { SoftScroll } from "@/components/application/layout/soft-scroll";

/* ---------------------------------------------------------------------------
 * Tampilan "Simpan Pesanan" di POS — salinan identik dari reference
 * docs/reference-boardui-design-task.html (project board / kanban):
 * judul + tombol New ticket, kolom (Backlog / To do / In progress / Review)
 * dengan kartu tiket: id › label, avatar stack, chip prioritas + chip area,
 * deskripsi, dan "Since". Warna diterjemahkan ke token semantik BoardUI.
 * ------------------------------------------------------------------------- */

type Priority = "Low" | "Medium" | "High" | "Urgent";

interface Ticket {
  id: string;
  label: string;
  priority: Priority;
  assignees: string[];
  description: string;
  since: string;
}

interface BoardColumn {
  name: string;
  count: string;
  tickets: Ticket[];
}

const PRIORITY_CHIP: Record<Priority, "blue" | "yellow" | "orange" | "rose"> = {
  Low: "blue",
  Medium: "yellow",
  High: "orange",
  Urgent: "rose",
};

const ASSIGNEE_AVATAR: Record<string, { initials: string; color: "neutral" | "blue" | "lime" | "pink" }> = {
  vibl: { initials: "v", color: "neutral" },
  firstview: { initials: "f", color: "blue" },
  BoardUI: { initials: "B", color: "lime" },
};

const COLUMNS: BoardColumn[] = [
  {
    name: "Backlog",
    count: "3/8",
    tickets: [
      {
        id: "DS-38",
        label: "Agent handoff",
        priority: "Low",
        assignees: ["vibl", "firstview"],
        description: "Explore approval cards for agent handoffs",
        since: "Since 14 Sep",
      },
      {
        id: "FE-86",
        label: "Project board",
        priority: "Low",
        assignees: ["firstview"],
        description: "Add saved views for each project team",
        since: "Since 13 Sep",
      },
      {
        id: "BE-23",
        label: "Activity API",
        priority: "Medium",
        assignees: ["vibl"],
        description: "Record an audit trail for agent actions",
        since: "Since 12 Sep",
      },
    ],
  },
  {
    name: "To do",
    count: "3/5",
    tickets: [
      {
        id: "DS-34",
        label: "Foundations",
        priority: "High",
        assignees: ["BoardUI"],
        description: "Define semantic tokens for elevated surfaces",
        since: "Since 12 Sep",
      },
      {
        id: "FE-82",
        label: "Composer",
        priority: "Low",
        assignees: ["firstview"],
        description: "Add keyboard navigation to model picker",
        since: "Since 11 Sep",
      },
      {
        id: "BE-19",
        label: "Usage API",
        priority: "Low",
        assignees: ["vibl"],
        description: "Return rolling limits with reset timestamps",
        since: "Since 10 Sep",
      },
    ],
  },
  {
    name: "In progress",
    count: "2/4",
    tickets: [
      {
        id: "FE-79",
        label: "Agent progress",
        priority: "Medium",
        assignees: ["firstview"],
        description: "Animate nested task groups as they stream",
        since: "Since 9 Sep",
      },
      {
        id: "DS-31",
        label: "Dark mode",
        priority: "Urgent",
        assignees: ["BoardUI"],
        description: "Tune chart contrast on dark dashboard cards",
        since: "Since 8 Sep",
      },
    ],
  },
  {
    name: "Review",
    count: "1/3",
    tickets: [
      {
        id: "FE-76",
        label: "Questionnaire",
        priority: "Low",
        assignees: ["vibl"],
        description: "Polish the transition between plan questions",
        since: "Since 7 Sep",
      },
    ],
  },
];

/** Chip area tiket: ikon folder + nama area, permukaan putih + hairline. */
function AreaChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-separator-border bg-background-primary-default px-1.5 py-0.5">
      <RiFolder3Line className="size-3.5 text-foreground-icon-quaternary" aria-hidden />
      <span className="text-body-2-medium text-text-secondary">{label}</span>
    </span>
  );
}

/** Stack avatar assignee yang saling tumpuk. */
function AssigneeStack({ assignees }: { assignees: string[] }) {
  return (
    <span className="flex items-center">
      {assignees.map((name, index) => {
        const avatar = ASSIGNEE_AVATAR[name];
        return (
          <span
            key={name}
            className={cx(index > 0 && "-ms-2", "rounded-full ring-2 ring-background-primary-default")}
          >
            <Avatar size="sm" color={avatar.color} initials={avatar.initials} />
          </span>
        );
      })}
    </span>
  );
}

function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <article className="flex w-full flex-col gap-2 rounded-xl bg-background-primary-default p-3 shadow-xs">
      <div className="flex w-full items-start justify-between gap-3">
        <span className="flex min-w-0 items-center gap-0.5">
          <span className="whitespace-nowrap text-body-2-medium text-text-secondary">
            {ticket.id}
          </span>
          <RiArrowRightSLine className="size-3.5 shrink-0 text-text-tertiary" aria-hidden />
          <span className="truncate text-body-2-medium text-text-secondary">
            {ticket.label}
          </span>
        </span>
        <AssigneeStack assignees={ticket.assignees} />
      </div>

      <div className="flex w-full flex-col gap-2">
        <span className="flex items-center gap-1.5">
          <Chip variant="bold" color={PRIORITY_CHIP[ticket.priority]}>
            {ticket.priority}
          </Chip>
          <AreaChip label={ticket.label} />
        </span>
        <span className="flex w-full flex-col gap-1.25">
          <span className="line-clamp-2 text-body-medium text-text-primary">
            {ticket.description}
          </span>
          <span className="whitespace-nowrap text-body-2-medium text-text-secondary">
            {ticket.since}
          </span>
        </span>
      </div>
    </article>
  );
}

function BoardColumnView({ column }: { column: BoardColumn }) {
  return (
    <section className="flex min-h-0 w-[300px] shrink-0 flex-col rounded-[20px] bg-background-secondary-default pt-3 sm:flex-1">
      <div className="flex w-full items-center justify-between px-3">
        <span className="flex items-center gap-1.5">
          <span className="whitespace-nowrap text-body-medium text-text-primary">
            {column.name}
          </span>
          <span className="whitespace-nowrap text-body-medium text-text-secondary">
            {column.count}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <button
            type="button"
            aria-label={`Menu kolom ${column.name}`}
            className="flex size-5 cursor-pointer items-center justify-center rounded-md text-foreground-icon-secondary outline-none transition-colors duration-150 ease hover:bg-background-primary-hover hover:text-foreground-icon-primary focus-visible:ring-2 focus-visible:ring-border-focus-ring"
          >
            <RiMoreFill className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label={`Tambah tiket ke ${column.name}`}
            className="flex size-5 cursor-pointer items-center justify-center rounded-md text-foreground-icon-secondary outline-none transition-colors duration-150 ease hover:bg-background-primary-hover hover:text-foreground-icon-primary focus-visible:ring-2 focus-visible:ring-border-focus-ring"
          >
            <RiAddLine className="size-4" aria-hidden />
          </button>
        </span>
      </div>

      <SoftScroll contentClassName="flex flex-col gap-1.5 px-1.5 pb-1.5 pt-2" surface="var(--color-background-secondary-default)">
        {column.tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </SoftScroll>
    </section>
  );
}

export function PosSavedOrders() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="px-1 text-title-2-medium text-text-primary">
          BoardUI Design Tasks
        </h1>
        <div className="flex items-center gap-2.5">
          <span className="relative">
            <IconButton
              icon={RiNotification3Line}
              size="medium"
              aria-label="Notifications"
            />
            <span className="pointer-events-none absolute left-[18px] top-[2px] flex h-4 min-w-4 items-center justify-center rounded-full bg-text-error-primary px-1 text-[10px] font-bold leading-4 text-white ring-2 ring-background-primary-default">
              5
            </span>
          </span>
          <IconButton icon={RiDownload2Line} size="medium" aria-label="Download" />
          <Button variant="primary" size="medium" leadingIcon={RiAddLine}>
            New ticket
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-2 overflow-x-auto pb-1">
        {COLUMNS.map((column) => (
          <BoardColumnView key={column.name} column={column} />
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * CATATAN UNTUK AGENT AI:
 * Layout project board ini (docs/reference-boardui-design-task.html) adalah
 * acuan resmi untuk section / halaman "Pesanan Tersimpan" (saved orders).
 * Gunakan design layout ini — kolom kanban, kartu tiket, chip prioritas,
 * avatar stack — saat membangun atau mengubah halaman pesanan tersimpan.
 * Mapping konten: kolom = status pesanan, tiket = pesanan tersimpan.
 * ------------------------------------------------------------------------- */
