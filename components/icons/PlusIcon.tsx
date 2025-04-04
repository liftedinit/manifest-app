import React from 'react';
import { SVGProps } from 'react';

export const PlusIcon: React.FC<SVGProps<SVGSVGElement>> = props => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12.0039 18.7344C12.5742 18.7344 13.043 18.2656 13.043 17.6953V13.1484H17.5898C18.1602 13.1484 18.6289 12.6875 18.6289 12.1094C18.6289 11.5391 18.1602 11.0703 17.5898 11.0703H13.043V6.52344C13.043 5.95313 12.5742 5.48438 12.0039 5.48438C11.4336 5.48438 10.9648 5.95313 10.9648 6.52344V11.0703H6.41797C5.84766 11.0703 5.37891 11.5391 5.37891 12.1094C5.37891 12.6875 5.84766 13.1484 6.41797 13.1484H10.9648V17.6953C10.9648 18.2656 11.4336 18.7344 12.0039 18.7344Z"
      fill="currentColor"
      className="fill-current"
    />
  </svg>
);
