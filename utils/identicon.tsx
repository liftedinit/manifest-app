/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import Identicon, { IdenticonOptions } from 'identicon.js';
import CryptoJS from 'crypto-js';

const ProfileAvatar = ({ walletAddress, size }: { walletAddress: string; size?: number }) => {
  const [avatarSrc, setAvatarSrc] = useState('');

  const colors: [number, number, number, number][] = [
    [56, 12, 197, 255],
    [160, 135, 255, 255],
    [88, 218, 210, 255],
    [225, 225, 249, 255],
  ];

  useEffect(() => {
    if (walletAddress) {
      const hash = CryptoJS.SHA256(walletAddress).toString(CryptoJS.enc.Hex);

      const colorIndex = parseInt(hash.charAt(hash.length - 1), 16) % colors.length;

      const options: IdenticonOptions = {
        foreground: colors[colorIndex],
        background: [255, 255, 255, 0],
        margin: 0.21,
        size: size ?? 700,
        format: 'svg',
      };

      const identicon = new Identicon(hash, options).toString();
      setAvatarSrc(`data:image/svg+xml;base64,${identicon}`);
    }
  }, [walletAddress]);

  const imageSize = size ? `${size}px` : '44px';

  return (
    <img
      src={avatarSrc}
      alt="Profile Avatar"
      className="rounded-md dark:bg-[#FFFFFF0F] bg-[#0000000A]"
      style={{ height: imageSize, width: imageSize }}
    />
  );
};

export default ProfileAvatar;
