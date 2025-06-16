interface SectionTitleProps {
    title: string;
}

export default function SectionTitle({title}: SectionTitleProps) {
    return (
        <div className="section-title font-kode-mono font-[700] absolute top-8 left-8 text-4xl sm:text-6xl md:text-9xl text-zinc-300 pointer-events-none">
            {title}
        </div>
    )
}