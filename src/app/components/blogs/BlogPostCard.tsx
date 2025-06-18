"use client"

import { BlogCardProps as BlogPostCardProps } from "@/app/types/blogs";
import { NavArrowRight } from "iconoir-react";
import Link from "next/link";
import React from "react";

const formatDate = (dateStr: string) => {
    // Create the UTC date
    const utcDate = new Date(dateStr);

    const estDate = new Date(
        utcDate.getUTCFullYear(),
        utcDate.getUTCMonth(),
        utcDate.getUTCDate(),
        utcDate.getUTCHours(),
        utcDate.getUTCMinutes(),
        utcDate.getUTCSeconds()
      );

    const options: Intl.DateTimeFormatOptions = {
        timeZone: 'America/New_York',
        dateStyle: 'long',
    };
    const formattedDate: string = estDate.toLocaleDateString('en-US', options);

    return formattedDate;
}

export default function BlogPostCard(props: BlogPostCardProps) {
    const blog = props.blog;

    return (
        <div className="flex flex-row">
            <div className="card-date basis-48 lg:py-6 lg:mr-6 text-zinc-400 font-light hidden md:block">
                <p className=" text-right">
                    {formatDate(blog.date)}
                </p>
            </div>
            <div className="card-container max-w-2xl p-4 lg:p-6 text-surface-foreground duration-300">
                <div className="card-body">
                    <p className="card-title text-sm font-semibold tracking-wider uppercase lg:text-base">
                        {blog.title}
                    </p>
                    <p className="card-description text-xs line-clamp-3 my-1 text-zinc-500 lg:text-base">
                        {blog.description}
                    </p>
                </div>
                <div className="card-footer">
                    <Link href={`/blog/${blog.slug}`}>
                        <div className="card-link flex w-fit items-center py-1 lg:my-2 text-emerald-500">
                            <p className="text-xs py-1 lg:text-base">Read More</p>
                            <NavArrowRight className="mx-1 w-4 lg:w-6 " />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}