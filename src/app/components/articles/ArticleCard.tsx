"use client"

import { Card, Typography, Button } from "@material-tailwind/react";
import { NavArrowRight } from "iconoir-react";
import React from "react";

interface ArticleCardProps {
    id: string,
    title: string,
    date: string,
    category: string,
    description: string,
    content: string,
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
        <div className="flex flex-row ring-0 ring-surface lg:ring-0 rounded-xl">
            <div className="basis-48 lg:py-6 lg:mr-6 text-zinc-400 font-light hidden md:block">
                <Typography className=" text-right">
                    {formatDate(props.date)}
                </Typography>
            </div>
            <Card className="max-w-2xl lg:p-6 hover:bg-surface text-surface-foreground duration-300">
                <Card.Body>
                    <Typography className="text-sm font-semibold tracking-wider uppercase lg:text-base">
                        {props.title}
                    </Typography>
                    <Typography className="text-xs line-clamp-3 my-1 text-zinc-500 lg:text-base">
                        {props.description}
                    </Typography>
                </Card.Body>
                <Card.Footer>
                    <div className="flex flex-row items-center py-1 lg:my-2 text-emerald-500">
                        <Typography className="text-xs py-1 lg:text-base">Read More</Typography>
                        <NavArrowRight className="mx-1 w-4 lg:w-6"/>
                    </div>
                </Card.Footer>
            </Card>
        </div>
    )
}