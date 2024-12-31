import { Card, Typography, Button } from "@material-tailwind/react";
import { NavArrowRight } from "iconoir-react";
import React from "react";

type ArticleCardProps = {
    title: string
    description: string
    date: string
}



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

export default function ArticleCard(props: ArticleCardProps) {
    return (
        <div className="flex flex-row space-x-6">
            <div className="basis-48 py-6 text-zinc-400 font-light">
                <Typography>
                    {formatDate(props.date)}
                </Typography>
            </div>
            <Card className="max-w-2xl p-6 hover:bg-surface text-surface-foreground duration-300">
                <Card.Body>
                    <Typography className="font-medium">
                        {props.title}
                    </Typography>
                    <Typography className="line-clamp-3 my-1 text-zinc-500">
                        {props.description}
                    </Typography>
                </Card.Body>
                <Card.Footer>
                    <div className="flex flex-row my-4 text-emerald-500 font-normal">
                        <Typography>Read More</Typography>
                        <NavArrowRight />
                    </div>
                </Card.Footer>
            </Card>
        </div>
    )
}