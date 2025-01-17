import type { JSX } from "react";
type MainContainerProps = {
    header: string
    description: string
    children: JSX.Element | JSX.Element[]
}

const MainContainer = (props: MainContainerProps) => {
    return (
        <div className="lg:mt-6 mx-8 max-w-screen-lg">
            <div className="flex-col my-9 max-w-2xl">
                <h1 className="font-bold text-left md:text-left text-clip text-xl leading-tight tracking-normal text-gray-800 dark:text-gray-100 w-full lg:max-w-3xl lg:text-5xl">
                    {props.header}
                </h1>
                <p className="md:mx-auto mt-2 lg:mt-6 text-left text-sm text-gray-600 dark:text-gray-400 md:text-base lg:text-base ">
                    {props.description}
                </p>
            </div>
            {props.children}
        </div>
    );
}

export default MainContainer;