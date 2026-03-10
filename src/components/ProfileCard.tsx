import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Linkedin, Twitter, Instagram, Facebook } from 'lucide-react';
import type { Employee } from '@/types';

interface ProfileCardProps {
    employee: Employee;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ employee }) => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        // Delay animation slightly for "live check" feel
        const timer = setTimeout(() => setAnimate(true), 400);
        return () => clearTimeout(timer);
    }, []);

    const isActive = employee.status === 'active';

    return (
        <div className="relative mx-6 mt-8">
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 p-8 flex flex-col items-center text-center">

                {/* Photo Container */}
                <div className="relative mb-6">
                    <div className="w-32 h-32 rounded-full p-1 bg-linear-to-tr from-slate-100 to-slate-200 ring-4 ring-white shadow-lg overflow-hidden">
                        <img
                            src={employee.photoUrl}
                            alt={`${employee.name}`}
                            className={`w-full h-full object-cover rounded-full transition-opacity duration-700 ${animate ? 'opacity-100' : 'opacity-0'}`}
                        />
                    </div>

                    {/* Status Verification Badge */}
                    <div className={`absolute bottom-1 right-1 bg-white rounded-full p-1.5 shadow-md transition-all duration-500 transform ${animate ? 'scale-100 translate-y-0' : 'scale-0 translate-y-4'}`}>
                        {isActive ? (
                            <CheckCircle2 className="text-[#1F7A4C] fill-[#E0F2E9]" size={28} strokeWidth={2.5} />
                        ) : (
                            <XCircle className="text-red-500 fill-red-50" size={28} />
                        )}
                    </div>
                </div>

                {/* Name & Title */}
                <h1 className="text-[28px] font-bold text-[#0B1229] mb-1 font-display tracking-tight">
                    {employee.name}
                </h1>
                <p className="text-slate-500 font-medium mb-6 text-sm">
                    {employee.role} • {employee.department_id}
                </p>

                {/* Status Pill */}
                <div className={`inline-flex items-center gap-1.5 px-6 py-1.5 rounded-full text-sm font-semibold tracking-wide shadow-sm
          ${isActive
                        ? 'bg-[#E0F2E9] text-[#1F7A4C] border border-[#B8EBD0]'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {employee.status === 'active' ? 'Active' : employee.status}
                </div>

                {/* Social Links */}
                {employee.socialLinks && (
                    <div className="mt-6 flex gap-3">
                        {employee.socialLinks.linkedin && (
                            <a href={employee.socialLinks.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn Profile" className="p-2 text-slate-400 hover:text-[#0077b5] hover:bg-[#0077b5]/10 rounded-full transition-colors">
                                <Linkedin size={20} />
                            </a>
                        )}
                        {employee.socialLinks.twitter && (
                            <a href={employee.socialLinks.twitter} target="_blank" rel="noreferrer" aria-label="Twitter Profile" className="p-2 text-slate-400 hover:text-black hover:bg-black/5 rounded-full transition-colors">
                                <Twitter size={20} />
                            </a>
                        )}
                        {employee.socialLinks.instagram && (
                            <a href={employee.socialLinks.instagram} target="_blank" rel="noreferrer" aria-label="Instagram Profile" className="p-2 text-slate-400 hover:text-[#E1306C] hover:bg-[#E1306C]/10 rounded-full transition-colors">
                                <Instagram size={20} />
                            </a>
                        )}
                        {employee.socialLinks.facebook && (
                            <a href={employee.socialLinks.facebook} target="_blank" rel="noreferrer" aria-label="Facebook Profile" className="p-2 text-slate-400 hover:text-[#1877F2] hover:bg-[#1877F2]/10 rounded-full transition-colors">
                                <Facebook size={20} />
                            </a>
                        )}
                    </div>
                )}

            </div>

            {/* Decorative background blur behind card */}
            <div className="absolute top-10 left-4 right-4 -bottom-4 bg-slate-200/50 rounded-2xl -z-10 transform scale-95 blur-xl" />
        </div>
    );
};
