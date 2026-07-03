import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useAppStore } from '@/context/useAppStore';

const People = () => {
  const users = useAppStore((state) => state.users);
  const loadUsers = useAppStore((state) => state.loadUsers);
  const changeUserRole = useAppStore((state) => state.changeUserRole);
  const deleteUser = useAppStore((state) => state.deleteUser);
  const adminLoading = useAppStore((state) => state.adminLoading);
  const error = useAppStore((state) => state.error);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => { loadUsers({ q, role }); }, [loadUsers, q, role]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="rounded-[2rem] bg-white p-6 shadow-[0_24px_80px_rgba(9,17,31,0.08)]">
        <p className="text-xs uppercase tracking-[0.35em] text-ink/45">People</p>
        <h1 className="mt-2 text-3xl font-black text-ink">User management</h1>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <input className="rounded-2xl border border-ink/10 bg-paper p-4" placeholder="Search users" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="rounded-2xl border border-ink/10 bg-paper p-4" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All roles</option>
            <option value="customer">Customer</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      {error ? <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</div> : null}
      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/70 bg-white">
        {adminLoading ? <div className="p-6 text-ink/60">Loading users...</div> : null}
        <table className="w-full text-left text-sm">
          <thead className="bg-paper">
            <tr>
              <th className="p-4">
                User
              </th>

              <th className="p-4">
                Role
              </th>

              <th className="p-4">
                Created
              </th>

              <th className="p-4">
                Actions
              </th>
            </tr>
          </thead>
         <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-t align-top">
              
              {/* NAME + EMAIL STACKED ON MOBILE */}
              <td className="p-4">
                <div className="flex flex-col">
                  <span className="font-medium text-ink">{user.name}</span>
                  <span className="text-xs text-ink/60 break-all">{user.email}</span>
                </div>
              </td>

              {/* ROLE */}
              <td className="p-4">
                <select
                  value={user.role}
                  onChange={(e) => changeUserRole(user._id, e.target.value)}
                  className="w-full sm:w-auto rounded-full bg-paper px-3 py-2 text-xs sm:text-sm"
                >
                  <option value="customer">Customer</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </td>

              {/* DATE (compact on mobile) */}
              <td className="p-4">
                <span className="text-xs sm:text-sm whitespace-nowrap">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </td>

              {/* DELETE ACTION */}
              <td className="p-4">
                {/* MOBILE = ICON ONLY */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to permanently delete this user?')) {
                      deleteUser(user._id);
                    }
                  }}
                  className="inline-flex items-center justify-center rounded-full bg-red-50 p-2 text-red-600 sm:px-3 sm:py-2"
                  aria-label="Delete user"
                >
                  <Trash2 size={16} />

                  {/* TEXT ONLY ON SM+ */}
                  <span className="hidden sm:inline ml-2 text-sm">
                    Delete User
                  </span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
};

export default People;
