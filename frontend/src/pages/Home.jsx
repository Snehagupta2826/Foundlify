import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, ArrowRight } from 'lucide-react';

const Home = () => {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative bg-indigo-50 overflow-hidden min-h-[80vh] flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                    <div className="text-center max-w-3xl mx-auto pt-16 pb-24">
                        <span className="inline-block py-1 px-3 rounded-full bg-indigo-200 text-indigo-800 text-sm font-bold tracking-wider mb-6">WELCOME TO FOUNDIFY</span>
                        <h1 className="text-5xl tracking-tight font-black text-slate-900 sm:text-6xl md:text-7xl mb-6">
                            <span className="block">Lost something?</span>
                            <span className="block mt-2 text-indigo-600">Let's find it together.</span>
                        </h1>
                        <p className="mt-6 text-lg text-slate-600 md:text-xl leading-relaxed max-w-2xl mx-auto">
                            The smartest way to recover your lost belongings. Join our community-driven platform to report lost items or help return found ones to their rightful owners.
                        </p>
                        <div className="mt-10 sm:flex sm:justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                            <Link to="/register" className="group w-full sm:w-auto flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 transform hover:-translate-y-1 transition-all duration-300">
                                Report Lost Item
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/register" className="w-full sm:w-auto flex items-center justify-center px-8 py-4 border-2 border-indigo-200 text-lg font-bold rounded-2xl text-indigo-700 bg-white/50 backdrop-blur-sm hover:bg-indigo-100 hover:border-indigo-300 transform hover:-translate-y-1 transition-all duration-300 shadow-md">
                                Report Found Item
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-24 bg-white relative z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-sm text-indigo-600 font-black tracking-widest uppercase mb-2">Features</h2>
                        <p className="text-4xl font-extrabold text-slate-900 sm:text-5xl">
                            A better way to find lost items
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        
                        <div className="group relative p-8 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 transform hover:-translate-y-2">
                            <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg mb-6 transform group-hover:scale-110 transition-transform duration-300">
                                <Search size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Matching</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Our system automatically suggests matches between lost and found items based on categories, colors, and keywords.
                            </p>
                        </div>

                        <div className="group relative p-8 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 transform hover:-translate-y-2">
                            <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg mb-6 transform group-hover:scale-110 transition-transform duration-300">
                                <MapPin size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Location Based</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Filter and search for items based on where they were lost or found to narrow down possibilities quickly.
                            </p>
                        </div>

                        <div className="group relative p-8 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 transform hover:-translate-y-2">
                            <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg mb-6 transform group-hover:scale-110 transition-transform duration-300">
                                <Calendar size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Real-time Alerts</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Get notified instantly when someone reports an item that matches your lost item description.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
