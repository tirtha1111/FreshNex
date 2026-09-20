import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Building, 
  Calendar, 
  Save, 
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFreshness } from '../context/FreshnessContext';

export const ProfilePage: React.FC = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const { scanHistory } = useFreshness();

  const [name, setName] = useState(userProfile?.name || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [organization, setOrganization] = useState(userProfile?.organization || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      email,
      organization,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const freshScansCount = scanHistory.filter(s => s.status === 'Fresh' || s.status === 'Good').length;
  const riskScansCount = scanHistory.filter(s => s.status === 'At Risk' || s.status === 'Warning').length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto space-y-6 select-none pb-12 font-sans"
    >
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif italic font-black text-[#07221A] tracking-tight">
          Operator Profile
        </h1>
        <p className="text-xs font-bold text-[#5C7F75] mt-1">
          Manage your personal information and verified operator identity.
        </p>
      </div>

      <AnimatePresence>
        {savedSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl bg-[#EBFBF4] border border-[#20E79A]/20 flex items-center gap-2.5 text-[#20E79A] text-xs font-bold"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Profile changes updated successfully.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Header Box */}
      <div className="bg-white border border-[#13493B]/10 rounded-[32px] p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden shadow-sm">
        {/* Large Avatar */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-[24px] bg-gradient-to-br from-[#07221A] to-[#13493B] flex items-center justify-center font-black text-[#20E79A] text-3xl sm:text-4xl shrink-0 shadow-sm"
        >
          {name.charAt(0) || 'A'}
        </motion.div>

        {/* User Details */}
        <div className="space-y-1.5 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#07221A] tracking-tight">
              {name}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#EBFBF4] text-[#20E79A] border border-[#20E79A]/20">
              {userProfile?.role === 'admin' ? 'Admin Operator' : 'Standard Operator'}
            </span>
          </div>

          <p className="text-xs font-bold text-[#5C7F75]">{email}</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs font-bold text-[#5C7F75]">
            <div className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-[#20E79A]" />
              <span>{organization || 'FreshNex Global Logistics'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#20E79A]" />
              <span>Member since Sep 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div whileHover={{ y: -2 }} className="bg-white p-5 text-center space-y-1 rounded-[24px] border border-[#13493B]/10 shadow-sm">
          <span className="text-[10px] font-bold text-[#5C7F75] uppercase tracking-wider block">
            Total Scans Logged
          </span>
          <p className="text-2xl font-black text-[#07221A]">{scanHistory.length}</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="bg-white p-5 text-center space-y-1 rounded-[24px] border border-[#13493B]/10 shadow-sm">
          <span className="text-[10px] font-bold text-[#20E79A] uppercase tracking-wider block">
            Optimal Batches
          </span>
          <p className="text-2xl font-black text-[#20E79A]">{freshScansCount}</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="bg-white p-5 text-center space-y-1 rounded-[24px] border border-[#13493B]/10 shadow-sm">
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider block">
            Alerts Triaged
          </span>
          <p className="text-2xl font-black text-orange-500">{riskScansCount}</p>
        </motion.div>
      </div>

      {/* Edit Form */}
      <div className="bg-white border border-[#13493B]/10 rounded-[32px] p-6 sm:p-8 space-y-6 shadow-sm">
        <h3 className="text-sm font-black text-[#07221A] border-b border-[#F4F7F6] pb-3">
          Personal Information
        </h3>

        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-[#5C7F75] block">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#5C7F75] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#EBF1EF] text-xs font-semibold text-[#07221A] placeholder-[#5C7F75] rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-[#20E79A]/50 focus:ring-4 focus:ring-[#20E79A]/10 transition-all duration-200"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-[#5C7F75] block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#5C7F75] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#EBF1EF] text-xs font-semibold text-[#07221A] placeholder-[#5C7F75] rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-[#20E79A]/50 focus:ring-4 focus:ring-[#20E79A]/10 transition-all duration-200"
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:col-span-2 text-left">
            <label className="text-xs font-bold text-[#5C7F75] block">Organization / Facility</label>
            <div className="relative">
              <Building className="w-4 h-4 text-[#5C7F75] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Apex Cold Chain Hub 4"
                className="w-full pl-10 pr-4 py-2.5 bg-[#EBF1EF] text-xs font-semibold text-[#07221A] placeholder-[#5C7F75] rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-[#20E79A]/50 focus:ring-4 focus:ring-[#20E79A]/10 transition-all duration-200"
              />
            </div>
          </div>

          <div className="sm:col-span-2 pt-2 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              type="submit"
              className="px-6 py-3 rounded-full font-black text-xs text-white bg-[#07221A] hover:bg-[#134336] flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Save className="w-4 h-4 text-[#20E79A]" />
              <span>Save Changes</span>
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
