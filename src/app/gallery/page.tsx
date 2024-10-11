"use client";

import Image from "next/image";

export default function Gallery() {
    return (
        <main className="flex min-h-screen flex-col place-content-center p-8">
            <div className="items-center">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="grid gap-4 justify-center">
                        <div>
                            <Image
                                className="h-auto max-w-full rounded-lg"
                                src="https://hmaruxdkibsjvhit.public.blob.vercel-storage.com/2024_August_22_17-24%201-WgNLJiBNfhDTwg6c804skHDQL2O7tu.jpg"
                                alt=""
                                width={500}
                                height={500} />
                        </div>
                        <div>
                            <Image
                                className="h-auto max-w-full rounded-lg"
                                src="https://hmaruxdkibsjvhit.public.blob.vercel-storage.com/American%20Dreaming-DFCMtRDKjdbES4b2Ie2yPXSrIUNInM.jpg"
                                alt=""
                                width={500}
                                height={500} />
                        </div>
                        <div>
                            <Image
                                className="h-auto max-w-full rounded-lg"
                                src="https://hmaruxdkibsjvhit.public.blob.vercel-storage.com/The%20Ritual-DtI1DkVc9ALPfDliuI1ILeW7NWIiyH.jpg"
                                alt=""
                                width={500}
                                height={500} />
                        </div>
                    </div>
                    <div className="grid gap-4 justify-center">
                        <div>
                            <Image
                                className="h-auto max-w-full rounded-lg"
                                src="https://hmaruxdkibsjvhit.public.blob.vercel-storage.com/Chess%20Player-KHEuZ21QH0piRhhDvEsfTUZZWSPmqs.jpg"
                                alt=""
                                width={500}
                                height={500} />
                        </div>
                        <div>
                            <Image
                                className="h-auto max-w-full rounded-lg"
                                src="https://hmaruxdkibsjvhit.public.blob.vercel-storage.com/Family%20Supper-rojaikXYF841tSepEuyENj20A89IiP.jpg"
                                alt=""
                                width={500}
                                height={500} />
                        </div>
                        <div>
                            <Image
                                className="h-auto max-w-full rounded-lg"
                                src="https://hmaruxdkibsjvhit.public.blob.vercel-storage.com/Gotham%20Morning-5Z45YgZ6AIgh6uVnoiXjbdnAwSoGQR.jpg"
                                alt=""
                                width={500}
                                height={500} />
                        </div>
                    </div>
                    <div className="grid gap-4 justify-center">
                        <div>
                            <Image
                                className="h-auto max-w-full rounded-lg"
                                src="https://hmaruxdkibsjvhit.public.blob.vercel-storage.com/Loft%20on%20West%204th-fPQs0movvK8VSXAtYSErhVHktFzJMa.jpg"
                                alt=""
                                width={500}
                                height={500} />
                        </div>
                        <div>
                            <Image
                                className="h-auto max-w-full rounded-lg"
                                src="https://hmaruxdkibsjvhit.public.blob.vercel-storage.com/Wooden%20Wings-kHNHzsQR7wq7eN3PsT7j5jJEYwIEW8.jpg"
                                alt=""
                                width={500}
                                height={500} />
                        </div>
                        <div>
                            <Image
                                className="h-auto max-w-full rounded-lg"
                                src="https://hmaruxdkibsjvhit.public.blob.vercel-storage.com/Artist's%20Pad-fy6Ti9SPIIrMMLZe7RsqbDFlPzypbl.jpg"
                                alt=""
                                width={500}
                                height={500} />
                        </div>
                    </div>
                    <div
                        className="grid gap-4">
                    </div>
                </div>
            </div>
        </main>
    );
}