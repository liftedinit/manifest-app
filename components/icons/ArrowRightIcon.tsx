import React from 'react';
import { SVGProps } from 'react';

interface ArrowRightIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

const ArrowRightIcon: React.FC<ArrowRightIconProps> = ({ size, ...props }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M15.0898 4.0798L8.56984 10.5998C7.79984 11.3698 7.79984 12.6298 8.56984 13.3998L15.0898 19.9198"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default ArrowRightIcon;
