import React, { useState, useEffect, useMemo } from 'react';
import { ValidatorDetailsModal } from '../modals/validatorModal';
import { WarningModal } from '../modals/warningModal';
import { ValidatorSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/staking/v1beta1/staking';
import ProfileAvatar from '@/utils/identicon';
import Image from 'next/image';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import { SearchIcon, TrashIcon } from '@/components/icons';
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
  const [modalId, setModalId] = useState<string | null>(null);
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

  const filteredValidators = useMemo(() => {
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
    setModalId(`validator-modal-${validator.operator_address}-${Date.now()}`);
    setOpenValidatorModal(true);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="h-full flex flex-col p-4">
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
                className="input input-bordered w-full h-[40px] rounded-[12px] border-none bg-secondary text-secondary-content pl-10 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
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
          className="flex mb-6 w-full h-[3.5rem] rounded-xl p-1 bg-secondary"
        >
          <button
            onClick={() => setActive(true)}
            role="tab"
            aria-selected={active}
            aria-controls="active-validators"
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/50  ${
              active ? 'bg-base-300 text-secondary-content' : 'text-gray-500'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActive(false)}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/50  ${
              !active ? 'bg-base-300 text-secondary-content' : 'text-gray-500'
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
                    <th className="bg-transparent text-left sticky top-0 bg-base-100 z-10">
                      Moniker
                    </th>
                    <th className=" hidden lg:table-cell bg-transparent text-left sticky top-0 bg-base-100 z-10">
                      Address
                    </th>
                    <th className=" hidden md:table-cell bg-transparent text-left sticky top-0 bg-base-100 z-10">
                      Consensus Power
                    </th>
                    <th className="bg-transparent text-right sticky top-0 bg-base-100 z-10">
                      Remove
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array(4)
                    .fill(0)
                    .map((_, index) => (
                      <tr key={index}>
                        <td className="bg-secondary rounded-l-[12px] w-1/6">
                          <div className="flex items-center space-x-3">
                            <div className="skeleton w-10 h-8 rounded-full shrink-0"></div>
                            <div className="skeleton h-3 w-24"></div>
                          </div>
                        </td>
                        <td className="bg-secondary w-1/6 hidden lg:table-cell">
                          <div className="skeleton h-2 w-24"></div>
                        </td>
                        <td className="bg-secondary w-1/6 hidden md:table-cell">
                          <div className="skeleton h-2 w-8"></div>
                        </td>
                        <td className="bg-secondary w-1/6 rounded-r-[12px] text-right">
                          <div className="skeleton h-2 w-8 ml-auto"></div>
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
              <table
                className="table w-full border-separate border-spacing-y-3"
                role="grid"
                aria-label="Validators list"
              >
                <thead>
                  <tr className="text-sm font-medium text-[#808080]" role="row">
                    <th className="bg-transparent text-left sticky top-0 bg-base-100 z-10">
                      Moniker
                    </th>
                    <th className=" hidden lg:table-cell bg-transparent text-left sticky top-0 bg-base-100 z-10">
                      Address
                    </th>
                    <th className=" hidden md:table-cell bg-transparent text-left sticky top-0 bg-base-100 z-10">
                      Consensus Power
                    </th>
                    <th className="bg-transparent text-right sticky top-0 bg-base-100 z-10">
                      Remove
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredValidators.map(validator => (
                    <tr
                      key={validator.operator_address}
                      className="group text-black dark:text-white rounded-lg cursor-pointer focus:outline-none transition-colors"
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
                            <ProfileAvatar walletAddress={validator.operator_address} size={32} />
                          )}
                          <span className="font-medium">{validator.description.moniker}</span>
                        </div>
                      </td>

                      <td className="py-4 bg-secondary group-hover:bg-base-300 hidden lg:table-cell">
                        <TruncatedAddressWithCopy slice={10} address={validator.operator_address} />
                      </td>
                      <td className="py-4 bg-secondary group-hover:bg-base-300 hidden md:table-cell">
                        {validator.consensus_power?.toString() ?? 'N/A'}
                      </td>
                      <td
                        className="bg-secondary group-hover:bg-base-300 rounded-r-[12px] py-4 text-right"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          onClick={e => {
                            handleRemove(validator);
                          }}
                          className="btn btn-error btn-sm text-white "
                          aria-label={`Remove validator ${validator.description.moniker}`}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <ValidatorDetailsModal
        key={modalKey}
        validator={selectedValidator}
        modalId={modalId || ''}
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
