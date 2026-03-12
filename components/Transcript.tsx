'use client';

import React, { useEffect, useRef } from 'react';
import { Mic } from "lucide-react";
import { Messages } from "@/types";

interface TranscriptProps {
    messages: Messages[];
    currentMessage?: string;
    currentUserMessage?: string;
}

const Transcript = ({ messages, currentMessage, currentUserMessage }: TranscriptProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages or streaming updates
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, currentMessage, currentUserMessage]);

    const isEmpty = messages.length === 0 && !currentMessage && !currentUserMessage;

    if (isEmpty) {
        return (
            <div className="transcript-container min-h-[400px]">
                <div className="transcript-empty">
                    <Mic className="w-12 h-12 text-[#212a3b] mb-4" />
                    <p className="transcript-empty-text">No conversation yet</p>
                    <p className="transcript-empty-hint">Click the mic button above to start talking</p>
                </div>
            </div>
        );
    }

    return (
        <div className="transcript-container min-h-[400px]">
            <div className="transcript-messages" ref={scrollRef}>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`transcript-message ${
                            message.role === 'user' ? 'transcript-message-user' : 'transcript-message-assistant'
                        }`}
                    >
                        <div
                            className={`transcript-bubble ${
                                message.role === 'user' ? 'transcript-bubble-user' : 'transcript-bubble-assistant'
                            }`}
                        >
                            {message.content}
                        </div>
                    </div>
                ))}

                {/* Streaming User Message */}
                {currentUserMessage && (
                    <div className="transcript-message transcript-message-user">
                        <div className="transcript-bubble transcript-bubble-user">
                            {currentUserMessage}
                            <span className="transcript-cursor" />
                        </div>
                    </div>
                )}

                {/* Streaming Assistant Message */}
                {currentMessage && (
                    <div className="transcript-message transcript-message-assistant">
                        <div className="transcript-bubble transcript-bubble-assistant">
                            {currentMessage}
                            <span className="transcript-cursor" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Transcript;
