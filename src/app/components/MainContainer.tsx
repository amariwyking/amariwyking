import type { JSX } from "react";
type MainContainerProps = {
    header: string
    description: string
    children: JSX.Element | JSX.Element[]
}

const MainContainer = (props: MainContainerProps) => {
    return (
        <div className="lg:mt-6 mx-8 max-w-(--breakpoint-lg)">
            <div className="flex-col my-9 max-w-2xl">
                <h1 className="font-kode-mono font-bold text-left md:text-left text-clip text-xl leading-tight tracking-normal text-foreground w-full lg:max-w-3xl lg:text-5xl">
                    {props.header}
                </h1>
                <p className="font-work-sans md:mx-auto mt-2 lg:mt-6 text-left text-sm text-foreground md:text-base lg:text-base">
                    {props.description}
                </p>
            </div>
            {props.children}
        </div>
    );
}

export default MainContainer;