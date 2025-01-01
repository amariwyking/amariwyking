"use client"

import React from "react";
import MainContainer from "../components/MainContainer";
import ArticleCard from "../components/articles/ArticleCard";

import { Card, Typography, Button } from "@material-tailwind/react";
const header = 'Ideas become valuable once they are shared with the world.'
const description =
    `In the heat of the light, ideas can be scrutinized, tested, validated, revised, or jettisoned.
    
    Here I share my long-form thoughts on concepts and ideas that I think are worth expanding upon. Topics include software development, urban science, photography, and geopolitics.
    `
const articlesData = [
    {
        id: '00',
        title: 'Crime in Chicago',
        description: 'In this article I demonstrate how k-means and Gaussian mixture clustering methods can be used to conduct a spatiotemporal analysis of crime across Chicago, IL.',
        date: '2024-04-16'
    },
    {
        id: '01',
        title: 'The Gender-Data Gap',
        description: 'Picture a world where every product, service, and system was designed with only half of humanity in mind. Now consider this hypothetical scenario is closer to fact than it is to fiction.',
        date: '2024-11-19'
    },
    {
        id: '02',
        title: 'Equity in Education',
        description: 'Quality education serves as the bedrock of prosperous and equitable communities, fostering the capacity to address local, national, and global challenges effectively.',
        date: '2023-09-29'
    },
];

const articleCards = articlesData.map((articleProps) => (
    <ArticleCard key={articleProps.id} {...articleProps} />
))

export default function ArticlesPage() {
    return (
        <div className="flex justify-center">
            <MainContainer header={header} description={description}>
                <div className="my-6 justify-center flex-row space-y-6 lg:ml-6">
                    {articleCards}
                </div>

            </MainContainer>
        </div>
    )
}