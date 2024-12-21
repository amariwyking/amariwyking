"use client";

import * as React from "react";
import {
    Button,
    IconButton,
    Typography,
    Collapse,
    Navbar,
} from "@material-tailwind/react";
import {
    Archive,
    CodeBracketsSquare,
    MediaImageList,
    Menu,
    MultiplePages,
    ProfileCircle,
    SelectFace3d,
    Xmark,
} from "iconoir-react";

const LINKS = [
    {
        icon: MediaImageList,
        title: "Gallery",
        href: "/gallery",
    },
    {
        icon: MultiplePages,
        title: "Articles",
        href: "#",
    },
    {
        icon: CodeBracketsSquare,
        title: "Projects",
        href: "#",
    },
];

function NavList() {
    return (
        <ul className="mt-4 flex flex-col gap-x-3 gap-y-1.5 lg:mt-0 lg:flex-row lg:items-center">
            {LINKS.map(({ icon: Icon, title, href }) => (
                <li key={title}>
                    <Typography
                        as="a"
                        href={href}
                        type="small"
                        className="flex items-center gap-x-2 p-1 text-foreground hover:text-primary"
                    >
                        <Icon className="h-4 w-4" />
                        {title}
                    </Typography>
                </li>
            ))}
        </ul>
    );
}

export default function NavBar() {
    const [openNav, setOpenNav] = React.useState(false);

    React.useEffect(() => {
        window.addEventListener(
            "resize",
            () => window.innerWidth >= 960 && setOpenNav(false),
        );
    }, []);

    return (
        <Navbar className="flex justify-center mx-auto my-8 px-8 py-2 rounded-full w-fit max-w-screen-xl bg-surface">
            <div className="flex items-center">
                <Typography
                    as="a"
                    href="/"
                    type="small"
                    className="ml-2 mr-2 block py-1 font-mono font-semibold text-foreground"
                >
                    Amari Wyking
                </Typography>
                <hr className="ml-1 mr-1.5 hidden h-5 w-px border-l border-t-0 border-secondary-dark lg:block" />
                <div className="hidden lg:block">
                    <NavList />
                </div>
            </div>
            <Collapse open={openNav}>
                <NavList />
            </Collapse>
        </Navbar>
    );
}
