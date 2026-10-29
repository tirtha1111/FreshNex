import React from 'react';
import { ShieldCheck, Mail, Building2, CheckCircle2 } from 'lucide-react';
import { useFreshNex } from '../../context/FreshNexContext';

export const UsersView: React.FC = () => {
  const { users } = useFreshNex();

  return (
    <div className="space-y-5">
      <div className="fnx-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#102F46]">
            Administrator & Authorized Users
          </h1>
          <p className="text-xs text-[#71869A] mt-0.5">
            Manage platform administrators, quality inspectors, and cold-chain fleet operators.
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-[#E5F8F0] text-[#079B68] text-xs font-bold">
          Active Admin: Tirtharaj Biswas
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {users.map((u) => (
          <div key={u.id} className="fnx-card p-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#079B68] text-white font-extrabold text-base flex items-center justify-center shrink-0">
                {u.avatarInitials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-[#102F46]">{u.name}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E5F8F0] text-[#079B68] text-[11px] font-bold">
                    {u.role}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#71869A] mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{u.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#71869A] mt-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{u.department}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#079B68]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {u.status}
              </span>
              <div className="text-[11px] text-[#71869A] mt-1">{u.lastActive}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
