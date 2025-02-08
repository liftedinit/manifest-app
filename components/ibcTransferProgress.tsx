import React from 'react';
import Image from 'next/image';
import { StatusState } from '@skip-go/client';

interface IbcTransferProgressProps {
  sourceChain: {
    name: string;
    icon: string;
  };
  targetChain: {
    name: string;
    icon: string;
  };
  status: StatusState;
}

export const IbcTransferProgress: React.FC<IbcTransferProgressProps> = ({
  sourceChain,
  targetChain,
  status,
}) => {
  // Helper function to determine the state of each chain icon
  // Returns: 'active' | 'pending' | 'completed' | 'error'
  const getChainState = (isSource: boolean) => {
    switch (status) {
      case 'STATE_SUBMITTED':
      case 'STATE_PENDING':
        // Source chain is active, target is waiting
        return isSource ? 'active' : 'pending';
      case 'STATE_RECEIVED':
        // Source is done, target is now active
        return isSource ? 'completed' : 'active';
      case 'STATE_COMPLETED':
      case 'STATE_COMPLETED_SUCCESS':
        // Both chains are completed
        return 'completed';
      case 'STATE_COMPLETED_ERROR':
      case 'STATE_PENDING_ERROR':
      case 'STATE_ABANDONED':
        // Error state for both chains
        return 'error';
      default:
        return 'pending';
    }
  };

  const sourceState = getChainState(true);
  const targetState = getChainState(false);

  return (
    <div className="flex items-center justify-center w-[22rem] space-x-4">
      {/* Source Chain Icon with Status Indicators */}
      <div className="relative">
        {/* Chain Icon Container */}
        <div
          className={`w-12 h-12 flex items-center justify-center
            ${sourceState === 'active' ? 'animate-pulse' : ''} // Pulse animation when active
            ${sourceState === 'completed' ? 'opacity-100' : sourceState === 'error' ? 'opacity-50' : 'opacity-70'} 
          `}
        >
          <Image
            src={sourceChain.icon}
            alt={sourceChain.name}
            width={29}
            height={28}
            className=""
          />
        </div>
        {/* Spinning border animation when chain is active */}
        {sourceState === 'active' && (
          <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        )}
        {/* Green checkmark indicator for completed state */}
        {sourceState === 'completed' && (
          <div className="absolute -right-1 bottom-1 bg-green-500 rounded-full p-1">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
        {/* Red X indicator for error state */}
        {sourceState === 'error' && (
          <div className="absolute -right-1 bottom-1 bg-red-500 rounded-full p-1">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Arrow indicating transfer direction */}
      <div className="flex-shrink-0">
        <svg
          className={`w-6 h-6 ${
            // Arrow color changes based on transfer status
            status === 'STATE_COMPLETED_SUCCESS'
              ? 'text-green-500'
              : status === 'STATE_COMPLETED_ERROR' || status === 'STATE_ABANDONED'
                ? 'text-red-500'
                : 'text-gray-400'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      </div>

      {/* Target Chain Icon with Status Indicators */}
      <div className="relative">
        {/* Chain Icon Container */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center
            ${targetState === 'active' ? 'animate-pulse' : ''} // Pulse animation when active
            ${targetState === 'completed' ? 'opacity-100' : targetState === 'error' ? 'opacity-50' : 'opacity-100'} // Opacity based on state
          `}
        >
          <Image
            src={targetChain.icon}
            alt={targetChain.name}
            width={32}
            height={32}
            className="rounded-full"
          />
        </div>
        {/* Spinning border animation when chain is active */}
        {targetState === 'active' && (
          <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        )}
        {/* Green checkmark indicator for completed state */}
        {targetState === 'completed' && (
          <div className="absolute -right-1 -bottom-1 bg-green-500 rounded-full p-1">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
        {/* Red X indicator for error state */}
        {targetState === 'error' && (
          <div className="absolute -right-1 -bottom-1 bg-red-500 rounded-full p-1">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
