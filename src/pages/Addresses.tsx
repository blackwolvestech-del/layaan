import { useState } from "react";
import { useAccountData } from "@/context/AccountDataContext";
import { useUi } from "@/context/UiContext";
import type { Address } from "@/types/account";
import { AccountLayout } from "@/components/layout/AccountLayout";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/misc";

const initialFormState: Omit<Address, "id"> = {
  fullName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  stateProvince: "",
  postalCode: "",
  country: "United Kingdom",
  phone: "",
  isDefaultShipping: false,
  isDefaultBilling: false,
};

export default function Addresses() {
  const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAccountData();
  const { toast } = useUi();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Address, "id">>(initialFormState);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setModalOpen(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingId(addr.id);
    setFormData({
      fullName: addr.fullName,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      city: addr.city,
      stateProvince: addr.stateProvince,
      postalCode: addr.postalCode,
      country: addr.country,
      phone: addr.phone,
      isDefaultShipping: addr.isDefaultShipping,
      isDefaultBilling: addr.isDefaultBilling,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.addressLine1.trim() || !formData.city.trim() || !formData.postalCode.trim()) {
      return;
    }

    if (editingId) {
      updateAddress(editingId, formData);
      toast("Address updated successfully.");
    } else {
      addAddress(formData);
      toast("New address added to your address book.");
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteAddress(id);
    setDeleteConfirmId(null);
    toast("Address removed from your address book.");
  };

  const handleSetDefault = (id: string) => {
    setDefaultAddress(id);
    toast("Primary delivery address updated.");
  };

  return (
    <AccountLayout
      title="Address Book"
      eyebrow="Delivery Destinations"
      tagline="Manage saved addresses for priority courier delivery and signature arrival."
      crumbs={[{ label: "Account", to: "/account" }, { label: "Addresses" }]}
    >
      <div className="flex items-center justify-between border-b border-line pb-4">
        <p className="eyebrow !text-[0.625rem]">Saved Residences ({addresses.length})</p>
        <Button variant="primary" size="sm" onClick={handleOpenAdd}>
          <Icon name="plus" size={14} /> Add New Address
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {addresses.map((address) => (
          <Reveal key={address.id} className="relative flex flex-col justify-between border border-line bg-surface p-6 shadow-sm">
            <div>
              <div className="flex items-start justify-between gap-3">
                <span className="font-display text-base font-medium text-ink">{address.fullName}</span>
                {address.isDefaultShipping && (
                  <span className="rounded-full border border-gold/40 bg-gold-soft/20 px-2 py-0.5 text-[0.625rem] font-bold tracking-wider text-gold-ink uppercase">
                    Default
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-1 text-xs text-ink-2">
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>{address.city}, {address.stateProvince} {address.postalCode}</p>
                <p className="font-medium text-ink">{address.country}</p>
                <p className="mt-2 text-muted">{address.phone}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-4 text-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(address)}
                  className="inline-flex items-center gap-1 font-semibold text-ink hover:text-gold-ink"
                >
                  <Icon name="edit" size={12} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(address.id)}
                  className="inline-flex items-center gap-1 text-muted hover:text-danger"
                >
                  <Icon name="trash" size={12} /> Delete
                </button>
              </div>

              {!address.isDefaultShipping && (
                <button
                  type="button"
                  onClick={() => handleSetDefault(address.id)}
                  className="text-xs text-gold-ink hover:underline"
                >
                  Set as Default
                </button>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      {/* Add / Edit Address Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto border border-line bg-surface p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <p className="eyebrow !text-[0.625rem]">{editingId ? "Modify Address" : "New Address"}</p>
                <h3 className="heading-caps !text-base">{editingId ? "Edit Saved Address" : "Add Delivery Destination"}</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="addr-name" className="nav-caps block text-xs text-muted">
                  Full Name / Recipient
                </label>
                <input
                  id="addr-name"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Lady Amina Al-Mansoor"
                  className="input mt-1 text-xs"
                  required
                />
              </div>

              <div>
                <label htmlFor="addr-line1" className="nav-caps block text-xs text-muted">
                  Street Address
                </label>
                <input
                  id="addr-line1"
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  placeholder="e.g. 42 Mount Street"
                  className="input mt-1 text-xs"
                  required
                />
              </div>

              <div>
                <label htmlFor="addr-line2" className="nav-caps block text-xs text-muted">
                  Apartment, Suite, Floor (Optional)
                </label>
                <input
                  id="addr-line2"
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  placeholder="e.g. Flat 4B"
                  className="input mt-1 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="addr-city" className="nav-caps block text-xs text-muted">
                    City
                  </label>
                  <input
                    id="addr-city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="input mt-1 text-xs"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="addr-state" className="nav-caps block text-xs text-muted">
                    State / Province / County
                  </label>
                  <input
                    id="addr-state"
                    type="text"
                    value={formData.stateProvince}
                    onChange={(e) => setFormData({ ...formData, stateProvince: e.target.value })}
                    className="input mt-1 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="addr-postal" className="nav-caps block text-xs text-muted">
                    Postal Code
                  </label>
                  <input
                    id="addr-postal"
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="input mt-1 text-xs"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="addr-country" className="nav-caps block text-xs text-muted">
                    Country / Region
                  </label>
                  <select
                    id="addr-country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="input mt-1 text-xs"
                    required
                  >
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Kuwait">Kuwait</option>
                    <option value="United States">United States</option>
                    <option value="France">France</option>
                    <option value="Monaco">Monaco</option>
                    <option value="Switzerland">Switzerland</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="addr-phone" className="nav-caps block text-xs text-muted">
                  Phone (for courier delivery notifications)
                </label>
                <input
                  id="addr-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+44 20 7946 0912"
                  className="input mt-1 text-xs"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="addr-default"
                  type="checkbox"
                  checked={formData.isDefaultShipping}
                  onChange={(e) => setFormData({ ...formData, isDefaultShipping: e.target.checked })}
                  className="h-4 w-4 accent-gold"
                />
                <label htmlFor="addr-default" className="text-xs text-ink">
                  Set as default shipping address
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-line/60 pt-4">
                <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  {editingId ? "Save Changes" : "Add Address"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm border border-line bg-surface p-6 shadow-2xl">
            <h3 className="heading-caps !text-sm text-ink">Delete Saved Address</h3>
            <p className="mt-2 text-xs text-muted">
              Are you sure you want to remove this delivery address from your profile?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="!bg-danger !text-white"
                onClick={() => handleDelete(deleteConfirmId)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </AccountLayout>
  );
}
