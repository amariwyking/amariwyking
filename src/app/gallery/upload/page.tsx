'use client';

import { type PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';
import { useState, useRef } from 'react';

import Replicate from 'replicate';



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

              const input = {
                image: newBlob.url
              }
              
              console.log('Replicate API Token' + process.env.REPLICATE_API_TOKEN)

              const replicate = new Replicate();
              const output = await replicate.run('zsxkib/blip-3:499bec581d8f64060fd695ec0c34d7595c6824c4118259aa8b0788e0d2d903e1', { input })

              console.log(output)
            }}
          >
            <div className='p-x'>
              <input name='file' ref={inputFileRef} type='file' required />  
              <button type='submit' className='transition duration-300 ease-in-out text-teal-300 hover:text-teal-700 '>Upload</button>
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