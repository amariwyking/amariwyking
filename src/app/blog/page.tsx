import React from "react";
import MainContainer from "../components/MainContainer";
import { getSortedPostsData } from "../lib/posts"
import BlogPostList from "../components/blogs/BlogPostList";

const header = 'Ideas become valuable once they are shared with the world.';
const description =
    `In the heat of the light, ideas can be scrutinized, tested, validated, revised, or jettisoned.
    
    Here I share my long-form thoughts on concepts and ideas that I think are worth expanding upon. Topics include software development, urban science, photography, and geopolitics.
    `;

export default async function BlogPage() {
    const blogPostsData = getSortedPostsData()

    return (
        <div className="flex justify-center">
            <MainContainer header={header} description={description}>
                <BlogPostList blogsList={blogPostsData}/>
            </MainContainer>
        </div>
    );
}