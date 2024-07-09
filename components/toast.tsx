import React, { useEffect, useState } from "react";
import Link from "next/link";

export interface ToastMessage {
  type: string;
  title: string;
  description?: string;
  link?: string;
  bgColor?: string;
}

interface ToastProps {
  toastMessage: ToastMessage | null;
  setToastMessage: (msg: ToastMessage | null) => void;
}

export const Toast: React.FC<ToastProps> = ({
  toastMessage,
  setToastMessage,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [prevMessage, setPrevMessage] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (toastMessage) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setToastMessage(null), 300);
      }, 9700);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, setToastMessage]);

  useEffect(() => {
    if (
      toastMessage &&
      (!prevMessage || toastMessage.type !== prevMessage.type)
    ) {
      setPrevMessage(toastMessage);
    }
  }, [toastMessage, prevMessage]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setToastMessage(null), 300);
  };

  if (!toastMessage) {
    return null;
  }

  return (
    <div className="toast toast-end toast-bottom flex flex-col justify-start items-center text-left">
      <div
        className={`alert ${toastMessage.type} w-96 relative 
                    transition-all duration-300 ease-in-out
                    ${
                      isVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2"
                    }
                    ${
                      prevMessage && prevMessage.type !== toastMessage.type
                        ? "animate-pulse"
                        : ""
                    }`}
        style={{ backgroundColor: toastMessage.bgColor }}
      >
        <button
          className="absolute top-2 right-2  hover:text-red-600 transition-colors duration-200"
          onClick={handleClose}
        >
          ✖
        </button>
        <div className="flex flex-col w-full">
          <div className="flex flex-row items-center gap-2">
            {toastMessage.type === "alert-info" && (
              <span className="loading loading-bars loading-md" />
            )}
            <span className="text-xl font-bold">{toastMessage.title}</span>
          </div>
          <div className="text-sm mt-2 whitespace-normal text-pretty">
            {toastMessage.description}
          </div>
          {toastMessage.link && (
            <Link
              href={toastMessage.link}
              className="text-blue-500 underline mt-2 hover:text-blue-600 transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Manifest Scan
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
