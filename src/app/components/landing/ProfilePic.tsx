import { Avatar } from '../../MTailwind'

import Image from 'next/image'

export default function ProfilePic() {
    return (
        <div className='flex items-center justify-center order-1 md:order-2'>
            <Image
                className="h-auto max-w-full rounded-full"
                src="https://hmaruxdkibsjvhit.public.blob.vercel-storage.com/amaricentralpark-jDbY6NzedmqovP6SSm5wmsyK6lNoue.jpeg"
                alt=""
                width={280}
                height={280}
            />
            {/* <Avatar src='https://hmaruxdkibsjvhit.public.blob.vercel-storage.com/amaricentralpark-jDbY6NzedmqovP6SSm5wmsyK6lNoue.jpeg' size='xxl' alt='Amari' placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} /> */}
        </div>
    )
}