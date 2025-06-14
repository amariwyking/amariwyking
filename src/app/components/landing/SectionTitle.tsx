interface SectionTitleProps {
    title: string;
}

export default function SectionTitle({title}: SectionTitleProps) {
    return (
        <div className="section-title font-kode-mono font-[700] absolute top-8 left-8 text-6xl md:text-9xl text-gray-800 opacity-20 pointer-events-none">
            {title}
        </div>
    )
}