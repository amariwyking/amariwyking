type MainContainerProps = {
    header: string
    description: string
    children: JSX.Element | JSX.Element[]
}

const MainContainer = (props: MainContainerProps) => {
    return (
        <div className="px-72 mt-24">
            <div className="flex-col my-9 max-w-2xl">
                <h1 className="font-bold text-center md:text-left text-clip leading-tight tracking-normal text-gray-800 dark:text-gray-100 w-full text-2xl lg:max-w-3xl lg:text-5xl">
                    {props.header}
                </h1>
                <p className="mx-8 md:mx-auto mt-6 text-left text-sm text-gray-600 dark:text-gray-400 md:text-base lg:text-base ">
                    {props.description}
                </p>
            </div>
            {props.children}
        </div>
    );
}

export default MainContainer;