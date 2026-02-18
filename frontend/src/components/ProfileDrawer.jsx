import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, X, Settings, Bell, Heart, Users, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAvatarGradient, getAvatarInitial } from '../utils/avatarUtils';

const ProfileDrawer = ({ isOpen, onClose, user, onLogout }) => {
    const navigate = useNavigate();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-[300px] bg-[#0f1014] border-l border-white/10 z-[101] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 flex justify-end">
                            <button 
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Profile Info */}
                        <div className="px-6 pb-8 flex flex-col items-center">
                            <div className="relative mb-4">
                            <div
                                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-2xl"
                                style={{ background: getAvatarGradient(user?.name) }}
                            >
                                {getAvatarInitial(user?.name)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-[#0f1014] rounded-full"></div>
                        </div>
                            <h2 className="text-xl font-black tracking-tight text-white mb-1">{user?.name}</h2>
                            <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">{user?.email}</p>
                        </div>

                        {/* Divider */}
                        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6"></div>

                        {/* Menu Items */}
                        <div className="flex-1 px-4 space-y-2">
                            <MenuLink 
                                icon={<User className="w-4 h-4 text-purple-500" />} 
                                label="My Account" 
                                onClick={() => { navigate('/profile'); onClose(); }} 
                            />
                            <MenuLink 
                                icon={<Bell className="w-4 h-4 text-orange-500" />} 
                                label="Requests" 
                                onClick={() => { navigate('/friends?tab=pending'); onClose(); }} 
                            />
                            <MenuLink 
                                icon={<Heart className="w-4 h-4 text-red-500" />} 
                                label="Watchlist" 
                                onClick={() => { navigate('/watchlist'); onClose(); }} 
                            />
                            <MenuLink 
                                icon={<Users className="w-4 h-4 text-blue-500" />} 
                                label="Friends" 
                                onClick={() => { navigate('/friends'); onClose(); }} 
                            />
                            <MenuLink 
                                icon={<Settings className="w-4 h-4 text-gray-400" />} 
                                label="Settings" 
                                onClick={() => { /* Not implemented */ }} 
                            />
                        </div>

                        {/* Footer / Logout */}
                        <div className="p-6">
                            <button 
                                onClick={() => { onLogout(); onClose(); }}
                                className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 hover:bg-red-600/10 hover:text-red-500 text-gray-400 rounded-2xl transition-all border border-white/5 font-black uppercase tracking-widest text-[10px]"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const MenuLink = ({ icon, label, onClick }) => (
    <button 
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-all group"
    >
        <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{label}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
    </button>
);

export default ProfileDrawer;
