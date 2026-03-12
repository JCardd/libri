'use client';

import {Mic, MicOff} from "lucide-react";
import useVapi from "@/hooks/useVapi";
import {IBook} from "@/types";
import Image from "next/image";
import React from "react";
import Transcript from "@/components/Transcript";

const VapiControls = ({ book } : { book: IBook }) => {
    const { status, isActive, messages, currentMessage, currentUserMessage, duration, start, stop } = useVapi(book);

    return (
        <>
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
                {/* Header Card */}
                <div className="vapi-header-card">
                    <div className="vapi-cover-wrapper">
                        <Image
                            src={book.coverURL}
                            alt={book.title}
                            width={120}
                            height={180}
                            className="vapi-cover-image"
                        />
                        <div className="vapi-mic-wrapper">
                            {(status === 'speaking' || status === 'thinking') && (
                                <div className="vapi-pulse-ring" />
                            )}
                            <button
                                onClick={isActive ? stop : start}
                                disabled={status === 'connecting'}
                                className={`vapi-mic-btn shadow-md ${isActive ? 'vapi-mic-btn-active' : 'vapi-mic-btn-inactive'}`}
                            >
                                {isActive ? (
                                    <Mic className="w-6 h-6 text-white" />
                                ) : (
                                    <MicOff className="w-6 h-6 text-[#212a3b]" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold font-serif text-[#212a3b]">
                                {book.title}
                            </h1>
                            <p className="text-[#3d485e] text-sm md:text-base">
                                by {book.author}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <div className="vapi-status-indicator">
                                <span className={`vapi-status-dot vapi-status-dot-${status}`}></span>
                                <span className="vapi-status-text capitalize">{status}</span>
                            </div>
                            <div className="vapi-status-indicator">
                                <span className="vapi-status-text">Voice: {book.persona || 'Daniel'}</span>
                            </div>
                            <div className="vapi-status-indicator">
                                <span className="vapi-status-text">{Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}/15:00</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="vapi-transcript-wrapper">
                    <Transcript
                        messages={messages}
                        currentMessage={currentMessage}
                        currentUserMessage={currentUserMessage}
                    />
                </div>
            </div>
        </>
    )
}
export default VapiControls
