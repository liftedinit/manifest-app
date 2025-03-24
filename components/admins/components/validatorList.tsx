import { ValidatorSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/staking/v1beta1/staking';
import Image from 'next/image';
import React, { useMemo, useState } from 'react';

import { ValidatorDetailsModal, WarningModal } from '@/components';
import { SearchIcon, TrashIcon } from '@/components/icons';
import { Pagination } from '@/components/react/Pagination';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import useIsMobile from '@/hooks/useIsMobile';
import { ProfileAvatar } from '@/utils/identicon';

export interface ExtendedValidatorSDKType extends ValidatorSDKType {
  consensus_power?: bigint;
  logo_url?: string;
}

interface ValidatorListProps {
  admin: string;
  activeValidators: ExtendedValidatorSDKType[];
  pendingValidators: ExtendedValidatorSDKType[];
  isLoading: boolean;
}

export default function ValidatorList({
  admin,
  activeValidators,
  pendingValidators,
  isLoading,
}: ValidatorListProps) {
  const [active, setActive] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValidator, setSelectedValidator] = useState<ExtendedValidatorSDKType | null>(null);
  const [openWarningModal, setOpenWarningModal] = useState(false);
  const [openValidatorModal, setOpenValidatorModal] = useState(false);

  const [validatorToRemove, setValidatorToRemove] = useState<ExtendedValidatorSDKType | null>(null);
  const totalvp = Array.isArray(activeValidators)
    ? activeValidators.reduce(
        (acc, validator) => acc + BigInt(validator?.consensus_power ?? 0),
        BigInt(0)
      )
    : BigInt(0);

  const validatorVPArray = Array.isArray(activeValidators)
    ? activeValidators.map(validator => ({
        moniker: validator.description.moniker,
        vp: BigInt(validator?.consensus_power ?? 0),
      }))
    : [];

  const isMobile = useIsMobile();

  const pageSize = isMobile ? 4 : 5;

  let filteredValidators = useMemo(() => {
    const validators = active ? activeValidators : pendingValidators;
    return validators.filter(validator =>
      validator.description.moniker.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [active, activeValidators, pendingValidators, searchTerm]);

  const handleRemove = (validator: ExtendedValidatorSDKType) => {
    setValidatorToRemove(validator);
    setOpenWarningModal(true);
  };

  const [modalKey, setModalKey] = useState(0);

  const handleRowClick = (validator: ExtendedValidatorSDKType) => {
    setSelectedValidator(validator);
    setModalKey(prevKey => prevKey + 1);
    setOpenValidatorModal(true);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
            <h1
              className="text-secondary-content"
              style={{ fontSize: '20px', fontWeight: 700, lineHeight: '24px' }}
            >
              Validators
            </h1>
            <div className="relative w-full sm:w-[224px]">
              <input
                type="text"
                placeholder="Search for a validator..."
                className="input input-bordered w-full h-[40px] rounded-[12px] border-none bg-secondary text-secondary-content pl-10 focus:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <SearchIcon className="h-6 w-6 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
        <div
          role="tablist"
          aria-label="Validator status filter"
          className="flex mb-2 w-full h-[3.5rem] rounded-xl p-1 bg-[#0000000A] dark:bg-[#FFFFFF0F] relative"
        >
          <div
            className={`absolute transition-all duration-200 ease-in-out h-[calc(100%-8px)] top-1 rounded-xl bg-white dark:bg-[#FFFFFF1F] ${
              active ? 'left-1 w-[calc(50%-4px)]' : 'left-[calc(50%+1px)] w-[calc(50%-4px)]'
            }`}
          />
          <button
            onClick={() => setActive(true)}
            role="tab"
            aria-selected={active}
            aria-controls="active-validators"
            className={`flex-1 py-2 px-4 text-sm font-medium cursor-pointer rounded-xl hover:text-[#161616] dark:hover:text-white focus:outline-hidden  relative z-10 ${
              active ? 'text-[#161616] dark:text-white' : 'text-[#808080]'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActive(false)}
            role="tab"
            aria-selected={!active}
            aria-controls="pending-validators"
            className={`flex-1 py-2 px-4 text-sm font-medium cursor-pointer rounded-xl hover:text-[#161616] dark:hover:text-white focus:outline-hidden  relative z-10 ${
              !active ? 'text-[#161616] dark:text-white' : 'text-[#808080]'
            }`}
          >
            Pending
          </button>
        </div>
        <div className="overflow-auto">
          <div className="max-w-8xl mx-auto">
            {isLoading ? (
              <table className="table w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-sm font-medium text-[#808080]" role="row">
                    <th className="bg-transparent text-left sticky top-0 z-10">Moniker</th>
                    <th className="hidden lg:table-cell bg-transparent text-left sticky top-0 z-10">
                      Address
                    </th>
                    <th className="hidden md:table-cell bg-transparent text-left sticky top-0 z-10">
                      Consensus Power
                    </th>
                    <th className="bg-transparent text-right sticky top-0 z-10">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {Array(4)
                    .fill(0)
                    .map((_, index) => (
                      <tr key={index}>
                        <td className="bg-secondary rounded-l-[12px]">
                          <div className="flex items-center space-x-3">
                            <div className="skeleton w-8 h-8 rounded-full shrink-0"></div>
                            <div className="skeleton h-4 w-24"></div>
                          </div>
                        </td>
                        <td className="bg-secondary hidden lg:table-cell">
                          <div className="skeleton h-4 w-32"></div>
                        </td>
                        <td className="bg-secondary hidden md:table-cell">
                          <div className="skeleton h-4 w-16"></div>
                        </td>
                        <td className="bg-secondary rounded-r-[12px] text-right">
                          <div className="skeleton h-8 w-8 rounded-md ml-auto"></div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : filteredValidators.length === 0 ? (
              <div className="text-center py-8 text-[#808080]">
                {active ? 'No active validators found' : 'No pending validators'}
              </div>
            ) : (
              <Pagination dataset={filteredValidators} pageSize={pageSize}>
                <table
                  className="table w-full border-separate border-spacing-y-3"
                  role="grid"
                  aria-label="Validators list"
                >
                  <thead>
                    <tr className="text-sm font-medium text-[#808080]" role="row">
                      <th className="bg-transparent text-left sticky top-0">Moniker</th>
                      <th className="hidden lg:table-cell bg-transparent text-left sticky top-0">
                        Address
                      </th>
                      <th className="hidden md:table-cell bg-transparent text-left sticky top-0">
                        Consensus Power
                      </th>
                      <th className="bg-transparent text-right sticky top-0">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    <Pagination.Data.Consumer>
                      {rows =>
                        rows.map(validator => (
                          <tr
                            key={validator.operator_address}
                            className="group text-black dark:text-white rounded-lg cursor-pointer focus:outline-hidden transition-colors"
                            onClick={() => handleRowClick(validator)}
                            tabIndex={0}
                            role="row"
                            aria-label={`Validator ${validator.description.moniker}`}
                          >
                            <td className="bg-secondary group-hover:bg-base-300 rounded-l-[12px] py-4">
                              <div className="flex items-center space-x-3">
                                {validator.logo_url ? (
                                  <Image
                                    height={32}
                                    width={32}
                                    src={validator.logo_url}
                                    alt=""
                                    className="w-8 h-8 rounded-full"
                                  />
                                ) : (
                                  <ProfileAvatar
                                    walletAddress={validator.operator_address}
                                    size={32}
                                  />
                                )}
                                <span className="font-medium">{validator.description.moniker}</span>
                              </div>
                            </td>

                            <td className="py-4 bg-secondary group-hover:bg-base-300 hidden lg:table-cell">
                              <TruncatedAddressWithCopy address={validator.operator_address} />
                            </td>
                            <td className="py-4 bg-secondary group-hover:bg-base-300 hidden md:table-cell">
                              {validator.consensus_power?.toString() ?? 'N/A'}
                            </td>
                            <td
                              className="bg-secondary group-hover:bg-base-300 rounded-r-[12px] py-4 text-right"
                              onClick={e => e.stopPropagation()}
                            >
                              <button
                                onClick={() => handleRemove(validator)}
                                className="btn btn-error btn-sm text-white"
                                data-testid="remove-validator"
                                aria-label={`Remove validator ${validator.description.moniker}`}
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      }
                    </Pagination.Data.Consumer>
                  </tbody>
                </table>
              </Pagination>
            )}
          </div>
        </div>
      </div>

      <ValidatorDetailsModal
        key={modalKey}
        validator={selectedValidator}
        admin={admin}
        totalvp={totalvp.toString()}
        validatorVPArray={validatorVPArray}
        openValidatorModal={openValidatorModal}
        setOpenValidatorModal={setOpenValidatorModal}
      />
      <WarningModal
        admin={admin}
        isActive={active}
        address={validatorToRemove?.operator_address || ''}
        moniker={validatorToRemove?.description.moniker || ''}
        modalId="warning-modal"
        openWarningModal={openWarningModal}
        setOpenWarningModal={setOpenWarningModal}
      />
    </div>
  );
}
