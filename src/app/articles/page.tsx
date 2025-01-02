import React from "react";
import MainContainer from "../components/MainContainer";
import ArticleCard from "../components/articles/ArticleCard";
import { getSortedPostsData } from "../lib/posts"

const header = 'Ideas become valuable once they are shared with the world.'
const description =
    `In the heat of the light, ideas can be scrutinized, tested, validated, revised, or jettisoned.
    
    Here I share my long-form thoughts on concepts and ideas that I think are worth expanding upon. Topics include software development, urban science, photography, and geopolitics.
    `

export default async function ArticlesPage() {
    const blogPostsData = getSortedPostsData()

    console.log(blogPostsData)

    return (
        <div className="flex justify-center">
            <MainContainer header={header} description={description}>
                <div className="my-6 justify-center flex-row space-y-6 lg:ml-6">
                    {
                        blogPostsData.map((articleProps) => (
                            <ArticleCard key={articleProps.id} {...articleProps} />
                        ))
                    }
                </div>

            </MainContainer>
        </div>
    )
}