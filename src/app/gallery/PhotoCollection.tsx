"use client"

import Image from "next/image"
import { useState, useEffect } from "react"

interface PhotoData {
    directory: string,
    filenames: string[],
}

interface MasonryColumn {
    id: number;
    items: string[];
}

export default function PhotoCollection(props: PhotoData) {
    const [columns, setColumns] = useState<MasonryColumn[]>([]);
    const [columnCount, setColumnCount] = useState(3);
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

    useEffect(() => {
        const updateColumnCount = () => {
            if (window.innerWidth < 640) setColumnCount(1);
            else if (window.innerWidth < 1024) setColumnCount(2);
            else setColumnCount(3);
        };

        updateColumnCount();
        window.addEventListener('resize', updateColumnCount);
        return () => window.removeEventListener('resize', updateColumnCount);
    }, []);

    useEffect(() => {
        const newColumns: MasonryColumn[] = Array.from({ length: columnCount }, (_, i) => ({
            id: i,
            items: []
        }));

        props.filenames.forEach((filename, index) => {
            const columnIndex = index % columnCount;
            newColumns[columnIndex].items.push(filename);
        });

        setColumns(newColumns);
    }, [props.filenames, columnCount]);

    const handleImageLoad = (filename: string) => {
        setLoadedImages(prev => new Set(prev).add(filename));
    };

    return (
        <div className="w-full px-4">
            <div className="flex gap-4">
                {columns.map(column => (
                    <div key={column.id} className="flex-1 flex flex-col gap-4">
                        {column.items.map((filename) => (
                            <div key={filename} className="relative w-full">
                                <div className={`relative w-full ${!loadedImages.has(filename) ? 'bg-gray-200 animate-pulse' : ''}`}>
                                    <Image
                                        className={`rounded-lg transition-opacity duration-300 ${loadedImages.has(filename) ? 'opacity-100' : 'opacity-0'}`}
                                        src={`${props.directory}/${filename}`}
                                        alt=""
                                        width={1000}
                                        height={1000}
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                        }}
                                        priority={column.id === 0}
                                        onLoadingComplete={() => handleImageLoad(filename)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}