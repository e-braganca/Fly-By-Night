"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/Field";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatCard, StatNumber, StatUnit } from "@/components/ui/StatCard";
import { PlusIcon, PencilIcon } from "@/components/ui/Icon";
import { PageContainer } from "@/components/customer/PageContainer";
import { PageHeader } from "@/components/customer/PageHeader";
import { EquipmentGridCard } from "@/components/customer/EquipmentGridCard";
import { EquipmentModal } from "@/components/customer/EquipmentModal";
import { useAppStore } from "@/lib/store";
import { DEFAULT_LOCATION } from "@/lib/data/equipments";
import { customer } from "@/lib/data/account";
import type { Equipment, EquipmentClass } from "@/lib/data/types";

const GROUPS: EquipmentClass[] = ["On-road", "Off-road"];

export default function EquipmentsPage() {
  const equipments = useAppStore((s) => s.equipments);
  const removeEquipment = useAppStore((s) => s.removeEquipment);

  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Equipment | null>(null);

  // Request Address Change flow (local demo state)
  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [pendingAddress, setPendingAddress] = useState<string | null>(null);

  const location = DEFAULT_LOCATION;

  const totalUnits = useMemo(
    () => equipments.reduce((sum, e) => sum + e.quantity, 0),
    [equipments],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? equipments.filter((e) => e.name.toLowerCase().includes(q))
      : equipments;
  }, [equipments, query]);

  const grouped = useMemo(() => {
    const map: Record<EquipmentClass, Equipment[]> = {
      "On-road": [],
      "Off-road": [],
    };
    for (const e of filtered) map[e.classification].push(e);
    return map;
  }, [filtered]);

  const isEmpty = filtered.length === 0;

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(e: Equipment) {
    setEditing(e);
    setModalOpen(true);
  }

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader title="Equipment">
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search for an Equipment"
            className="flex-1 sm:w-[300px] sm:flex-none"
          />
          <Button size="md" className="shrink-0" onClick={openAdd}>
            <PlusIcon size={20} />
            New Equipment
          </Button>
        </div>
      </PageHeader>

      {/* Address row */}
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-semibold text-text-primary">{location}.</h2>
        <Button
          variant="soft"
          size="sm"
          disabled={Boolean(pendingAddress)}
          onClick={() => {
            setNewAddress("");
            setAddrModalOpen(true);
          }}
        >
          <PencilIcon size={16} />
          Request Address Change
        </Button>
      </div>

      {/* Pending address-change alert */}
      {pendingAddress && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/16 bg-primary/8 px-4 py-3 text-sm text-primary-darker">
          <span className="flex-1">
            Your request to change the address from{" "}
            <span className="font-semibold">{location}</span> to{" "}
            <span className="font-semibold">{pendingAddress}</span> is under
            review
          </span>
          <Button
            variant="soft"
            size="sm"
            className="!bg-primary/8 !text-primary-dark"
            onClick={() => setPendingAddress(null)}
          >
            Cancel Request
          </Button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard label="Total Equipment Count">
          <StatNumber>{totalUnits}</StatNumber>
        </StatCard>
        <StatCard label="Filled last week / Total">
          <StatNumber>{totalUnits}</StatNumber>
          <StatUnit> / {totalUnits}</StatUnit>
        </StatCard>
        <StatCard label="Last Delivery" className="col-span-2 md:col-span-1">
          <StatUnit>{customer.lastRefuelingDate}</StatUnit>
        </StatCard>
      </div>

      {/* Grouped lists / empty state */}
      {isEmpty ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="max-w-sm text-sm text-grey-500">
            {query
              ? "No equipment matches your search."
              : "No equipment has been registered for this address yet."}
          </p>
          {!query && (
            <Button size="md" onClick={openAdd}>
              <PlusIcon size={20} />
              New Equipment
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {GROUPS.map((group) =>
            grouped[group].length ? (
              <section key={group} className="flex flex-col gap-4">
                <h3 className="text-center text-sm font-semibold text-text-primary">
                  {group}
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {grouped[group].map((e) => (
                    <EquipmentGridCard
                      key={e.id}
                      equipment={e}
                      onClick={() => openEdit(e)}
                    />
                  ))}
                </div>
              </section>
            ) : null,
          )}
        </div>
      )}

      {/* Add / Edit modal */}
      <EquipmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        equipment={editing}
        location={location}
        onRequestDelete={(e) => {
          setModalOpen(false);
          setDeleteTarget(e);
        }}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && removeEquipment(deleteTarget.id)}
        title="Delete this equipment?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" and its ${deleteTarget.quantity} unit(s) will be removed from ${location}. This can't be undone.`
            : undefined
        }
        confirmLabel="Delete"
        cancelLabel="Back"
      />

      {/* Request address change modal */}
      <Modal
        open={addrModalOpen}
        onClose={() => setAddrModalOpen(false)}
        title="Request Address Change"
        footer={
          <>
            <Button variant="soft" size="lg" onClick={() => setAddrModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="lg"
              className="flex-1"
              disabled={!newAddress.trim()}
              onClick={() => {
                setPendingAddress(newAddress.trim());
                setAddrModalOpen(false);
              }}
            >
              Submit Request
            </Button>
          </>
        }
      >
        <p className="mb-4 text-sm text-text-secondary">
          Current address: <span className="font-semibold">{location}</span>
        </p>
        <TextField
          id="new-address"
          label="New address"
          required
          placeholder="Street, City, State"
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
        />
      </Modal>
    </PageContainer>
  );
}
