import React, { useEffect, useState } from 'react';

export default function CountdownTimer({ endTime }: { endTime: Date }) {
  const calculateTimeLeft = () => {
    const now = new Date();
    const timeDiff = endTime.getTime() - now.getTime();
    if (timeDiff > 0) {
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const min = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const sec = Math.floor((timeDiff % (1000 * 60)) / 1000);
      return { days, hours, min, sec };
    }
    return { days: 0, hours: 0, min: 0, sec: 0 };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-flow-col gap-5 mt-2 text-center auto-cols-max">
      <div className="grid grid-flow-col gap-5 mt-2 text-center auto-cols-max text-primary-content">
        <div className="flex flex-col">
          <span className="countdown text-xl">
            <span
              style={{ '--value': timeLeft.days } as React.CSSProperties}
              aria-label="days"
            ></span>
          </span>
          days
        </div>
        <div className="flex flex-col ">
          <span className="countdown  text-xl">
            <span
              style={
                {
                  '--value': timeLeft.hours,
                } as React.CSSProperties
              }
              aria-label="hours"
            ></span>
          </span>
          hours
        </div>
        <div className="flex flex-col">
          <span className="countdown  text-xl">
            <span
              style={
                {
                  '--value': timeLeft.min,
                } as React.CSSProperties
              }
              aria-label="mins"
            ></span>
          </span>
          min
        </div>
        <div className="flex flex-col">
          <span className="countdown  text-xl">
            <span
              style={
                {
                  '--value': timeLeft.sec,
                } as React.CSSProperties
              }
              aria-label="secs"
            ></span>
          </span>
          sec
        </div>
      </div>
    </div>
  );
}
