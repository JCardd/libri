import React from 'react'
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";

const Hero = () => {
    return (
        <section className="px-6 pt-24 pb-12 w-full max-w-[1440px] mx-auto mb-10 md:mb-16">
            <div className="bg-[#dccfb4] rounded-[24px] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                {/* Left Section */}
                <div className="flex-1 z-10 space-y-4">
                    <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1a1a1a]">
                        Your Library
                    </h1>
                    <p className="text-[#4a4a4a] text-base max-w-sm leading-relaxed">
                        Convert your books into interactive AI conversations. Listen, learn, and discuss your favorite reads.
                    </p>
                    <Link 
                        href="/books/new" 
                        className="inline-flex items-center gap-2 bg-[#e0e0e0] hover:bg-[#d0d0d0] text-[#1a1a1a] px-6 py-3 rounded-xl font-bold transition-colors shadow-sm"
                    >
                        <Plus size={20} className="stroke-[3px]" />
                        <span className="text-base">Add new book</span>
                    </Link>
                </div>

                {/* Center Section - Illustration */}
                <div className="flex-1 flex justify-center items-center z-10">
                    <div className="relative w-full max-w-[320px] aspect-[4/3] flex items-center justify-center">
                        <Image 
                            src="/assets/hero-illustration.png" 
                            alt="Vintage books and globe illustration"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                {/* Right Section - Steps Card */}
                <div className="flex-shrink-0 z-10">
                    <div className="bg-[#e8e8e8]/90 backdrop-blur-sm p-5 rounded-[24px] w-full min-w-[260px] shadow-sm space-y-5">
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full border border-[#1a1a1a] flex items-center justify-center font-medium text-[#1a1a1a] text-sm">
                                1
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="font-bold text-[#1a1a1a] text-base">Upload PDF</h3>
                                <p className="text-[#4a4a4a] text-sm">Add your book file</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full border border-[#1a1a1a] flex items-center justify-center font-medium text-[#1a1a1a] text-sm">
                                2
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="font-bold text-[#1a1a1a] text-base">AI Processing</h3>
                                <p className="text-[#4a4a4a] text-sm">We analyze the content</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full border border-[#1a1a1a] flex items-center justify-center font-medium text-[#1a1a1a] text-sm">
                                3
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="font-bold text-[#1a1a1a] text-base">Voice Chat</h3>
                                <p className="text-[#4a4a4a] text-sm">Discuss with AI</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero
