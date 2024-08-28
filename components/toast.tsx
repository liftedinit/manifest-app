import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Confetti from "react-confetti";
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
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const toastRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isVisible && toastRef.current) {
      setDimensions({
        width: toastRef.current.offsetWidth,
        height: toastRef.current.offsetHeight,
      });
    }
  }, [isVisible]);
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

  const getGradientColor = (type: string) => {
    switch (type) {
      case "alert-success":
        return "from-green-500 to-green-700";
      case "alert-error":
        return "from-red-500 to-red-700";
      case "alert-warning":
        return "from-yellow-500 to-yellow-700";
      case "alert-info":
      default:
        return "from-blue-500 to-blue-700";
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none flex items-end justify-end p-4 z-[9999]">
      <div className="toast toast-end toast-bottom flex flex-col justify-start items-center text-left pointer-events-auto">
        <div className="toast toast-end toast-bottom flex flex-col justify-start items-center text-left">
          <div
            ref={toastRef}
            className={`alert ${toastMessage.type} w-96 relative
    transition-all duration-300 ease-in-out
    ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
    ${
      prevMessage && prevMessage.type !== toastMessage.type
        ? "animate-pulse"
        : ""
    }
    bg-gradient-to-r ${getGradientColor(toastMessage.type)}
    text-white shadow-lg rounded-lg overflow-hidden`}
          >
            {toastMessage.type === "alert-success" ? (
              <Confetti
                width={384}
                gravity={0.05}
                wind={0.02}
                recycle={false}
                numberOfPieces={200}
              />
            ) : null}
            <button
              className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors duration-200"
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
                  className="text-white underline mt-2 hover:text-gray-200 transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Manifest Scan
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
