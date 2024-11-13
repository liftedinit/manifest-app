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
}: ValidatorListProps) {
  const [active, setActive] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValidator, setSelectedValidator] = useState<ExtendedValidatorSDKType | null>(null);
  const [modalId, setModalId] = useState<string | null>(null);

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

  useEffect(() => {
    if (modalId) {
      const modal = document.getElementById(modalId) as HTMLDialogElement;
      modal?.showModal();
    }
  }, [modalId]);

  const filteredValidators = useMemo(() => {
    const validators = active ? activeValidators : pendingValidators;
    return validators.filter(validator =>
      validator.description.moniker.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [active, activeValidators, pendingValidators, searchTerm]);

  const handleRemove = (validator: ExtendedValidatorSDKType) => {
    setValidatorToRemove(validator);

    const modal = document.getElementById(`warning-modal`) as HTMLDialogElement;
    modal?.showModal();
  };

  const [modalKey, setModalKey] = useState(0);

  const handleRowClick = (validator: ExtendedValidatorSDKType) => {
    setSelectedValidator(validator);
    setModalKey(prevKey => prevKey + 1);
    setModalId(`validator-modal-${validator.operator_address}-${Date.now()}`);
  };

  return (
    <div className="w-full max-w-screen mx-auto">
      <div className="">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-6">
          <h2
            className="text-black dark:text-white"
            style={{ fontSize: '20px', fontWeight: 700, lineHeight: '24px' }}
          >
            Validators
          </h2>
          <div className="relative w-[224px]">
            <input
              type="text"
              placeholder="Search for a validator..."
              className="input input-bordered w-full h-[40px] rounded-[12px] border-none bg-[#0000000A] dark:bg-[#FFFFFF1F] pl-10 text-[#161616] dark:text-white placeholder-[#00000099] dark:placeholder-[#FFFFFF99]"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#00000099] dark:text-[#FFFFFF99]" />
          </div>
        </div>
        <div className="flex mb-6 w-full h-[3.5rem] rounded-xl p-1 bg-[#0000000A] dark:bg-[#FFFFFF0F]">
          <button
            onClick={() => setActive(true)}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-xl  ${
              active
                ? 'dark:bg-[#FFFFFF1F] bg-[#FFFFFF] text-[#161616] dark:text-white'
                : 'text-[#808080]'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActive(false)}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-xl  ${
              !active
                ? 'dark:bg-[#FFFFFF1F] bg-[#FFFFFF] text-[#161616] dark:text-white'
                : 'text-[#808080]'
            }`}
          >
            Pending
          </button>
        </div>
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-300px)]">
          {filteredValidators.length === 0 ? (
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
                    className="bg-[#FFFFFFCC] dark:bg-[#FFFFFF0F] hover:bg-[#FFFFFF66] dark:hover:bg-[#FFFFFF1A] text-black dark:text-white rounded-lg cursor-pointer"
                    onClick={() => handleRowClick(validator)}
                    role="row"
                    aria-label={`Validator ${validator.description.moniker}`}
                  >
                    <td className="rounded-l-[12px] py-4">
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

                    <td className="py-4 hidden lg:table-cell">
                      <TruncatedAddressWithCopy slice={10} address={validator.operator_address} />
                    </td>
                    <td className="py-4 hidden md:table-cell">
                      {validator.consensus_power?.toString() ?? 'N/A'}
                    </td>
                    <td className="rounded-r-[12px] py-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleRemove(validator);
                        }}
                        className="btn btn-error btn-sm text-white "
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

      <ValidatorDetailsModal
        key={modalKey}
        validator={selectedValidator}
        modalId={modalId || ''}
        admin={admin}
        totalvp={totalvp.toString()}
        validatorVPArray={validatorVPArray}
      />
      <WarningModal
        admin={admin}
        isActive={active}
        address={validatorToRemove?.operator_address || ''}
        moniker={validatorToRemove?.description.moniker || ''}
        modalId="warning-modal"
      />
    </div>
  );
}
