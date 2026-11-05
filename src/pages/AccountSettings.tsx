import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useUi } from "@/context/UiContext";
import { AccountLayout } from "@/components/layout/AccountLayout";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/misc";

export default function AccountSettings() {
  const { customer, updateProfile, updatePreferences, resetPassword, logout, login } = useAuth();
  const { toast } = useUi();
  const navigate = useNavigate();

  // Personal Information Form
  const [firstName, setFirstName] = useState(customer?.firstName || "");
  const [lastName, setLastName] = useState(customer?.lastName || "");
  const [email, setEmail] = useState(customer?.email || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [personalSaving, setPersonalSaving] = useState(false);

  // Password Change Form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Preferences Form
  const [emailNewsletter, setEmailNewsletter] = useState(customer?.preferences.emailNewsletter ?? true);
  const [orderUpdates, setOrderUpdates] = useState(customer?.preferences.orderUpdates ?? true);
  const [exclusiveEvents, setExclusiveEvents] = useState(customer?.preferences.exclusiveEvents ?? true);

  // Delete Account Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    setPersonalSaving(true);
    updateProfile({ firstName, lastName, phone })
      .then(() => toast("Personal details updated successfully."))
      .catch((err: unknown) => toast(err instanceof Error ? err.message : "Your details couldn't be saved. Please try again."))
      .finally(() => setPersonalSaving(false));
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      // Confirm the current password before changing it.
      await login(email, currentPassword);
      await resetPassword(newPassword);
    } catch (err) {
      setPasswordSaving(false);
      setPasswordError(err instanceof Error && /match an account/.test(err.message) ? "Your current password is incorrect." : err instanceof Error ? err.message : "Your password couldn't be changed.");
      return;
    }
    setPasswordSaving(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast("Your password has been changed securely.");
  };

  const handleTogglePreference = (key: "emailNewsletter" | "orderUpdates" | "exclusiveEvents") => {
    if (key === "emailNewsletter") {
      const next = !emailNewsletter;
      setEmailNewsletter(next);
      updatePreferences({ emailNewsletter: next });
      toast(`Newsletter preference ${next ? "enabled" : "disabled"}.`);
    } else if (key === "orderUpdates") {
      const next = !orderUpdates;
      setOrderUpdates(next);
      updatePreferences({ orderUpdates: next });
      toast(`Order SMS notifications ${next ? "enabled" : "disabled"}.`);
    } else {
      const next = !exclusiveEvents;
      setExclusiveEvents(next);
      updatePreferences({ exclusiveEvents: next });
      toast(`Private invitation preference ${next ? "enabled" : "disabled"}.`);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(false);
    logout();
    toast("You've been signed out. To close your account permanently, please contact LAYAAN Atelier.");
    navigate("/login");
  };

  return (
    <AccountLayout
      title="Security & Preferences"
      eyebrow="Account Settings"
      tagline="Manage your contact information, security credentials, and atelier communications."
      crumbs={[{ label: "Account", to: "/account" }, { label: "Settings" }]}
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Left Column: Personal info & Password (7 cols) */}
        <div className="space-y-10 lg:col-span-7">
          {/* Personal Information */}
          <Reveal className="border border-line bg-surface p-6 sm:p-8">
            <div className="border-b border-line pb-4">
              <p className="eyebrow !text-[0.625rem]">Profile</p>
              <h3 className="heading-caps !text-base sm:!text-lg">Personal Information</h3>
            </div>

            <form onSubmit={handleSavePersonal} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="first-name" className="nav-caps block text-xs text-muted">
                    First Name
                  </label>
                  <input
                    id="first-name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input mt-1 text-xs"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="last-name" className="nav-caps block text-xs text-muted">
                    Last Name
                  </label>
                  <input
                    id="last-name"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input mt-1 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="nav-caps block text-xs text-muted">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input mt-1 text-xs"
                  readOnly
                  aria-describedby="email-note"
                  required
                />
                <p id="email-note" className="mt-1 text-[0.6875rem] text-muted">Your sign-in email. Contact the atelier to change it.</p>
              </div>

              <div>
                <label htmlFor="phone" className="nav-caps block text-xs text-muted">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input mt-1 text-xs"
                  placeholder="+44 20 7000 0000"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="sm" disabled={personalSaving}>
                  {personalSaving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </form>
          </Reveal>

          {/* Password Security */}
          <Reveal className="border border-line bg-surface p-6 sm:p-8">
            <div className="border-b border-line pb-4">
              <p className="eyebrow !text-[0.625rem]">Credentials</p>
              <h3 className="heading-caps !text-base sm:!text-lg">Change Password</h3>
            </div>

            <form onSubmit={handleSavePassword} className="mt-6 space-y-4">
              {passwordError && (
                <div className="border border-danger/40 bg-danger/10 p-3 text-xs text-danger">
                  {passwordError}
                </div>
              )}

              <div>
                <label htmlFor="current-pwd" className="nav-caps block text-xs text-muted">
                  Current Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="current-pwd"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input !pr-10 text-xs"
                    placeholder="Enter existing password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted hover:text-ink"
                    aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                  >
                    <Icon name={showCurrentPassword ? "eyeOff" : "eye"} size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="new-pwd" className="nav-caps block text-xs text-muted">
                  New Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="new-pwd"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input !pr-10 text-xs"
                    placeholder="Minimum 8 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted hover:text-ink"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    <Icon name={showNewPassword ? "eyeOff" : "eye"} size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm-pwd" className="nav-caps block text-xs text-muted">
                  Confirm New Password
                </label>
                <input
                  id="confirm-pwd"
                  type={showNewPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input mt-1 text-xs"
                  placeholder="Repeat new password"
                  required
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="outline" size="sm" disabled={passwordSaving}>
                  {passwordSaving ? "Updating…" : "Update Password"}
                </Button>
              </div>
            </form>
          </Reveal>
        </div>

        {/* Right Column: Preferences & Danger Zone (5 cols) */}
        <div className="space-y-10 lg:col-span-5">
          {/* Communication Preferences */}
          <Reveal className="border border-line bg-surface p-6 sm:p-8">
            <div className="border-b border-line pb-4">
              <p className="eyebrow !text-[0.625rem]">Notifications</p>
              <h3 className="heading-caps !text-base sm:!text-lg">Atelier Preferences</h3>
            </div>

            <div className="mt-6 space-y-5 text-xs text-ink-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-ink">Editorial Journal & Releases</p>
                  <p className="text-muted leading-relaxed">
                    Receive weekly editorial lookbooks, styling dispatches, and campaign previews.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNewsletter}
                  onChange={() => handleTogglePreference("emailNewsletter")}
                  className="mt-1 h-4 w-4 accent-gold"
                  aria-label="Editorial journal"
                />
              </div>

              <div className="flex items-start justify-between gap-4 border-t border-line/60 pt-4">
                <div>
                  <p className="font-semibold text-ink">Courier SMS Updates</p>
                  <p className="text-muted leading-relaxed">
                    Receive real-time courier dispatch and delivery verification alerts via SMS.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={orderUpdates}
                  onChange={() => handleTogglePreference("orderUpdates")}
                  className="mt-1 h-4 w-4 accent-gold"
                  aria-label="SMS dispatch alerts"
                />
              </div>

              <div className="flex items-start justify-between gap-4 border-t border-line/60 pt-4">
                <div>
                  <p className="font-semibold text-ink">Private Runway & Showroom</p>
                  <p className="text-muted leading-relaxed">
                    Exclusive invitations to physical salon presentations and bespoke tailoring sessions.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={exclusiveEvents}
                  onChange={() => handleTogglePreference("exclusiveEvents")}
                  className="mt-1 h-4 w-4 accent-gold"
                  aria-label="Private showroom invitations"
                />
              </div>
            </div>
          </Reveal>

          {/* Account Actions / Danger Zone */}
          <Reveal className="border border-line bg-surface p-6 sm:p-8">
            <div className="border-b border-line pb-4">
              <p className="eyebrow !text-[0.625rem]">Management</p>
              <h3 className="heading-caps !text-base sm:!text-lg">Account Actions</h3>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-ink">Session Logout</p>
                  <p className="text-[0.6875rem] text-muted">End your active atelier session on this device.</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/login"); }}>
                  Sign Out
                </Button>
              </div>

              <div className="border-t border-line/60 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-danger">Delete Client Portfolio</p>
                    <p className="text-[0.6875rem] text-muted">
                      Permanently remove all local addresses and account preferences.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteModal(true)}
                    className="border-danger/50 text-danger hover:bg-danger hover:text-white"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-line bg-surface p-6 shadow-2xl sm:p-8">
            <div className="text-center">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-danger/10 text-danger">
                <Icon name="trash" size={22} />
              </div>
              <h3 className="heading-caps !text-base text-ink">Confirm Account Deletion</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Are you sure you wish to delete your LAYAAN customer profile? You will be signed out; the atelier will then close your account on request (your order history is kept for our records).
              </p>
            </div>

            <div className="mt-8 flex gap-3">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1 !bg-danger !text-white hover:!bg-danger/90"
                onClick={handleDeleteAccount}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </AccountLayout>
  );
}
