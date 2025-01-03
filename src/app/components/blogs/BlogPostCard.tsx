"use client"

import { BlogCardProps as BlogPostCardProps } from "@/app/types/blogs";
import { Card, Typography, Button } from "@material-tailwind/react";
import { NavArrowRight } from "iconoir-react";
import React from "react";

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    const formattedDate: string = date.toLocaleDateString(undefined, options);

    return formattedDate;
}

export default function BlogPostCard(props: BlogPostCardProps) {
    const blog = props.blog;
    const onBlogPostSelected = props.onBlogPostSelected;

    const openBlogPost = () => {
        onBlogPostSelected(blog)
    }

    return (
        <div className="flex flex-row ring-0 ring-surface lg:ring-0 rounded-xl">
            <div className="basis-48 lg:py-6 lg:mr-6 text-zinc-400 font-light hidden md:block">
                <Typography className=" text-right">
                    {formatDate(blog.date)}
                </Typography>
            </div>
            <Card className="max-w-2xl lg:p-6 text-surface-foreground duration-300">
                <Card.Body>
                    <Typography className="text-sm font-semibold tracking-wider uppercase lg:text-base">
                        {blog.title}
                    </Typography>
                    <Typography className="text-xs line-clamp-3 my-1 text-zinc-500 lg:text-base">
                        {blog.description}
                    </Typography>
                </Card.Body>
                <Card.Footer>
                    <button onClick={openBlogPost}>
                        <div className="flex flex-row items-center py-1 lg:my-2 text-emerald-500">
                            <Typography className="text-xs py-1 lg:text-base">Read More</Typography>
                            <NavArrowRight className="mx-1 w-4 lg:w-6" />
                        </div>
                    </button>
                </Card.Footer>
            </Card>
        </div>
    )
}