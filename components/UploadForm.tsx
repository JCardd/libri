'use client';

import React, {useState, useRef, useEffect} from 'react'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import * as z from 'zod'
import {Upload, Image as ImageIcon, X} from 'lucide-react'
import {cn, parsePDFFile} from '@/lib/utils'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {Input} from '@/components/ui/input'
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group'
import LoadingOverlay from '@/components/LoadingOverlay'
import {useAuth, useUser} from "@clerk/nextjs";
import {toast} from 'sonner';
import {checkBookExists, createBook, saveBookSegments} from "@/lib/actions/book.actions";
import {useRouter} from "next/navigation";
import {upload} from "@vercel/blob/client";
import {ACCEPTED_IMAGE_TYPES, ACCEPTED_PDF_TYPES, MAX_FILE_SIZE, MAX_IMAGE_SIZE} from "@/lib/constants";

const formSchema = z.object({
    pdfFile: z.instanceof(File, { message: "PDF file is required" })
        .refine((file) => file.size <= MAX_FILE_SIZE, "File size must be less than 50MB")
        .refine((file) => ACCEPTED_PDF_TYPES.includes(file.type), "Only PDF files are accepted"),
    coverImage: z.instanceof(File).optional()
        .refine((file) => !file || file.size <= MAX_IMAGE_SIZE, "Image size must be less than 10MB")
        .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), "Only .jpg, .jpeg, .png and .webp formats are supported"),
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    author: z.string().min(1, "Author name is required").max(100, "Author name is too long"),
    persona: z.string().min(1, "Please select a voice"),
})

const voices = [
    {
        group: 'Male Voices',
        options: [
            {id: 'dave', name: 'Dave', description: 'Young male, British-Essex, casual & conversational'},
            {id: 'daniel', name: 'Daniel', description: 'Middle-aged male, British, authoritative but warm'},
            {id: 'chris', name: 'Chris', description: 'Male, casual & easy-going'},
        ]
    },
    {
        group: 'Female Voices',
        options: [
            {id: 'rachel', name: 'Rachel', description: 'Young female, American, calm & clear'},
            {id: 'sarah', name: 'Sarah', description: 'Young female, American, soft & approachable'},
        ]
    }
]

