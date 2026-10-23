import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { authService, StaffAccountRecord } from '../../services/authService';
import { UserRole } from '../../types';

export const UserManagementView: React.FC = () => {
  const { currentUser, showToast } = useApp();
  const [staffList, setStaffList] = useState<StaffAccountRecord[]>(() => {
    return currentUser ? authService.listStaff(currentUser) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modals
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffAccountRecord | null>(null);

  // Provisioning form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newBadge, setNewBadge] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('GODOWN_MANAGER');
  const [newGodownId, setNewGodownId] = useState('WH-DEL-04');
  const [newGodownName, setNewGodownName] = useState('Central Grain Store — Demo');
  const [newDistrictId, setNewDistrictId] = useState('DL-NW');
  const [newDistrictName, setNewDistrictName] = useState('North West Division');
  const [newStateCode, setNewStateCode] = useState(currentUser?.state_code || 'DL');
  const [newPassword, setNewPassword] = useState('Bhandar@2026!');
  const [formError, setFormError] = useState('');

  if (!currentUser || (currentUser.role !== 'PLATFORM_SUPER_ADMIN' && currentUser.role !== 'STATE_ADMIN')) {
    return (
      <div className="p-8 text-center text-error font-semibold">
        Unauthorized: Staff Account Administration is restricted to Platform and State Administrators.
      </div>
    );
  }

  const reloadList = () => {
    if (currentUser) {
      setStaffList(authService.listStaff(currentUser));
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.badge_no.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleProvisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      authService.provisionStaffAccount(currentUser, {
        name: newName,
        email: newEmail,
        badge_no: newBadge,
        role: newRole,
        godown_id: newGodownId,
        godown_name: newGodownName,
        district_id: newDistrictId,
        district_name: newDistrictName,
        state_code: newStateCode,
        initial_password: newPassword,
      });

      showToast(`Staff account for ${newName} provisioned successfully.`, 'success');
      setShowProvisionModal(false);
      // Reset form
      setNewName('');
      setNewEmail('');
      setNewBadge('');
      reloadList();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Provisioning failed.');
    }
  };

  const handleToggleStatus = (staff: StaffAccountRecord) => {
    const nextStatus = !staff.is_active;
    const actionLabel = nextStatus ? 'activate' : 'deactivate';

    if (window.confirm(`Are you sure you want to ${actionLabel} account for ${staff.name} (${staff.badge_no})?`)) {
      try {
        authService.updateStaffRoleOrScope(currentUser, staff.id, {
          is_active: nextStatus,
        });
        showToast(`Staff account ${staff.name} is now ${nextStatus ? 'ACTIVE' : 'DEACTIVATED'}.`, 'info');
        reloadList();
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : 'Action rejected.', 'error');
      }
    }
  };

  const handleEditRoleScopeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setFormError('');

    try {
      authService.updateStaffRoleOrScope(currentUser, editingStaff.id, {
        role: editingStaff.role,
        godown_id: editingStaff.godown_id,
        godown_name: editingStaff.godown_name,
        district_id: editingStaff.district_id,
        district_name: editingStaff.district_name,
      });

      showToast(`Role and Scope updated for ${editingStaff.name}.`, 'success');
      setEditingStaff(null);
      reloadList();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Update failed.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn select-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-primary">admin_panel_settings</span>
            <h1 className="font-headline text-2xl font-bold text-on-surface">Staff &amp; Role Management</h1>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Departmental user provisioning, role assignments, and jurisdictional scope management.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            setShowProvisionModal(true);
          }}
          className="px-4 py-2 bg-primary text-on-primary font-semibold text-sm rounded shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Provision New Staff Member</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-container-low p-3 rounded border border-outline-variant">
        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[18px] text-outline">
            search
          </span>
          <input
            type="text"
            placeholder="Search name, email, badge..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-on-surface-variant whitespace-nowrap">Filter Role:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 px-2 rounded border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Roles ({staffList.length})</option>
            <option value="PLATFORM_SUPER_ADMIN">Platform Super Admin</option>
            <option value="STATE_ADMIN">State Administrator</option>
            <option value="DISTRICT_SUPPLY_OFFICER">District Supply Officer</option>
            <option value="GODOWN_MANAGER">Godown Manager</option>
            <option value="QUALITY_INSPECTOR">Quality Inspector</option>
            <option value="STOCK_INWARD_OPERATOR">Stock Inward Operator</option>
            <option value="DISPATCH_OPERATOR">Dispatch Operator</option>
            <option value="AUTHORIZED_APPROVER">Authorized Approver</option>
            <option value="AUDITOR">Auditor</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container border-b border-outline-variant font-label-sm text-outline uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Officer Name &amp; Email</th>
                <th className="py-3 px-4">Badge No</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Jurisdiction &amp; Godown</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-outline">
                    No staff records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-surface-container-high transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-on-surface">{staff.name}</div>
                      <div className="text-outline text-[11px] font-mono">{staff.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-on-surface">{staff.badge_no}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                        {staff.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-on-surface">{staff.godown_name}</div>
                      <div className="text-[11px] text-outline">
                        {staff.district_name} • {staff.state_code} ({staff.godown_id})
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {staff.is_active !== false ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-primary-container text-on-primary">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-error-container text-on-error-container">
                          Deactivated
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingStaff({ ...staff })}
                          className="px-2.5 py-1 text-xs border border-outline-variant rounded hover:bg-surface-container text-on-surface font-medium transition-colors"
                        >
                          Edit Role / Scope
                        </button>
                        <button
                          onClick={() => handleToggleStatus(staff)}
                          disabled={staff.id === currentUser.id}
                          className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                            staff.is_active !== false
                              ? 'border border-error/30 text-error hover:bg-error-container/30'
                              : 'border border-primary/30 text-primary hover:bg-primary/10'
                          } disabled:opacity-30`}
                        >
                          {staff.is_active !== false ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision New Staff Member Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-primary text-on-primary flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">person_add</span>
                <h3 className="font-title text-base font-semibold">Provision Departmental Staff</h3>
              </div>
              <button
                onClick={() => setShowProvisionModal(false)}
                className="p-1 rounded text-on-primary/80 hover:text-on-primary hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleProvisionSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-2.5 bg-error-container text-on-error-container rounded text-xs border border-error flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Officer Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full h-8 px-2.5 rounded border border-outline-variant bg-surface-container-lowest text-xs focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Badge No *</label>
                  <input
                    type="text"
                    required
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    placeholder="e.g. DL-FCS-9912"
                    className="w-full h-8 px-2.5 rounded border border-outline-variant bg-surface-container-lowest text-xs font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Official Email Address *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="r.kumar@bhandarsetu.internal"
                  className="w-full h-8 px-2.5 rounded border border-outline-variant bg-surface-container-lowest text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Assigned Role *</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full h-8 px-2 rounded border border-outline-variant bg-surface-container-lowest text-xs focus:outline-none focus:border-primary"
                  >
                    {currentUser.role === 'PLATFORM_SUPER_ADMIN' && (
                      <option value="PLATFORM_SUPER_ADMIN">Platform Super Admin</option>
                    )}
                    <option value="STATE_ADMIN">State Administrator</option>
                    <option value="DISTRICT_SUPPLY_OFFICER">District Supply Officer</option>
                    <option value="GODOWN_MANAGER">Godown Manager</option>
                    <option value="QUALITY_INSPECTOR">Quality Inspector</option>
                    <option value="STOCK_INWARD_OPERATOR">Stock Inward Operator</option>
                    <option value="DISPATCH_OPERATOR">Dispatch Operator</option>
                    <option value="AUTHORIZED_APPROVER">Authorized Approver</option>
                    <option value="AUDITOR">Auditor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Initial Password</label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-8 px-2.5 rounded border border-outline-variant bg-surface-container-lowest text-xs font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Scope Coordinates */}
              <div className="p-3 bg-surface-container rounded border border-outline-variant space-y-2.5">
                <div className="text-xs font-semibold uppercase text-outline">Assigned Depot &amp; Scope Coordinates</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] text-outline mb-0.5">Godown Code</label>
                    <input
                      type="text"
                      value={newGodownId}
                      onChange={(e) => setNewGodownId(e.target.value)}
                      className="w-full h-7 px-2 rounded border border-outline-variant bg-surface-container-lowest text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-outline mb-0.5">Godown Name</label>
                    <input
                      type="text"
                      value={newGodownName}
                      onChange={(e) => setNewGodownName(e.target.value)}
                      className="w-full h-7 px-2 rounded border border-outline-variant bg-surface-container-lowest text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-outline mb-0.5">District Name</label>
                    <input
                      type="text"
                      value={newDistrictName}
                      onChange={(e) => setNewDistrictName(e.target.value)}
                      className="w-full h-7 px-2 rounded border border-outline-variant bg-surface-container-lowest text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-outline mb-0.5">State Code</label>
                    <input
                      type="text"
                      value={newStateCode}
                      onChange={(e) => setNewStateCode(e.target.value)}
                      className="w-full h-7 px-2 rounded border border-outline-variant bg-surface-container-lowest text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowProvisionModal(false)}
                  className="px-4 py-2 text-xs font-medium text-on-surface-variant hover:bg-surface-container rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-primary text-on-primary rounded hover:bg-primary/90"
                >
                  Confirm &amp; Provision Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role & Scope Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-surface-container border-b border-outline-variant flex items-center justify-between">
              <div>
                <h3 className="font-title text-base font-semibold text-on-surface">Edit Role &amp; Scope</h3>
                <p className="text-xs text-outline">{editingStaff.name} ({editingStaff.badge_no})</p>
              </div>
              <button
                onClick={() => setEditingStaff(null)}
                className="p-1 rounded text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleEditRoleScopeSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-2.5 bg-error-container text-on-error-container rounded text-xs border border-error">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Application Role *</label>
                <select
                  value={editingStaff.role}
                  onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value as UserRole })}
                  className="w-full h-8 px-2 rounded border border-outline-variant bg-surface-container-lowest text-xs focus:outline-none focus:border-primary"
                >
                  {currentUser.role === 'PLATFORM_SUPER_ADMIN' && (
                    <option value="PLATFORM_SUPER_ADMIN">Platform Super Admin</option>
                  )}
                  <option value="STATE_ADMIN">State Administrator</option>
                  <option value="DISTRICT_SUPPLY_OFFICER">District Supply Officer</option>
                  <option value="GODOWN_MANAGER">Godown Manager</option>
                  <option value="QUALITY_INSPECTOR">Quality Inspector</option>
                  <option value="STOCK_INWARD_OPERATOR">Stock Inward Operator</option>
                  <option value="DISPATCH_OPERATOR">Dispatch Operator</option>
                  <option value="AUTHORIZED_APPROVER">Authorized Approver</option>
                  <option value="AUDITOR">Auditor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Godown Facility Name</label>
                <input
                  type="text"
                  value={editingStaff.godown_name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, godown_name: e.target.value })}
                  className="w-full h-8 px-2.5 rounded border border-outline-variant bg-surface-container-lowest text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Godown Code</label>
                <input
                  type="text"
                  value={editingStaff.godown_id}
                  onChange={(e) => setEditingStaff({ ...editingStaff, godown_id: e.target.value })}
                  className="w-full h-8 px-2.5 rounded border border-outline-variant bg-surface-container-lowest text-xs font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 text-xs font-medium text-on-surface-variant hover:bg-surface-container rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-primary text-on-primary rounded hover:bg-primary/90"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
