import React, { useState, useEffect } from "react";
import Identicon, { IdenticonOptions } from "identicon.js";
import CryptoJS from "crypto-js";

const ProfileAvatar = ({ walletAddress }: { walletAddress: string }) => {
  const [avatarSrc, setAvatarSrc] = useState("");

  useEffect(() => {
    if (walletAddress) {
      const hash = CryptoJS.SHA256(walletAddress).toString(CryptoJS.enc.Hex);

      const options: IdenticonOptions = {
        foreground: [113, 215, 201, 255],
        background: [32, 32, 32, 100],
        margin: 0.2,
        size: 420,
        format: "svg",
      };

      const identicon = new Identicon(hash, options).toString();

      setAvatarSrc(`data:image/svg+xml;base64,${identicon}`);
    }
  }, [walletAddress]);

  return (
    <img
      src={avatarSrc}
      alt="Profile Avatar"
      className="h-10 w-10 rounded-full mr-4"
    />
  );
};

export default ProfileAvatar;
