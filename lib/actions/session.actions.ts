'use server';

import {EndSessionResult, StartSessionResult} from "@/types";
import {connectToDatabase} from "@/database/mongoose";
import VoiceSession from "@/database/models/voice-session.model";
import {getCurrentBillingPeriodStart, PLAN_LIMITS} from "@/lib/subscription-constants";
import {getPlanLimits} from "@/lib/plan-utils";

export const startVoiceSession = async (clerkId: string, bookId: string): Promise<StartSessionResult> => {
    try {
        await connectToDatabase();

        // Limits/Plan to see whether a session is allowed.
        const limits = await getPlanLimits();
        const billingPeriodStart = getCurrentBillingPeriodStart();

        const sessionCount = await VoiceSession.countDocuments({
            clerkId,
            billingPeriodStart,
        });

        if (sessionCount >= limits.maxSessionsPerMonth) {
            return {
                success: false,
                error: `You've reached your monthly limit of ${limits.maxSessionsPerMonth} sessions. Please upgrade your plan.`,
                isBillingError: true,
            }
        }

        const sessions = await VoiceSession.create({
            clerkId,
            bookId,
            startedAt: new Date(),
            billingPeriodStart,
            durationSeconds: 0,
        });

        return {
            success: true,
            sessionId: sessions._id.toString(),
            maxDurationMinutes: limits.maxDurationPerSession,
        }
    } catch (e) {
        console.error('Error starting voice session', e);
        return {
            success: false,
            error: 'Failed to start voice session.',
        }
    }
}

export const endVoiceSession = async (sessionId: string, durationSeconds: number): Promise<EndSessionResult> => {
    try {
        await connectToDatabase();

        const result = await VoiceSession.findByIdAndUpdate(sessionId, {
            endedAt: new Date(),
            durationSeconds,
        });

        if(!result) return { success: false, error: 'Voice session not found.' }

        return {
            success: true,
        }
    } catch (e) {
        console.error('Error ending voice session', e);
        return {
            success: false,
            error: 'Failed to end voice session.',
        }
    }
}