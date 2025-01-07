import ProfileAvatar from '@/utils/identicon';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export const supportedDomains = [
  'imgur.com',
  'i.imgur.com',
  'cloudfront.net',
  'cdn.jsdelivr.net',
  'raw.githubusercontent.com',
  's3.amazonaws.com',
  'storage.googleapis.com',
  'res.cloudinary.com',
  'images.unsplash.com',
  'media.giphy.com',
  'media.istockphoto.com',
  'imgix.net',
  'staticflickr.com',
  'twimg.com',
  'pinimg.com',
  'giphy.com',
  'dropboxusercontent.com',
  'googleusercontent.com',
  'upload.wikimedia.org',
  'unsplash.com',
  'istockphoto.com',
  't4.ftcdn.net',
];

export const supportedPatterns = [
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
  /^https:\/\/.*\.upload\.wikimedia\.org/,
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
  /^https:\/\/.*\.t4\.ftcdn\.net/,
];

export const isUrlSupported = (url: string) => {
  try {
    const { hostname } = new URL(url);
    return (
      supportedDomains.includes(hostname) || supportedPatterns.some(pattern => pattern.test(url))
    );
  } catch {
    return false;
  }
};

export const DenomImage = ({
  denom,
  withBackground = true,
}: {
  denom: any;
  withBackground?: boolean;
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const checkUri = async () => {
      if (denom?.uri) {
        setIsSupported(isUrlSupported(denom?.uri));
        // Simulate a delay to show the loading state
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setIsLoading(false);
    };

    checkUri();
  }, [denom?.uri]);

  if (isLoading) {
    return (
      <div
        className="skeleton w-11 h-11 rounded-md animate-pulse bg-gray-300"
        aria-label="denom image skeleton"
      ></div>
    );
  }

  // Check for MFX token first
  if (denom?.base?.includes('umfx')) {
    return (
      <div
        className={`w-11 h-11 p-2 rounded-md ${withBackground ? 'dark:bg-[#ffffff0f] bg-[#0000000a]' : ''}`}
      >
        <Image
          width={44}
          height={44}
          src="/logo.svg"
          alt="MFX Token Icon"
          className="w-full h-full "
        />
      </div>
    );
  }

  // Then check for other conditions
  if (!denom?.uri || !isSupported || imageError) {
    return <ProfileAvatar walletAddress={denom?.base} withBackground={withBackground} />;
  }

  // For all other cases, use the denom.uri
  return (
    <div
      className={`w-11 h-11 p-2 rounded-md ${withBackground ? 'dark:bg-[#ffffff0f] bg-[#0000000A]' : ''}`}
    >
      <Image
        width={44}
        height={44}
        src={denom?.uri}
        alt="Token Icon"
        onError={() => setImageError(true)}
        className="rounded-md w-full h-full"
      />
    </div>
  );
};
