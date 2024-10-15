'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation'


const menuItems = [
    { name: 'human', href: '/' },
    { name: 'developer', href: '/developer' },
    { name: 'photographer', href: '/gallery' },
    { name: 'model', href: '/model' },
];

export default function NavBar() {
    const pathname = usePathname()
    // console.log(pathname)

    // console.log(typeof menuItems)

    // menuItems.find(pathname)

    const name = (menuItems.find(item => item.href === pathname) || {}).name || 'human';

    const [selectedPage, setSelectedPage] = useState(name)

    return (
        <div className='mx-auto flex h-2 items-center justify-center py-20'>
            <div className='group flex cursor-pointer py-2 text-xl'>

                {/* Menu Box */}
                <div className='flex items-center justify-between space-x-2 px-4'>
                    <a className='menu-hover py-2 font-medium text-gray-400 lg:mx-4'>
                        the {selectedPage}
                    </a>
                    <span>
                        <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth='3'
                            stroke='currentColor' className='transition-all ease-in-out h-6 w-6 -rotate-90 group-hover:translate-x-16 duration-300 delay-75'>
                            <path strokeLinecap='round' strokeLinejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' />
                        </svg>
                    </span>
                </div>

                <div className='transition-all ease-in-out opacity-0 z-50 flex w-fit flex-row py-1 px-12 text-gray-800 shadow-xl group-hover:opacity-100 group-hover:translate duration-500'>
                    {menuItems.map((item) => (
                        <a
                            key={item.name}
                            href={item.href}
                            className={`my-2 block font-normal transition-colors mx-2 ${item.name === selectedPage ? 'text-cyan-400' : 'text-gray-500 hover:text-cyan-400'
                                }`}
                            onClick={(e) => {
                                e.preventDefault()
                                setSelectedPage(item.name)
                                // open(item.href)
                                window.location.href = item.href

                            }}
                        >
                            {item.name}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    )
}