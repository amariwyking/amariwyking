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
        <ul className="mt-4 px-4 flex flex-col gap-x-1 gap-y-1.5 lg:mt-0 lg:flex-row lg:items-center">
            {LINKS.map(({ icon: Icon, title, href }) => (
                <li key={title}>
                    <div className="px-4 ring-0 hover:ring-2 ring-primary rounded-full duration-300">
                        <Typography
                            as="a"
                            href={href}
                            type="small"
                            className="flex items-center gap-x-2 p-1 text-surface-foreground"
                        >
                            <Icon className="h-4 w-4" />
                            {title}
                        </Typography>
                    </div>
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
        <Navbar className="flex justify-center mx-auto my-8 py-2 rounded-full w-fit max-w-screen-xl ring-1 ring-secondary shadow-md">
            <div className="flex items-center">
                <Typography
                    as="a"
                    href="/"
                    type="small"
                    className="ml-2 mx-8 block py-1 font-mono font-semibold text-foreground"
                >
                    Amari Wyking
                </Typography>
                <hr className="hidden h-5 w-px border-l-2 border-t-0 border-secondary-dark lg:block" />
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