const UploadForm = () => {
    const [isClient, setIsClient] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const {userId} = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        setIsClient(true)
    }, [])
    const pdfInputRef = useRef<HTMLInputElement>(null)
    const coverInputRef = useRef<HTMLInputElement>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            author: "",
            persona: "",
            pdfFile: undefined,
            coverImage: undefined,
        },
    })

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        if (!userId) {
            return toast.error("Please login to upload books.")
        }

        setIsSubmitting(true)

        //PostHog => Track Book Uploads

        try {
            const existsCheck = await checkBookExists(data.title);

            if (existsCheck.exists && existsCheck.book) {
                toast.info("Book with the same title already exists.");
                form.reset()
                router.push(`/books/${existsCheck.book.slug}`)
                return;
            }

            const fileTitle = data.title.replace(/\s+/g, '-').toLowerCase();
            const pdfFile = data.pdfFile;

            const parsedPDF = await parsePDFFile(pdfFile);

            if (parsedPDF.content.length === 0) {
                toast.error("Failed to parse PDF. Please try again with a different file.");
                return;
            }

            const uploadedPdfBlob = await upload(fileTitle, pdfFile, {
                access: 'public',
                handleUploadUrl: '/api/upload',
                contentType: 'application/pdf',
            });

            let coverURL: string;

            if (data.coverImage) {
                const coverFile = data.coverImage;
                const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, coverFile, {
                    access: 'public',
                    handleUploadUrl: '/api/upload',
                    contentType: coverFile.type
                });
                coverURL = uploadedCoverBlob.url;
            } else {
                const response = await fetch(parsedPDF.cover)
                const blob = await response.blob();

                const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, blob, {
                    access: 'public',
                    handleUploadUrl: '/api/upload',
                    contentType: 'image/png'
                });
                coverURL = uploadedCoverBlob.url;
            }

            const result = await createBook({
                clerkId: userId,
                title: data.title,
                author: data.author,
                persona: data.persona,
                fileURL: uploadedPdfBlob.url,
                fileBlobKey: uploadedPdfBlob.pathname,
                coverURL: coverURL,
                fileSize: pdfFile.size,
            });

            if (!result.success) {
                toast.error(result.error as string || "Failed to create book. Please try again.");
                if (result.isBillingError) {
                    router.push("/subscriptions");
                }
                return;
            }

            const book = result;

            if (book.alreadyExists) {
                toast.info("Book with the same title already exists.");
                form.reset()
                router.push(`/books/${book.data.slug}`);
                return;
            }

            const segments = await saveBookSegments(book.data._id, userId, parsedPDF.content);

            if (!segments.success) {
                toast.error("Failed to save book segments");
                throw new Error("Failed to save book segments");
            }

            form.reset();
            router.push('/');
        } catch (error) {
            console.log(error);

            toast.error("Failed to upload book. Please try again later.")
        } finally {
            setIsSubmitting(false);
        }

    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'pdfFile' | 'coverImage') => {
        const file = e.target.files?.[0]
        if (file) {
            form.setValue(fieldName, file, {shouldValidate: true})
        }
    }

    const removeFile = (fieldName: 'pdfFile' | 'coverImage') => {
        form.setValue(fieldName, undefined as unknown as File)
        if (fieldName === 'pdfFile' && pdfInputRef.current) pdfInputRef.current.value = ''
        if (fieldName === 'coverImage' && coverInputRef.current) coverInputRef.current.value = ''
    }

    if (!isClient) return null;

    return (
        <>
            {isSubmitting && <LoadingOverlay/>}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* PDF File Upload */}
                    <FormField
                        control={form.control}
                        name="pdfFile"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="form-label">Book PDF File</FormLabel>
                                <FormControl>
                                    <div
                                        className={cn("upload-dropzone", field.value && "upload-dropzone-uploaded")}
                                        onClick={() => pdfInputRef.current?.click()}
                                    >
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            className="hidden"
                                            ref={pdfInputRef}
                                            onChange={(e) => handleFileChange(e, 'pdfFile')}
                                        />
                                        {field.value ? (
                                            <div className="flex flex-col items-center">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="upload-dropzone-text line-clamp-1 max-w-[300px]">{field.value.name}</span>
                                                    <span
                                                        role="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeFile('pdfFile');
                                                        }}
                                                        className="upload-dropzone-remove cursor-pointer"
                                                    >
                             <X size={20}/>
                           </span>
                                                </div>
                                                <span className="upload-dropzone-hint">PDF file selected</span>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="upload-dropzone-icon"/>
                                                <span className="upload-dropzone-text">Click to upload PDF</span>
                                                <span className="upload-dropzone-hint">PDF file (max 50MB)</span>
                                            </>
                                        )}
                                    </div>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Cover Image Upload */}
                    <FormField
                        control={form.control}
                        name="coverImage"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="form-label">Cover Image (Optional)</FormLabel>
                                <FormControl>
                                    <div
                                        className={cn("upload-dropzone", field.value && "upload-dropzone-uploaded")}
                                        onClick={() => coverInputRef.current?.click()}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            ref={coverInputRef}
                                            onChange={(e) => handleFileChange(e, 'coverImage')}
                                        />
                                        {field.value ? (
                                            <div className="flex flex-col items-center">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="upload-dropzone-text line-clamp-1 max-w-[300px]">{field.value.name}</span>
                                                    <span
                                                        role="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeFile('coverImage');
                                                        }}
                                                        className="upload-dropzone-remove cursor-pointer"
                                                    >
                             <X size={20}/>
                           </span>
                                                </div>
                                                <span className="upload-dropzone-hint">Cover image selected</span>
                                            </div>
                                        ) : (
                                            <>
                                                <ImageIcon className="upload-dropzone-icon"/>
                                                <span
                                                    className="upload-dropzone-text">Click to upload cover image</span>
                                                <span className="upload-dropzone-hint">Leave empty to auto-generate from PDF</span>
                                            </>
                                        )}
                                    </div>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Title Input */}
                    <FormField
                        control={form.control}
                        name="title"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="form-label">Title</FormLabel>
                                <FormControl>
                                    <Input
                                        className="form-input"
                                        placeholder="ex: Rich Dad Poor Dad"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Author Input */}
                    <FormField
                        control={form.control}
                        name="author"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="form-label">Author Name</FormLabel>
                                <FormControl>
                                    <Input
                                        className="form-input"
                                        placeholder="ex: Robert Kiyosaki"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Voice Selector */}
                    <FormField
                        control={form.control}
                        name="persona"
                        render={({field}) => (
                            <FormItem className="space-y-4">
                                <FormLabel className="form-label">Choose Assistant Voice</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="space-y-6"
                                    >
                                        {voices.map((group) => (
                                            <div key={group.group} className="space-y-3">
                                                <h4 className="text-[#777] font-medium text-sm uppercase tracking-wider">{group.group}</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {group.options.map((voice) => (
                                                        <FormItem key={voice.id}>
                                                            <FormControl>
                                                                <RadioGroupItem
                                                                    value={voice.id}
                                                                    id={voice.id}
                                                                    className="sr-only"
                                                                />
                                                            </FormControl>
                                                            <FormLabel
                                                                className={cn(
                                                                    "voice-selector-option block h-full",
                                                                    field.value === voice.id ? "voice-selector-option-selected" : "voice-selector-option-default"
                                                                )}
                                                                htmlFor={voice.id}
                                                            >
                                                                <div className="flex flex-col h-full">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <div className={cn(
                                                                            "w-4 h-4 rounded-full border flex items-center justify-center",
                                                                            field.value === voice.id ? "border-[#663820] bg-[#663820]" : "border-gray-300"
                                                                        )}>
                                                                            {field.value === voice.id && <div
                                                                                className="w-1.5 h-1.5 rounded-full bg-white"/>}
                                                                        </div>
                                                                        <span
                                                                            className="font-bold text-lg text-[#212a3b]">{voice.name}</span>
                                                                    </div>
                                                                    <p className="text-xs text-[#777] leading-relaxed">{voice.description}</p>
                                                                </div>
                                                            </FormLabel>
                                                        </FormItem>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Submit Button */}
                    <button type="submit" className="form-btn">
                        Begin Synthesis
                    </button>
                </form>
            </Form>
        </>
    )
}

export default UploadForm
