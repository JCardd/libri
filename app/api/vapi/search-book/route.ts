import { NextResponse } from 'next/server';
import { searchBookSegments } from '@/lib/actions/book.actions';
import { IBookSegment } from '@/types';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message } = body;

        if (!message || message.type !== 'tool-calls' || !message.toolCalls) {
            return NextResponse.json({ error: 'Invalid Vapi tool call message' }, { status: 400 });
        }

        const toolCall = message.toolCalls.find((call: any) => call.function.name === 'search book');

        if (!toolCall) {
            return NextResponse.json({ error: 'No "search book" tool call found' }, { status: 400 });
        }

        const { bookId, query } = toolCall.function.arguments;

        if (!bookId || !query) {
            return NextResponse.json({ error: 'Missing bookId or query parameter' }, { status: 400 });
        }

        const result = await searchBookSegments(bookId, query, 3);

        if (!result.success || !result.data || result.data.length === 0) {
            return NextResponse.json({
                results: [
                    {
                        toolCallId: toolCall.id,
                        result: 'no information found about this topic',
                    },
                ],
            });
        }

        const combinedSegments = result.data
            .map((segment: IBookSegment) => segment.content)
            .join('\n\n');

        return NextResponse.json({
            results: [
                {
                    toolCallId: toolCall.id,
                    result: combinedSegments,
                },
            ],
        });

    } catch (error) {
        console.error('Error in search-book API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
