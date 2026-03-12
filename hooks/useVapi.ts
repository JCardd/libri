import {IBook, Messages} from "@/types";
import {useAuth} from "@clerk/nextjs";
import {useEffect, useRef, useState} from "react";
import {ASSISTANT_ID} from "@/lib/constants";
import {endVoiceSession, startVoiceSession} from "@/lib/actions/session.actions";
import Vapi from '@vapi-ai/web';

export type CallStatus = 'idle' | 'connecting' | 'starting' | 'listening' | 'thinking' | 'speaking';

interface VapiTranscriptMessage {
    type: 'transcript';
    role: 'user' | 'assistant';
    transcriptType: 'partial' | 'final';
    transcript: string;
}

const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY;

let vapi: InstanceType<typeof Vapi>;

function getVapi() {
    if (!vapi) {
        if (!VAPI_API_KEY) {
            throw new Error('NEXT_PUBLIC_VAPI_API_KEY is not found. Please set it in your .env file.');
        }

        vapi = new Vapi(VAPI_API_KEY);
    }

    return vapi;
}

export const useVapi = (book: IBook) => {
    const { userId } = useAuth();

    const [status, setStatus] = useState<CallStatus>('idle')
    const [messages, setMessages] = useState<Messages[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [currentUserMessage, setCurrentUserMessage] = useState('');
    const [duration] = useState(0);
    const [, setLimitError] = useState<string | null>(null);

    const sessionIdRef = useRef<string | null>(null);
    const isStoppingRef = useRef<boolean>(false);

    const isActive = status === 'listening' || status === 'thinking' || status === 'speaking' || status === 'starting';

    useEffect(() => {
        const v = getVapi();

        const onCallStart = () => {
            setStatus('listening');
            console.log('Call started');
        }

        const onCallEnd = () => {
            setStatus('idle');
            setMessages([]);
            setCurrentMessage('');
            setCurrentUserMessage('');
            console.log('Call ended');
        }

        const onSpeechStart = () => {
            setStatus('speaking');
            console.log('Assistant speech started');
        }

        const onSpeechEnd = () => {
            setStatus('listening');
            console.log('Assistant speech ended');
        }

        const onMessage = (message: VapiTranscriptMessage | { type: string; [key: string]: unknown }) => {
            if (message.type === 'transcript') {
                const transcriptMsg = message as VapiTranscriptMessage;

                if (transcriptMsg.role === 'user') {
                    if (transcriptMsg.transcriptType === 'partial') {
                        setCurrentUserMessage(transcriptMsg.transcript);
                    } else {
                        setCurrentUserMessage('');
                        setStatus('thinking');

                        setMessages(prev => {
                            const newMessage = { role: 'user', content: transcriptMsg.transcript };
                            // Deduplicate: check if the last message is the same (VAPI sometimes sends duplicates)
                            if (prev.length > 0 &&
                                prev[prev.length - 1].role === 'user' &&
                                prev[prev.length - 1].content === transcriptMsg.transcript) {
                                return prev;
                            }
                            return [...prev, newMessage];
                        });
                    }
                } else if (transcriptMsg.role === 'assistant') {
                    if (transcriptMsg.transcriptType === 'partial') {
                        setCurrentMessage(transcriptMsg.transcript);
                    } else {
                        setCurrentMessage('');
                        setMessages(prev => {
                            const newMessage = { role: 'assistant', content: transcriptMsg.transcript };
                            if (prev.length > 0 &&
                                prev[prev.length - 1].role === 'assistant' &&
                                prev[prev.length - 1].content === transcriptMsg.transcript) {
                                return prev;
                            }
                            return [...prev, newMessage];
                        });
                    }
                }
            }
        }

        const onError = (error: Error | { message: string; [key: string]: unknown }) => {
            console.error('Vapi error:', error);
            setStatus('idle');
        }

        v.on('call-start', onCallStart);
        v.on('call-end', onCallEnd);
        v.on('speech-start', onSpeechStart);
        v.on('speech-end', onSpeechEnd);
        v.on('message', onMessage);
        v.on('error', onError);

        return () => {
            v.removeListener('call-start', onCallStart);
            v.removeListener('call-end', onCallEnd);
            v.removeListener('speech-start', onSpeechStart);
            v.removeListener('speech-end', onSpeechEnd);
            v.removeListener('message', onMessage);
            v.removeListener('error', onError);
        }
    }, []);

    const start = async () => {
        if(!userId) return setLimitError('Please sign in to start a conversation.');

        setLimitError(null);
        setStatus('connecting');

        try {
            const result = await startVoiceSession(userId, book._id);

            if(!result.success) {
                setLimitError(result.error || 'Session limit reached. Please upgrade your plan.');
                setStatus('idle');
                return;
            }

            sessionIdRef.current = result.sessionId || null;

            const firstMessage = `Hey, good to meet you. Quick question, before we dive in: have you actually 
            ${book.title} yet? Or are we starting fresh?`

            await getVapi().start(ASSISTANT_ID, {
                firstMessage,
                variableValues: {
                    title: book.title, author: book.author, bookId: book._id,
                },
                //voice: {
                //    provider: '11labs' as const,
                //    voiceId: getVoice(voice).id,
                //    model: 'eleven_turbo_v2_5' as const,
                //    stability: VOICE_SETTINGS.stability,
                //    similarityBoost: VOICE_SETTINGS.similarityBoost,
                //    style: VOICE_SETTINGS.style,
                //    useSpeakerBoost: VOICE_SETTINGS.useSpeakerBoost,
                //}
            })
        } catch (e) {
            console.error('Error starting call:', e);
            if (sessionIdRef.current) {
                endVoiceSession(sessionIdRef.current, 0).catch((endErr) => console.error('Failed to rollback voice session after start failure:', endErr));
                sessionIdRef.current = null;
            }
            setStatus('idle');
            setLimitError('An error occurred while starting the call.');
        }
    }
    const stop = async () => {
        isStoppingRef.current = true;
        await getVapi().stop();
    }
    const clearErrors = async () => {

    }

    return {
        status, isActive, messages, currentMessage, currentUserMessage, duration, start, stop, clearErrors,
        //maxDurationSeconds, remainingSeconds, showTimeWarning
    }

}

export default useVapi;