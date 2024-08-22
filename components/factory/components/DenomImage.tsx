import ProfileAvatar from "@/utils/identicon";
import Image from "next/image";
import { useState, useEffect } from "react";

const supportedDomains = [
  "imgur.com",
  "i.imgur.com",
  "cloudfront.net",
  "cdn.jsdelivr.net",
  "raw.githubusercontent.com",
  "s3.amazonaws.com",
  "storage.googleapis.com",
  "res.cloudinary.com",
  "images.unsplash.com",
  "media.giphy.com",
  "media.istockphoto.com",
  "imgix.net",
  "staticflickr.com",
  "twimg.com",
  "pinimg.com",
  "giphy.com",
  "dropboxusercontent.com",
  "googleusercontent.com",
  "unsplash.com",
  "istockphoto.com",
];

const supportedPatterns = [
  /^https:\/\/.*\.s3\.amazonaws\.com/,
  /^https:\/\/.*\.storage\.googleapis\.com/,
  /^https:\/\/.*\.cloudinary\.com/,
  /^https:\/\/.*\.imgix\.net/,
  /^https:\/\/.*\.staticflickr\.com/,
  /^https:\/\/.*\.twimg\.com/,
  /^https:\/\/.*\.pinimg\.com/,
  /^https:\/\/.*\.giphy\.com/,
  /^https:\/\/.*\.dropboxusercontent\.com/,
  /^https:\/\/.*\.googleusercontent\.com/,
  /^https:\/\/.*\.unsplash\.com/,
  /^https:\/\/.*\.istockphoto\.com/,
  /^https:\/\/.*\.media\.giphy\.com/,
  /^https:\/\/.*\.media\.istockphoto\.com/,
  /^https:\/\/.*\.images\.unsplash\.com/,
  /^https:\/\/.*\.media\.istockphoto\.com/,
  /^https:\/\/.*\.imgix\.net/,
  /^https:\/\/.*\.staticflickr\.com/,
  /^https:\/\/.*\.twimg\.com/,
  /^https:\/\/.*\.pinimg\.com/,
  /^https:\/\/.*\.giphy\.com/,
];

const isUrlSupported = (url: string) => {
  try {
    const { hostname } = new URL(url);
    return (
      supportedDomains.includes(hostname) ||
      supportedPatterns.some((pattern) => pattern.test(url))
    );
  } catch {
    return false;
  }
};

export const DenomImage = ({ denom }: { denom: any }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const checkUri = async () => {
      if (denom?.uri) {
        setIsSupported(isUrlSupported(denom.uri));
        // Simulate a delay to show the loading state
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      setIsLoading(false);
    };

    checkUri();
  }, [denom?.uri]);

  if (isLoading) {
    return (
      <div className="skeleton w-8 h-8 rounded-full animate-pulse bg-gray-300"></div>
    );
  }

  // Check for MFX token first
  if (denom.base.includes("umfx")) {
    return (
      <Image
        width={0}
        height={0}
        src="/logo.svg"
        alt="MFX Token Icon"
        className="w-[28px] h-[28px] ml-1"
      />
    );
  }

  // Then check for other conditions
  if (!denom.uri || !isSupported || imageError) {
    return <ProfileAvatar walletAddress={denom.base} />;
  }

  // For all other cases, use the denom.uri
  return (
    <Image
      width={32}
      height={32}
      src={denom.uri}
      alt="Token Icon"
      onError={() => setImageError(true)}
      className="rounded-full w-[32px] h-[32px]"
    />
  );
};
