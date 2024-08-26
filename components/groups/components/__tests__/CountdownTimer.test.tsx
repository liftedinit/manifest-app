import { afterEach, describe, expect, test, jest } from "bun:test";
import React from "react";
import { screen, cleanup, render } from "@testing-library/react";
import CountdownTimer from "@/components/groups/components/CountdownTimer";
import matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

describe("CountdownTimer", () => {
  afterEach(cleanup);

  test("renders initial state correctly", () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("1992-01-01T00:00:00.000Z"));
    const oneSecond = 1000;
    const oneMinute = oneSecond * 60;
    const oneHour = oneMinute * 60;
    const oneDay = oneHour * 24;

    // Now + 2 days - 1 hour - 2 minutes - 1 second
    const endTime = new Date(Date.now() + ( 2 * oneDay) - oneHour - (2 * oneMinute) - oneSecond);
    render(<CountdownTimer endTime={endTime} />);

    expect(screen.getByText("days")).toBeInTheDocument();
    const daysSpan = screen.getByLabelText("days");
    expect(daysSpan).toHaveStyle("--value: 1");

    expect(screen.getByText("hours")).toBeInTheDocument();
    const hoursSpan = screen.getByLabelText("hours");
    expect(hoursSpan).toHaveStyle("--value: 22");

    expect(screen.getByText("min")).toBeInTheDocument();
    const minSpan = screen.getByLabelText("mins");
    expect(minSpan).toHaveStyle("--value: 57");

    expect(screen.getByText("sec")).toBeInTheDocument();
    const secSpan = screen.getByLabelText("secs");
    expect(secSpan).toHaveStyle("--value: 59");

    jest.useRealTimers();
  });

  test("shows zero values when countdown is complete", () => {
    const endTime = new Date(Date.now() - 1000); // 1 second ago
    render(<CountdownTimer endTime={endTime} />);

    expect(screen.getByText("days")).toBeInTheDocument();
    const daysSpan = screen.getByLabelText("days");
    expect(daysSpan).toHaveStyle("--value: 0");

    expect(screen.getByText("hours")).toBeInTheDocument();
    const hoursSpan = screen.getByLabelText("hours");
    expect(hoursSpan).toHaveStyle("--value: 0");

    expect(screen.getByText("min")).toBeInTheDocument();
    const minSpan = screen.getByLabelText("mins");
    expect(minSpan).toHaveStyle("--value: 0");

    expect(screen.getByText("sec")).toBeInTheDocument();
    const secSpan = screen.getByLabelText("secs");
    expect(secSpan).toHaveStyle("--value: 0");
  });
});