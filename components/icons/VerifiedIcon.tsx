import React from 'react';
import { SVGProps } from 'react';

export const VerifiedIcon: React.FC<SVGProps<SVGSVGElement>> = props => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Verified"
    {...props}
  >
    <path
      stroke-linejoin="round"
      stroke-linecap="round"
      stroke-miterlimit="10"
      stroke-width="1"
      stroke="currentColor"
      fill="none"
      d="M20.86 14.13C20 14.7 19.56 15.74 19.77 16.76C20.13 18.55 18.55 20.13 16.76 19.77C15.74 19.57 14.7 20 14.13 20.86C13.12 22.38 10.89 22.38 9.88 20.86C9.3 20 8.26 19.56 7.24 19.77C5.45 20.13 3.87 18.55 4.23 16.76C4.43 15.74 4 14.7 3.14 14.13C1.62 13.12 1.62 10.89 3.14 9.88C4 9.3 4.44 8.26 4.23 7.24C3.87 5.45 5.45 3.87 7.24 4.23C8.26 4.44 9.3 4 9.87 3.14C10.88 1.62 13.11 1.62 14.12 3.14C14.7 4 15.74 4.44 16.76 4.23C18.55 3.87 20.13 5.45 19.77 7.24C19.56 8.26 20 9.3 20.86 9.87C22.38 10.88 22.38 13.12 20.86 14.13Z"
    ></path>
    <path
      stroke-linejoin="round"
      stroke-linecap="round"
      stroke-miterlimit="10"
      stroke-width="1"
      stroke="currentColor"
      d="M8 12L10.5 15L16 9"
    ></path>
  </svg>
);
