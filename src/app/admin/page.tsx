import Link from 'next/link';

export default function Admin() {
    return (
        <section className="resume-section min-h-screen flex items-center justify-center">
            <div className="flex flex-col text-green-600 font-kode-mono items-center gap-8">
                <h1 className="text-4xl font-bold">Add Content</h1>
                <div className="flex flex-col gap-6">
                    <Link href="/gallery/upload" className="rounded-lg bg-green-600 px-5 py-3 text-base font-medium text-zinc-50 hover:scale-105 transition-all duration-200">
                        Upload to Gallery
                    </Link>
                    <div className="flex gap-6">
                    <Link href="/projects/upload" className="rounded-lg bg-green-600 px-5 py-3 text-base font-medium text-zinc-50 hover:scale-105 transition-all duration-200">
                        Upload a Project
                    </Link>
                </div>
                </div>
            </div>
        </section>
    );
}