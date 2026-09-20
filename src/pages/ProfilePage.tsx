import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Building, 
  Phone, 
  Calendar, 
  Shield, 
  Save, 
  CheckCircle2,
  Activity,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFreshness } from '../context/FreshnessContext';

export const ProfilePage: React.FC = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const { scanHistory } = useFreshness();

  const [name, setName] = useState(userProfile?.name || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [organization, setOrganization] = useState(userProfile?.organization || '');
  const [phone, setPhone] = useState('');
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
      className="max-w-4xl mx-auto space-y-6 select-none pb-12"
    >
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#FDF8F5] tracking-tight">
          Profile
        </h1>
        <p className="text-sm text-[#B8A89E] mt-1">
          Manage your personal information and verified operator identity.
        </p>
      </div>

      <AnimatePresence>
        {savedSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl bg-[#20E79A]/15 border border-[#20E79A]/30 flex items-center gap-2.5 text-[#20E79A] text-xs font-bold"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Profile changes updated successfully.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Header Box */}
      <div className="card-solid p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden shadow-2xl border border-[#FF6A00]/25">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF6A00]/60 to-transparent" />

        {/* Large Avatar */}
        <motion.div 
          whileHover={{ scale: 1.06, rotate: 2 }}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#FF6A00] to-[#FFAA00] flex items-center justify-center font-black text-[#140C08] text-3xl sm:text-4xl shrink-0 shadow-[0_0_25px_rgba(255,106,0,0.35)]"
        >
          {name.charAt(0) || 'A'}
        </motion.div>

        {/* User Details */}
        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#FDF8F5]">
              {name}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FF6A00]/15 text-[#FFAA00] border border-[#FFAA00]/30">
              {userProfile?.role === 'admin' ? 'Admin' : 'User'}
            </span>
          </div>

          <p className="text-xs text-[#B8A89E]">{email}</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-[#8C7A70]">
            <div className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#FFAA00]" />
              <span>{organization || 'FreshNex Global Logistics'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#20E79A]" />
              <span>Member since Sep 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div whileHover={{ y: -3 }} className="card-solid p-4 text-center space-y-1 shadow-lg border border-[#FF6A00]/20">
          <span className="text-[11px] font-bold text-[#8C7A70] uppercase tracking-wider">
            Total Scans Logged
          </span>
          <p className="text-2xl font-black text-[#FDF8F5]">{scanHistory.length}</p>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="card-solid p-4 text-center space-y-1 shadow-lg border border-[#FF6A00]/20">
          <span className="text-[11px] font-bold text-[#8C7A70] uppercase tracking-wider">
            Optimal Batches
          </span>
          <p className="text-2xl font-black text-[#20E79A]">{freshScansCount}</p>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="card-solid p-4 text-center space-y-1 shadow-lg border border-[#FF6A00]/20">
          <span className="text-[11px] font-bold text-[#8C7A70] uppercase tracking-wider">
            Alerts Triaged
          </span>
          <p className="text-2xl font-black text-[#FFAA00]">{riskScansCount}</p>
        </motion.div>
      </div>

      {/* Edit Form */}
      <div className="card-solid p-6 sm:p-8 space-y-6 shadow-2xl border border-[#FF6A00]/25">
        <h3 className="text-base font-bold text-[#FDF8F5] border-b border-[#3D261A] pb-3">
          Personal Information
        </h3>

        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#B8A89E] block">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8C7A70] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#1E140E] text-xs text-[#FDF8F5] rounded-xl border border-[#3D261A] focus:outline-none focus:border-[#FF6A00]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#B8A89E] block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8C7A70] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#1E140E] text-xs text-[#FDF8F5] rounded-xl border border-[#3D261A] focus:outline-none focus:border-[#FF6A00]"
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-[#B8A89E] block">Organization / Facility</label>
            <div className="relative">
              <Building className="w-4 h-4 text-[#8C7A70] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Apex Cold Chain Hub 4"
                className="w-full pl-10 pr-4 py-2.5 bg-[#1E140E] text-xs text-[#FDF8F5] rounded-xl border border-[#3D261A] focus:outline-none focus:border-[#FF6A00]"
              />
            </div>
          </div>

          <div className="sm:col-span-2 pt-2 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-[#140C08] btn-orange flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
