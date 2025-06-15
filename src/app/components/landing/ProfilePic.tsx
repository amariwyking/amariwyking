import Image from 'next/image'

export default function ProfilePic() {
    return (
        <div className='flex items-center justify-center -order-1 md:-order-1'>
            <Image
                className="rounded-full w-48 md:w-64 lg:w-80 sm:ring-4 md:ring-8 ring-surface hover:ring-surface-dark transition duration-300 ease-in-out"
                src='/general_images/amaricentralpark.jpg'
                alt=""
                width={280}
                height={280}
            />
        </div>
    )
}