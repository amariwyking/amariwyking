'use client';

import { type PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';
import { useState, useRef } from 'react';

export default function GalleryUploadPage() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  return (
    <>
      <main className='flex flex-col items-center min-h-screen place-content-center p-8'>
        <div className='p-4'>
          <span className='type-upload'></span>

          <form className='center py-4'
            onSubmit={async (event) => {
              event.preventDefault();

              if (!inputFileRef.current?.files) {
                throw new Error('No file selected');
              }

              const file = inputFileRef.current.files[0];

              const newBlob = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: '/api/gallery/upload',
              });

              setBlob(newBlob);
            }}
          >
            <div className='p-x'>
              <input name="file" ref={inputFileRef} type="file" required />  
              <button type="submit" className='transition duration-300 ease-in-out text-teal-300 hover:text-teal-700 '>Upload</button>
            </div>
          </form>
          {blob && (
            <div>
              Blob url: <a href={blob.url}>{blob.url}</a>
            </div>
          )}
        </div>
      </main>
    </>
  );
}