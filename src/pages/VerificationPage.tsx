import React from 'react';
import { useParams } from 'react-router-dom';
import { StickyHeader } from '../components/StickyHeader';
import { ProfileCard } from '../components/ProfileCard';
import { ActionStack } from '../components/ActionStack';
import { VerificationInfo } from '../components/VerificationInfo';
import { BrandFooter } from '../components/BrandFooter';
import { employees } from '../data/mockData';
import { AlertCircle } from 'lucide-react';

export const VerificationPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const employee = employees.find(e => e.id === id);

    if (!employee) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
                    <p className="text-slate-500 mb-6">The employee profile you are looking for does not exist or has been removed.</p>
                    <a href="https://eleastar.com" className="block w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">
                        Go to Homepage
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <StickyHeader />

            <main className="flex-grow w-full max-w-md mx-auto flex flex-col">
                <ProfileCard employee={employee} />
                <ActionStack />
                <div className="flex-grow" />
                <VerificationInfo employee={employee} />
            </main>

            <BrandFooter />
        </div>
    );
};
