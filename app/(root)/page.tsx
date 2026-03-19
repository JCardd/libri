import React, {Suspense} from 'react'
import Hero from "@/components/Hero";
import BookCard from "@/components/BookCard";
import {getAllBooks} from "@/lib/actions/book.actions";
import Search from "@/components/Search";

export const dynamic = 'force-dynamic';

interface SearchProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const Page = async({ searchParams }: SearchProps) => {
    const query = (await searchParams).query as string;
    const bookResults = await getAllBooks(query)
    const books = bookResults.success ? bookResults.data ?? [] : []

    return (
        <main className="wrapper container">
            <Hero />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold font-serif text-[#212a3b]">Recent Books</h2>
                    <Suspense fallback={<div className="flex items-center bg-white border border-[var(--border-subtle)] rounded-lg overflow-hidden w-full sm:w-80 h-10" />}>
                        <Search />
                    </Suspense>
                </div>

                <div className="library-books-grid">
                    {books.map((book) => (
                        <BookCard key={book._id} title={book.title} author={book.author} coverURL={book.coverURL} slug={book.slug}/>

                    ))}
                </div>
            </div>
        </main>
    )
}
export default Page
