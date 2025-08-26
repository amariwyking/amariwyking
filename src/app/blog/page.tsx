import React from "react";
import MainContainer from "../components/MainContainer";
import { loadBlogPosts } from "../lib/load-blog-posts"
import BlogPostList from "../components/blogs/BlogPostList";

export default async function BlogPage() {
    const header = 'Ideas departed from the isolation of the mind.';
    const description =
        `In the heat of the light, ideas can be scrutinized, tested, validated, revised, or jettisoned. Here I share my long-form thoughts on concepts and ideas that I think are worth expanding upon. Topics include software development, urban science, photography, and geopolitics.`;

    const allBlogPosts = loadBlogPosts();

    return (
        <div className="flex justify-center py-16">
            <MainContainer header={header} description={description}>
                <BlogPostList blogsList={allBlogPosts} />
            </MainContainer>
        </div>
    );
}