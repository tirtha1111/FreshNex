import React from 'react';
import { useApp } from '../context/AppContext';
import { Users, ShieldCheck, UserCheck, Calendar } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { allUsersList, userRecord } = useApp();

  // Ensure current user is in the list if empty
  const displayUsers = allUsersList.length > 0 ? allUsersList : [
    userRecord || {
      uid: 'u_1',
      name: 'Registered User',
      email: 'user@example.com',
      role: 'user',
      createdAt: Date.now() - 86400000
    }
  ];

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-[#082A52] tracking-tight">Registered Users</h1>
        <p className="text-xs text-slate-500 font-medium">User accounts stored under Firebase RTDB users/{'{uid}'}</p>
      </div>

      <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-sky-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
              <th className="py-3 px-4">User Name</th>
              <th className="py-3 px-4">Email Address</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Created Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-50 text-xs font-medium text-[#082A52]">
            {displayUsers.map((usr) => (
              <tr key={usr.uid} className="hover:bg-sky-50/50 transition-colors">
                <td className="py-3.5 px-4 font-bold flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#1267D6] text-white font-black text-xs flex items-center justify-center">
                    {usr.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{usr.name}</span>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-600">{usr.email}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    usr.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-sky-100 text-[#1267D6]'
                  }`}>
                    {usr.role}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700">
                    Active
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-400">
                  {usr.createdAt ? new Date(usr.createdAt).toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
