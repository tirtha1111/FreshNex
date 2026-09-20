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
    <div className="space-y-5 max-w-5xl mx-auto text-[#FDF8F5]">
      <div>
        <h1 className="text-2xl font-black text-[#FDF8F5] tracking-tight">Registered Users</h1>
        <p className="text-xs text-[#B8A89E] font-medium">User accounts stored under Firebase RTDB users/{'{uid}'}</p>
      </div>

      <div className="glass-card rounded-3xl p-5 border border-[#FF6A00]/25 shadow-xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#FF6A00]/20 text-[10px] font-black uppercase text-[#FFAA00] tracking-wider">
              <th className="py-3 px-4">User Name</th>
              <th className="py-3 px-4">Email Address</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Created Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#FF6A00]/10 text-xs font-medium text-[#FDF8F5]">
            {displayUsers.map((usr) => (
              <tr key={usr.uid} className="hover:bg-[#FF6A00]/5 transition-colors">
                <td className="py-3.5 px-4 font-bold flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF6A00] to-[#FFAA00] text-white font-black text-xs flex items-center justify-center shadow-sm">
                    {usr.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{usr.name}</span>
                </td>
                <td className="py-3.5 px-4 font-mono text-[#B8A89E]">{usr.email}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    usr.role === 'admin' 
                      ? 'bg-[#FF6A00]/20 text-[#FFAA00] border border-[#FFAA00]/30' 
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {usr.role}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active
                  </span>
                </td>
                <td className="py-3.5 px-4 text-[#8C7A70]">
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
