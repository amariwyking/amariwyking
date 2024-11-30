import { Typography } from "@material-tailwind/react";

export default function Intro() {
    return (
        <div className="mx-auto w-full max-w-7xl lg:px-8">
            <div className="relative px-4 sm:px-8 lg:px-12">
                <div className="mx-auto max-w-2xl lg:max-w-5xl">
                    <h1 className="font-bold leading-snug tracking-tight text-gray-800 dark:text-gray-600 mx-auto my-6 w-full text-2xl lg:max-w-3xl lg:text-5xl">
                        Human(ist) <br />
                        Software developer, data science, and observer of life.
                    </h1>
                    
                    <p className="mx-auto mt-6 text-base text-gray-600 dark:text-gray-400 w-full lg:max-w-3xl lg:text-xl">
                        Currently exploring how data can be leveraged to characterize and solve for urban challenges as a student at the New York University Center for Urban Science + Progress.

                        Aiming to make major contributions towards the development of smart cities across the African continent.
                    </p>
                </div>

            </div>

        </div>

    )
}