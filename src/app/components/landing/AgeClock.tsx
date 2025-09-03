import { useEffect, useState } from "react";
import {
    intervalToDuration,
    differenceInMilliseconds,
    addMilliseconds,
} from 'date-fns';

import { toZonedTime } from 'date-fns-tz'

import localFont from 'next/font/local'

const dsDigit = localFont({
    src: '../../fonts/DS-DIGIT.woff2',
});

const digitalSevenMonoItalic = localFont({
    src: '../../fonts/digital-7-mono-italic.woff2',
});

interface Age {
    years: number,
    months: number,
    days: number,
    hours: number,
    minutes: number,
    seconds: number,
    milliseconds: number,
}

export function AgeClock() {
    const birthdateString = '2000-12-27T13:40:00';
    const timeZone = 'America/New_York';

    // Parse the birthdate string into a Date object, zoned to America/New_York
    const birthdate = toZonedTime(birthdateString, timeZone);

    // State to hold the broken-down age components for display
    const [age, setAge] = useState<Age | null>(null);

    // Function to calculate my age at the moment
    const calculateAndSetAge = () => {
        const now = new Date();
        const nowZoned = toZonedTime(now, timeZone);

        const totalMillisecondDifference = differenceInMilliseconds(nowZoned, birthdate);

        const endDate = addMilliseconds(birthdate, totalMillisecondDifference);

        // Calculate the duration
        const duration = intervalToDuration({
            start: birthdate,
            end: endDate
        });

        setAge({
            years: duration.years || 0,
            months: duration.months || 0,
            days: duration.days || 0,
            hours: duration.hours || 0,
            minutes: duration.minutes || 0,
            seconds: duration.seconds || 0,
            milliseconds: totalMillisecondDifference % 1000,
        });
    }

    // Define useEffect to handle the initialization and "running" of the clock
    useEffect(() => {
        calculateAndSetAge();

        // Set an interval that continuously increments the age
        setInterval(calculateAndSetAge, 1000);
    });

    if (!age) {
        return <div> Calculating age...</div>
    }

    const formattedYears = String(age.years).padStart(2, ' ');
    const formattedMonths = String(age.months).padStart(2, ' ');
    const formattedDays = String(age.days).padStart(2, ' ');
    const formattedHours = String(age.hours).padStart(2, '0');
    const formattedMinutes = String(age.minutes).padStart(2, '0');
    const formattedSeconds = String(age.seconds).padStart(2, '0');
    const formattedMilliseconds = String(age.milliseconds).padStart(3, '0');

    return (
        <div className={`flex flex-col ${digitalSevenMonoItalic.className} text-green-600`}>
            <p className="w-full text-sm mb-2 text-center">
                {formattedYears} yrs | {formattedMonths} mos | {formattedDays} days
            </p>
            <div className="flex flex-col justify-center text-center gap-y-2">
                <p className="justify-center bg-zinc-800 px-4 border-2 border-zinc-500 rounded-xs text-4xl text-shadow-lg/70 text-shadow-green-800">
                    {formattedHours}:{formattedMinutes}:{formattedSeconds}
                </p>
                <p className="uppercase w-full h-fit py-4 p-2 text-sm rounded-xs bg-green-600 font-work-sans text-zinc-100">
                    EVERY SECOND COUNTS
                </p>
            </div>
        </div>
    );
}