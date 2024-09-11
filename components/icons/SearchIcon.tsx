import React from 'react';
import { SVGProps } from 'react';

const SearchIcon: React.FC<SVGProps<SVGSVGElement>> = props => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19.5234 18.4922C19.5234 19.2422 18.9531 19.8359 18.1953 19.8359C17.8359 19.8359 17.4844 19.7109 17.2266 19.4531L14.0078 16.2344C13.0547 16.8281 11.9297 17.1719 10.7344 17.1719C7.29688 17.1719 4.47656 14.3516 4.47656 10.9141C4.47656 7.46875 7.29688 4.65625 10.7344 4.65625C14.1719 4.65625 16.9844 7.47656 16.9844 10.9141C16.9844 12.1797 16.6094 13.3594 15.9531 14.3437L19.1406 17.5391C19.4062 17.8047 19.5234 18.1406 19.5234 18.4922ZM6.375 10.9141C6.375 13.3047 8.33594 15.2657 10.7344 15.2657C13.125 15.2657 15.0859 13.3047 15.0859 10.9141C15.0859 8.5235 13.125 6.56256 10.7344 6.56256C8.33594 6.56256 6.375 8.5235 6.375 10.9141Z"
      fill="currentColor"
      className="fill-current"
    />
  </svg>
);

export default SearchIcon;