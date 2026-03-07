import React from 'react'
import UploadForm from "@/components/UploadForm";

const Page = () => {
    return (
        <main className="wrapper container">
            <div className="new-book-wrapper space-y-10">
                <section className="flex flex-col font-bold">
                    <h1 className="page-title-xl">Add a New Book</h1>
                    <p className="subtitle">Upload a PDF to generate your interactive interview.</p>
                </section>

                <UploadForm />
            </div>
        </main>
    )
}
export default Page
