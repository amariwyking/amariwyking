"use client";

import { Blog } from "@/app/types/blogs";
import { useState } from "react";
import BlogPostCard from "./BlogPostCard";
import { BlogPostListProps } from "@/app/types/blogs";

const header = 'Ideas become valuable once they are shared with the world.';
const description =
    `In the heat of the light, ideas can be scrutinized, tested, validated, revised, or jettisoned.
    
    Here I share my long-form thoughts on concepts and ideas that I think are worth expanding upon. Topics include software development, urban science, photography, and geopolitics.
    `;

export default async function BlogPostList(props: BlogPostListProps) {
    const [selectedBlogPost, setSelectedBlogPost] = useState<Blog | null>(null);

    const handleBlogPostSelect = (blogPost: Blog) => {
        setSelectedBlogPost(blogPost);

        window.history.pushState({}, '', `/blog/${blogPost.slug}`)
    };

    const blogsList = props.blogsList;

    return (
        <div className="my-6 justify-center flex-row space-y-6 lg:ml-6">
            {
                blogsList.map((blogPostData) => (
                    <BlogPostCard
                        key={blogPostData.id}
                        onBlogPostSelected={handleBlogPostSelect}
                        blog={blogPostData}
                    />
                ))
            }
        </div>
    );
}