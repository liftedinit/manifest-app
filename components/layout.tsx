import React from 'react';

import { SearchIcon } from '@/components/icons';
import { SearchInput } from '@/components/react/SearchFilter';

export interface PageHeaderProps extends React.HTMLProps<HTMLDivElement> {
  title: string;
  search?: string;
}

export const PageHeader = ({ search, title, ...props }: PageHeaderProps) => {
  return (
    <div
      {...props}
      className={`pt-1 flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto ${props.className ?? ''}`}
    >
      <h1
        className="text-secondary-content"
        style={{ fontSize: '20px', fontWeight: 700, lineHeight: '24px' }}
      >
        {title}
      </h1>
      {search !== undefined && (
        <div className="relative w-full sm:w-[224px]">
          <SearchInput placeholder={search} />
        </div>
      )}
    </div>
  );
};
