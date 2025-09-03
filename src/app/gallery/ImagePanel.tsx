'use client';

import { Festive } from 'next/font/google';
import Image from 'next/image'

export default function ImagePanel() {
    return (
        <div className='flex flex-col'>
            <div>
                <Image
                    className="h-auto max-w-(--breakpoint-xl) object-cover object-center"
                    src="https://hmaruxdkibsjvhit.public.blob.vercel-storage.com/Loft%20on%20West%204th-fPQs0movvK8VSXAtYSErhVHktFzJMa.jpg"
                    alt="nature image"
                    width={1200}
                    height={800}
                />
            </div>

            <div className='justify-self-start'>
                <div className='flex flex-row gap-x-8 text-sm'>
                    <p>ISO 400</p>
                    <p>1/1000s</p>
                    <p>f/5.6</p>
                    <p>18 mm</p>
                </div>

                <div>
                    <p></p>
                </div>
            </div>

        </div>
    )
}