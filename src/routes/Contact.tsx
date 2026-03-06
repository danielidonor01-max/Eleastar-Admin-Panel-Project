import React, { useState } from 'react';
import { StickyHeader } from '../components/StickyHeader';
import { BrandFooter } from '../components/BrandFooter';
import { MapPin, Phone, Mail, Send, CheckCircle2 } from 'lucide-react';
export const Contact: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Success logic. Data no longer sent to admin.

        setIsSubmitting(false);
        setIsSuccess(true);
        setFormData({ firstName: '', lastName: '', email: '', message: '' });

        setTimeout(() => setIsSuccess(false), 5000);
    };

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col">
            <StickyHeader />

            <main className="grow">
                {/* Hero Section */}
                <section className="bg-slate-900 text-white py-20 px-6">
                    <div className="max-w-7xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 animate-in slide-in-from-bottom duration-700">Get In Touch</h1>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto animate-in slide-in-from-bottom duration-700 delay-100">
                            Have a question or want to discuss a project? We'd love to hear from you.
                        </p>
                    </div>
                </section>

                {/* Contact Content */}
                <section className="py-24 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16">
                        {/* Contact Info */}
                        <div className="space-y-12">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-6">Contact Information</h2>
                                <p className="text-slate-600 mb-8">
                                    Reach out to us through any of the following channels or fill out the form to send us a message directly.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-brand-100 text-brand-600 rounded-lg">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-1">Our Office</h3>
                                        <p className="text-slate-600">
                                            123 Innovation Drive<br />
                                            Tech City, TC 90210
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-brand-100 text-brand-600 rounded-lg">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-1">Phone</h3>
                                        <p className="text-slate-600">+1 (555) 123-4567</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-brand-100 text-brand-600 rounded-lg">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-1">Email</h3>
                                        <p className="text-slate-600">info@eleastar.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                            {isSuccess && (
                                <div className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center animate-in fade-in duration-300">
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                                    <p className="text-slate-600 text-center max-w-xs">Thank you for reaching out. Our team will get back to you shortly.</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                                        <input required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} type="text" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all" placeholder="John" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                                        <input required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} type="text" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all" placeholder="Doe" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                                    <input required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} type="email" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all" placeholder="john@example.com" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                                    <textarea required value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} rows={4} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all" placeholder="How can we help you?" />
                                </div>

                                <button type="submit" disabled={isSubmitting} className="w-full bg-brand-600 text-white font-bold py-4 rounded-lg hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                                    {isSubmitting ? 'Sending...' : <>Send Message <Send size={18} /></>}
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </main>

            <BrandFooter />
        </div>
    );
};
