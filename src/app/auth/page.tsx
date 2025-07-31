"use client";

import { CivicAuthIframeContainer, UserButton, useUser } from "@civic/auth/react";

export default function LoginPage() {
    const user = useUser();

    return (
        <div className="flex h-screen w-screen justify-center items-center">
            <div className="flex flex-col gap-4 w-fit h-fit">
                {user.user ? <UserButton /> : <CivicAuthIframeContainer />}
            </div>
        </div>
    );
}
