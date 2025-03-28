import React, { useCallback, useEffect, useState } from 'react';
import { TDate, format } from 'timeago.js';

/**
 * Mode of operation for the <TimeAgo /> component.
 */
export enum TimeAgoMode {
  Default = 0,
  AgoOnly = 1,
  FutureOnly = 2,
}

/**
 * Properties for the TimeAgo component.
 *
 * Inherits `relativeDate` and `minInterval` from `timeago.js`.
 */
export interface TimeAgoProps extends React.HTMLProps<HTMLTimeElement> {
  /**
   * The date to convert.
   */
  readonly datetime: TDate;

  /**
   * Whether to live update the component. This is true by default.
   */
  readonly live?: boolean;

  /**
   * Mode of operation for the component.
   */
  readonly mode?: TimeAgoMode;

  /**
   * Show a tooltip with the full time in it. True by default.
   */
  readonly tooltip?: boolean;

  /**
   * The relative date.
   */
  readonly relativeDate?: TDate;
}

export const TimeAgo = ({
  relativeDate,
  datetime,
  live = true,
  mode = TimeAgoMode.Default,
  tooltip = true,
  ...timeProps
}: TimeAgoProps) => {
  const toString = useCallback(() => {
    const d = new Date(datetime);
    const now = relativeDate ? new Date(relativeDate) : new Date();

    if (mode === TimeAgoMode.AgoOnly) {
      if (d.getTime() > now.getTime()) {
        return 'None';
      }
    } else if (mode === TimeAgoMode.FutureOnly) {
      if (d.getTime() < now.getTime()) {
        return 'None';
      }
    }
    return format(d, undefined, { relativeDate });
  }, [datetime, mode, relativeDate]);

  const [time, setTime] = useState<string>(toString());

  useEffect(() => {
    if (live) {
      const id = setInterval(() => setTime(toString()), 60000);
      return () => clearInterval(id);
    }
  }, [datetime, relativeDate, mode, live, toString]);

  const d = new Date(datetime);
  const localeOpts: Partial<Intl.DateTimeFormatOptions> = {
    dateStyle: 'long',
    timeStyle: 'long',
  };

  const props = {
    ...(tooltip
      ? {
          className: `tooltip tooltip-info tooltip-top ${timeProps?.className ?? ''}`,
          'data-tip': d.toLocaleString(undefined, localeOpts),
        }
      : undefined),
  };

  return (
    <time {...timeProps} {...props} dateTime={d.toISOString()}>
      {time}
    </time>
  );
};
