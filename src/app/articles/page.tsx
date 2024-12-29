"use client"

import MainContainer from "../components/MainContainer";
import { Card, Typography, Button } from "@material-tailwind/react";

const header = 'Ideas become valuable once they are shared with the world.'
const description =
    `In the heat of the light, ideas can be scrutinized, tested, validated, revised, or jettisoned.
    
    Here I share my long-form thoughts on concepts and ideas that I think are worth expanding upon. Topics include software development, urban science, photography, and geopolitics.
    `

const BlogPost = () => {
    return (
        <Card className="max-w-xl p-6 ring-2 ring-surface hover:bg-surface text-surface-foreground duration-300">
            <Card.Body>
                <Typography type="h6">UI/UX Review Check</Typography>
                <Typography className="my-1 text-surface-foreground">
                    The place is close to Barceloneta Beach and bus stop just 2 min by
                    walk and near to "Naviglio" where you can enjoy the main night life in
                    Barcelona. This is just place holder text...
                </Typography>
            </Card.Body>
            <Card.Footer>
                <Button isFullWidth>Read More</Button>
            </Card.Footer>
        </Card>
    )
}

export default function ArticlesPage() {
    return (
        <div>
            <MainContainer header={header} description={description}>
                <div className="ml-6 my-6 flex-row space-y-6">
                    <BlogPost />
                    <BlogPost />
                    <BlogPost />
                    <BlogPost />
                    <BlogPost />
                    <BlogPost />
                </div>

            </MainContainer>
        </div>
    )
}