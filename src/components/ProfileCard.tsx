import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { Employee } from '../data/mockData';

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
                    <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-slate-100 to-slate-200 ring-4 ring-white shadow-lg overflow-hidden">
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
                    {employee.title} • {employee.department}
                </p>

                {/* Status Pill */}
                <div className={`inline-flex items-center gap-1.5 px-6 py-1.5 rounded-full text-sm font-semibold tracking-wide shadow-sm
          ${isActive
                        ? 'bg-[#E0F2E9] text-[#1F7A4C] border border-[#B8EBD0]'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {employee.status === 'active' ? 'Active' : employee.status}
                </div>

            </div>

            {/* Decorative background blur behind card */}
            <div className="absolute top-10 left-4 right-4 -bottom-4 bg-slate-200/50 rounded-2xl -z-10 transform scale-95 blur-xl" />
        </div>
    );
};
