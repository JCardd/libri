import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getBookBySlug } from '@/lib/actions/book.actions';
import { ArrowLeft, MicOff, Mic } from 'lucide-react';
import VapiControls from "@/components/VapiControls";

const BookDetailsPage = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params;
  const { slug } = params;
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const result = await getBookBySlug(slug);

  if (!result.success || !result.data) {
    redirect('/');
  }

  const book = result.data;

  return (
    <div className="book-page-container">
      <Link href="/" className="back-btn-floating">
        <ArrowLeft className="w-5 h-5 text-[#212a3b]" />
      </Link>

      <VapiControls book={book}/>
    </div>
  );
};

export default BookDetailsPage;
