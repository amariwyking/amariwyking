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
        setInterval(calculateAndSetAge, 10);
    }, []);

    if (!age) {
        return <div> Calculating age...</div>
    }

    const formattedHours = String(age.hours).padStart(2, '0');
    const formattedMinutes = String(age.minutes).padStart(2, '0');
    const formattedSeconds = String(age.seconds).padStart(2, '0');
    const formattedMilliseconds = String(age.milliseconds).padStart(3, '0');

    return (
        <div>
            <p className={`${dsDigit.className} text-green-600`}>
                {age.years} yrs. | {age.months} mos. | {age.days} days | {formattedHours}:{formattedMinutes}:{formattedSeconds}.{formattedMilliseconds}
            </p>
        </div>
    );
}