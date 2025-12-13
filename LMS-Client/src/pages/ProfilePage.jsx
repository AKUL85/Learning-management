import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Wallet, CreditCard, Lock, Save, Edit3, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import WalletModal from '../components/profile/WalletModal';

export default function ProfilePage() {
    const { profile, refreshProfile } = useAuth();
    const [showWalletModal, setShowWalletModal] = useState(false);

    // Handlers for later implementation (Edit Profile, etc)
    const handleSave = () => {
        // Logic to update profile would go here
        console.log("Saving profile...");
    };

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-[#0F172A] pt-20 pb-12">
            <Navbar />

            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-cyan-900/10 rounded-full blur-3xl"></div>
                <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Identity & Assets</h1>
                    <p className="text-gray-400 mt-2">Manage your personal information and digital wallet.</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="col-span-1"
                    >
                        <div className="bg-[#1E293B]/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="relative flex flex-col items-center text-center">
                                <div className="w-32 h-32 rounded-full border-4 border-[#0F172A] shadow-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[3px] mb-4 relative">
                                    <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                                        <User className="w-16 h-16 text-white" />
                                    </div>
                                    <button className="absolute bottom-1 right-1 bg-cyan-500 p-2 rounded-full text-white shadow-lg hover:bg-cyan-400 transition transform hover:scale-110">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>

                                <h2 className="text-2xl font-bold text-white">{profile.fullName || profile.full_name}</h2>
                                <span className="inline-flex items-center px-3 py-1 mt-2 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 capitalize">
                                    {profile.role} Account
                                </span>
                            </div>

                            <div className="mt-8 space-y-4">
                                <div className="flex items-center p-3 rounded-xl bg-gray-800/50 border border-gray-700/50">
                                    <Wallet className="w-5 h-5 text-green-400 mr-3" />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-400 uppercase font-semibold">Wallet Balance</p>
                                        <p className="text-xl font-bold text-white">${(profile.bankBalance || profile.bank_balance || 0).toFixed(2)}</p>
                                    </div>
                                    <button
                                        onClick={() => setShowWalletModal(true)}
                                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-green-900/20"
                                    >
                                        Recharge
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Details & Settings */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="col-span-1 lg:col-span-2 space-y-6"
                    >
                        {/* Personal Info */}
                        <div className="bg-[#1E293B]/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center">
                                    <Shield className="w-5 h-5 text-cyan-400 mr-2" />
                                    Personal Information
                                </h3>
                                <button className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center transition-colors">
                                    <Edit3 className="w-4 h-4 mr-1" /> Edit
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Full Name</label>
                                    <div className="flex items-center bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white">
                                        <User className="w-4 h-4 text-gray-500 mr-3" />
                                        {profile.fullName || profile.full_name}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Email Address</label>
                                    <div className="flex items-center bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white">
                                        <Mail className="w-4 h-4 text-gray-500 mr-3" />
                                        {profile.email || "user@example.com" /* Assuming email is available in user obj or profile need to fetch */}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Role</label>
                                    <div className="flex items-center bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white capitalize">
                                        <Shield className="w-4 h-4 text-gray-500 mr-3" />
                                        {profile.role}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Member Since</label>
                                    <div className="flex items-center bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white">
                                        <Clock className="w-4 h-4 text-gray-500 mr-3" />
                                        {new Date(profile.createdAt || Date.now()).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security (Placeholder) */}
                        <div className="bg-[#1E293B]/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-xl opacity-80">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center">
                                    <Lock className="w-5 h-5 text-purple-400 mr-2" />
                                    Security
                                </h3>
                            </div>
                            <div className="flex items-center justify-between bg-gray-900/50 border border-gray-700 rounded-xl p-4">
                                <div>
                                    <p className="text-white font-medium">Password</p>
                                    <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                                </div>
                                <button className="text-sm bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition">Change</button>
                            </div>
                        </div>

                    </motion.div>
                </div>
            </div>

            <WalletModal
                isOpen={showWalletModal}
                onClose={() => setShowWalletModal(false)}
                balance={profile.bankBalance || profile.bank_balance || 0}
                onRecharge={async () => {
                    // Refresh profile to update balance after recharge
                    await refreshProfile();
                }}
            />
        </div>
    );
}

function Clock({ className }) { // Small helper component locally if needed or import
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
    )
}
