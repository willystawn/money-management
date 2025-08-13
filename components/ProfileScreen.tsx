
import React, { useState, useEffect } from 'react';
import { HealthProfile, DietPreference } from '../types';

interface ProfileScreenProps {
    profile: HealthProfile;
    updateProfile: (profile: HealthProfile) => Promise<void>;
}

const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
    <div className="relative">
      <select
        {...props}
        style={{ colorScheme: 'dark' }}
        className="w-full px-3 py-2.5 bg-gray-800/60 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500/70 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all appearance-none"
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
);

const ProfileScreen: React.FC<ProfileScreenProps> = ({ profile, updateProfile }) => {
    const [localProfile, setLocalProfile] = useState<HealthProfile>(profile);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setLocalProfile(profile);
    }, [profile]);

    const handleChange = <K extends keyof HealthProfile>(field: K, value: HealthProfile[K]) => {
        setSaved(false);
        setLocalProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await updateProfile(localProfile);
        setIsSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl shadow-lg ring-1 ring-white/10 p-6 sm:p-8 max-w-2xl mx-auto">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-100 mb-2">Profil Kesehatan Anda</h2>
                <p className="text-gray-400 mb-8">Personalisasikan saran AI dengan melengkapi preferensi diet Anda.</p>
            </div>
            
            <form onSubmit={handleSave} className="space-y-6">
                <div>
                    <label htmlFor="diet-preference" className="block text-sm font-medium text-gray-400 mb-1.5">Preferensi Diet</label>
                    <Select
                        id="diet-preference"
                        value={localProfile.dietPreference}
                        onChange={(e) => handleChange('dietPreference', e.target.value as DietPreference)}
                    >
                        <option value="Normal">Normal</option>
                        <option value="Vegetarian">Vegetarian</option>
                        <option value="RendahGula">Rendah Gula</option>
                    </Select>
                </div>
                
                <div className="flex items-center justify-end space-x-4 pt-4">
                    {saved && <p className="text-sm text-green-400 animate-fade-in">Profil berhasil disimpan!</p>}
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="py-2.5 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 focus:ring-blue-500 transition-all transform hover:scale-105 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileScreen;
