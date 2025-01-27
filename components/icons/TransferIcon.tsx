import React from 'react';
import { SVGProps } from 'react';

export const TransferIcon: React.FC<SVGProps<SVGSVGElement>> = props => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M21 11H7.00002C6.40002 11 6.00002 10.6 6.00002 10C6.00002 9.4 6.40002 9 7.00002 9H18.6L16.3 6.7C15.9 6.3 15.9 5.7 16.3 5.3C16.7 4.9 17.3 4.9 17.7 5.3L21.7 9.3C22 9.6 22.1 10 21.9 10.4C21.8 10.8 21.4 11 21 11ZM7.00002 19C6.70002 19 6.50002 18.9 6.30002 18.7L2.30002 14.7C2.00002 14.4 1.90002 14 2.10002 13.6C2.30002 13.2 2.60002 13 3.00002 13H17C17.6 13 18 13.4 18 14C18 14.6 17.6 15 17 15H5.40002L7.70002 17.3C8.10002 17.7 8.10002 18.3 7.70002 18.7C7.50002 18.9 7.30002 19 7.00002 19Z"
      fill="currentColor"
      className="fill-current"
    />
  </svg>
);
