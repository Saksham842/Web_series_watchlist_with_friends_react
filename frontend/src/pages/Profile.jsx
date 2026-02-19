import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Calendar, Edit3, Save, List, Users as UsersIcon, ArrowLeft, Film } from 'lucide-react';
import { getAvatarGradient, getAvatarInitial } from '../utils/avatarUtils';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Profile = () => {
    const { auth } = useAuth();
    const currentUser = auth.user;
    const { userId } = useParams();
    const navigate = useNavigate();

    const isOwnProfile = !userId || parseInt(userId) === currentUser?.id;
    const targetUserId = userId ? parseInt(userId) : currentUser?.id;

    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({ name: '', bio: '', profile_pic: '', email: '' });
    const [stats, setStats] = useState({ friends: 0, watchlist: 0 });
    const [commonSeries, setCommonSeries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (targetUserId) fetchProfile();
    }, [targetUserId]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/user/profile/${targetUserId}`);
            setProfileData({
                name: res.data.name || '',
                bio: res.data.bio || '',
                profile_pic: res.data.profile_pic || '',
                email: res.data.email || ''
            });
            setStats(res.data.stats || { friends: 0, watchlist: 0 });

            // If viewing a friend's profile, fetch common series
            if (!isOwnProfile && currentUser?.id) {
                try {
                    const commonRes = await api.get(`/friends/common-series/${targetUserId}`);
                    setCommonSeries(commonRes.data || []);
                } catch (e) {
                    setCommonSeries([]);
                }
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            toast.error("Could not load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        const load = toast.loading("Updating profile...");
        try {
            await api.put('/user/profile', { bio: profileData.bio, profile_pic: profileData.profile_pic });
            toast.success("Profile updated!", { id: load });
            setIsEditing(false);
        } catch (error) {
            toast.error("Update failed", { id: load });
        }
    };

    if (loading) return (
        <div className="pt-32 flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            <p className="text-gray-500 text-sm font-medium">Loading profile...</p>
        </div>
    );

    return (
        <div className="min-h-screen pt-24 pb-20 px-4">
            <div className="max-w-4xl mx-auto">

                {/* Back button for friend profiles */}
                {!isOwnProfile && (
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold uppercase tracking-widest">Back</span>
                    </button>
                )}

                {/* Cover Banner */}
                <div className="relative mb-24">
                    <div className="h-48 sm:h-64 bg-gradient-to-tr from-red-900 via-red-700 to-red-500 rounded-[40px] shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
                    </div>

                    {/* Avatar */}
                    <div className="absolute -bottom-16 left-8 sm:left-12">
                        <div
                            className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-[6px] border-[#0f1014] shadow-2xl flex items-center justify-center text-5xl font-black text-white"
                            style={{ background: getAvatarGradient(profileData.name) }}
                        >
                            {getAvatarInitial(profileData.name)}
                        </div>
                    </div>
                </div>

                {/* Profile Body */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Stats */}
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            className="bg-white/5 border border-white/5 rounded-3xl p-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Stats</h3>
                            <div className="space-y-4">
                                <StatItem icon={<UsersIcon className="w-5 h-5 text-blue-500" />} label="Friends" value={stats.friends} />
                                <StatItem icon={<List className="w-5 h-5 text-red-500" />} label="Series Watched" value={stats.watchlist} />
                            </div>
                        </motion.div>

                        {/* Info */}
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                            className="bg-white/5 border border-white/5 rounded-3xl p-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Info</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Mail className="w-4 h-4 shrink-0" />
                                    <span className="text-sm truncate">{profileData.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Calendar className="w-4 h-4 shrink-0" />
                                    <span className="text-sm">Member since 2024</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Bio Card */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 border border-white/5 rounded-3xl p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h1 className="text-3xl font-black tracking-tighter text-white">{profileData.name}</h1>
                                    <div className="h-1 w-16 bg-red-600 rounded-full mt-2"></div>
                                </div>
                                {isOwnProfile && (
                                    <button
                                        onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
                                        className="px-5 py-2.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
                                    >
                                        {isEditing ? <><Save className="w-3.5 h-3.5" /> Save</> : <><Edit3 className="w-3.5 h-3.5" /> Edit Profile</>}
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Bio</label>
                                        <textarea
                                            value={profileData.bio}
                                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                            placeholder="Tell the world about your binge-watching journey..."
                                            className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-600/50 transition-all resize-none"
                                        />
                                    </div>
                                    <div className="flex gap-3 justify-end">
                                        <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl text-[10px] font-black uppercase transition-all">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-400 text-lg leading-relaxed italic">
                                    {profileData.bio || (isOwnProfile ? "No bio yet. Click Edit Profile to add one!" : "This user hasn't written a bio yet.")}
                                </p>
                            )}
                        </motion.div>

                        {/* Common Series (only for friend profiles) */}
                        {!isOwnProfile && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                                className="bg-white/5 border border-white/5 rounded-3xl p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <Film className="w-5 h-5 text-red-500" />
                                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Series You Both Watch</h3>
                                </div>
                                {commonSeries.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {commonSeries.map(series => (
                                            <Link key={series.id} to={`/series/${series.id}`}
                                                className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-red-600/30 rounded-2xl p-3 transition-all group">
                                                <p className="text-white text-xs font-bold truncate group-hover:text-red-400 transition-colors">{series.title}</p>
                                                <p className="text-gray-500 text-[10px] mt-1 capitalize">{series.genre}</p>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-3">🎬</div>
                                        <p className="text-gray-500 text-sm">No series in common yet.</p>
                                        <p className="text-gray-600 text-xs mt-1">Start watching the same shows!</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatItem = ({ icon, label, value }) => (
    <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
            {icon}
        </div>
        <div>
            <p className="text-xl font-black text-white leading-none">{value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-0.5">{label}</p>
        </div>
    </div>
);

export default Profile;
