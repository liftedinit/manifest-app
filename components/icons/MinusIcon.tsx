import React from 'react';
import { SVGProps } from 'react';

export const MinusIcon: React.FC<SVGProps<SVGSVGElement>> = props => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M17.5938 13.4063C18.1406 13.4063 18.6172 12.9375 18.6172 12.3672C18.6172 11.8047 18.1406 11.3281 17.5938 11.3281H6.41406C5.88281 11.3281 5.39062 11.8047 5.39062 12.3672C5.39062 12.9375 5.88281 13.4063 6.41406 13.4063H17.5938Z"
      fill="currentColor"
      className="fill-current"
    />
  </svg>
);
