import React, { useState, useEffect } from "react";
import Identicon, { IdenticonOptions } from "identicon.js";
import CryptoJS from "crypto-js";

const ProfileAvatar = ({
  walletAddress,
  size,
}: {
  walletAddress: string;
  size?: number;
}) => {
  const [avatarSrc, setAvatarSrc] = useState("");

  const colors: [number, number, number, number][] = [
    [41, 223, 212, 255],
    [171, 119, 129, 255],
    [221, 156, 128, 255],
    [106, 168, 160, 255],
  ];

  useEffect(() => {
    if (walletAddress) {
      const hash = CryptoJS.SHA256(walletAddress).toString(CryptoJS.enc.Hex);

      const colorIndex =
        parseInt(hash.charAt(hash.length - 1), 16) % colors.length;

      const options: IdenticonOptions = {
        foreground: colors[colorIndex],
        background: [70, 70, 70, 255],
        margin: 0.21,
        size: size ?? 700,
        format: "svg",
      };

      const identicon = new Identicon(hash, options).toString();
      setAvatarSrc(`data:image/svg+xml;base64,${identicon}`);
    }
  }, [walletAddress]);

  const imageSize = size ? `${size}px` : "32px";

  return (
    <img
      src={avatarSrc}
      alt="Profile Avatar"
      className="rounded-full "
      style={{ height: imageSize, width: imageSize }}
    />
  );
};

export default ProfileAvatar;
