import Image from 'next/image'

export default function ProfilePic() {
    return (
        <div className='flex items-center justify-center -order-1 md:-order-1'>
            <div className="relative w-48 md:w-64 lg:w-80 h-48 md:h-64 lg:h-80">
                <Image
                    className="w-full h-full object-cover"
                    src='/general_images/suited.jpg'
                    alt=""
                    fill
                />
                <div 
                    className="absolute inset-0 bg-contain bg-center"
                    style={{
                        backgroundImage: "url('/image_frame.svg')"
                    }}
                />
            </div>
        </div>
    )
}