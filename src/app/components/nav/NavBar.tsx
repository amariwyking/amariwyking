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
    CodeBracketsSquare,
    MediaImageList,
    Menu,
    MultiplePages,
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
        title: "Blog",
        href: "/blog",
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
            () => window.innerWidth >= 768 && setOpenNav(false),
        );
    }, []);

    return (
        <Navbar className="flex flex-col mt-6 py-2 rounded-md ring-1 ring-secondary shadow-md max-w-screen-xl transition-all lg:flex-row lg:w-fit lg:rounded-full lg:justify-center lg:mx-auto lg:my-8">
            <div className="flex items-center w-full">
                <Typography
                    as="a"
                    href="/"
                    type="small"
                    className="ml-2 mx-4 lg:mx-8 block py-1 font-mono font-semibold text-foreground"
                >
                    Amari Wyking
                </Typography>
                <hr className="hidden h-5 w-px border-l-2 border-t-0 border-secondary-dark lg:block" />
                <IconButton
                    size="sm"
                    variant="ghost"
                    color="secondary"
                    onClick={() => setOpenNav(!openNav)}
                    className="ml-auto mr-4 grid lg:hidden"
                >
                    {openNav ? (
                        <Xmark className="h-4 w-4" />
                    ) : (
                        <Menu className="h-4 w-4" />
                    )}
                </IconButton>
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