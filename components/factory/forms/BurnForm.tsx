import React, { useState } from 'react';
import { chainName } from '@/config';
import { useFeeEstimation, useTx } from '@/hooks';
import { cosmos, manifest, osmosis } from '@chalabi/manifestjs';
import { MetadataSDKType } from '@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import { PiAddressBook } from 'react-icons/pi';
import { shiftDigits } from '@/utils';
import { Any } from '@chalabi/manifestjs/dist/codegen/google/protobuf/any';
import { MsgBurnHeldBalance } from '@chalabi/manifestjs/dist/codegen/manifest/v1/tx';
import { MultiBurnModal } from '../modals/multiMfxBurnModal';
import { useToast } from '@/contexts';

interface BurnPair {
  address: string;
  amount: string;
}

export default function BurnForm({
  isAdmin,
  admin,
  denom,
  address,
  refetch,
  balance,
}: Readonly<{
  isAdmin: boolean;
  admin: string;
  denom: MetadataSDKType;
  address: string;
  refetch: () => void;
  balance: string;
}>) {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState(address);
  const [isSigning, setIsSigning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [burnPairs, setBurnPairs] = useState<BurnPair[]>([{ address: '', amount: '' }]);

  const { tx } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);
  const { burn } = osmosis.tokenfactory.v1beta1.MessageComposer.withTypeUrl;
  const { burnHeldBalance } = manifest.v1.MessageComposer.withTypeUrl;
  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;
  const { setToastMessage } = useToast();
  const exponent = denom?.denom_units?.find(unit => unit.denom === denom.display)?.exponent || 0;
  const isMFX = denom.base.includes('mfx');

  const handleBurn = async () => {
    if (!amount || isNaN(Number(amount))) {
      return;
    }
    setIsSigning(true);
    try {
      const amountInBaseUnits = BigInt(parseFloat(amount) * Math.pow(10, exponent)).toString();

      let msg;
      if (isMFX) {
        const burnMsg = burnHeldBalance({
          authority: admin ?? '',
          burnCoins: [{ denom: denom.base, amount: amountInBaseUnits }],
        });
        const encodedMessage = Any.fromPartial({
          typeUrl: burnMsg.typeUrl,
          value: MsgBurnHeldBalance.encode(burnMsg.value).finish(),
        });
        msg = submitProposal({
          groupPolicyAddress: admin ?? '',
          messages: [encodedMessage],
          metadata: '',
          proposers: [address ?? ''],
          title: `Manifest Module Control: Burn MFX`,
          summary: `This proposal includes a burn action for MFX.`,
          exec: 0,
        });
      } else {
        msg = burn({
          amount: {
            amount: amountInBaseUnits,
            denom: denom.base,
          },
          sender: address,
          burnFromAddress: recipient,
        });
      }

      const fee = await estimateFee(address ?? '', [msg]);
      await tx([msg], {
        fee,
        onSuccess: () => {
          setAmount('');
          refetch();
        },
      });
    } catch (error) {
      console.error('Error during burning:', error);
    } finally {
      setIsSigning(false);
    }
  };

  const handleMultiBurn = async () => {
    if (burnPairs.some(pair => !pair.address || !pair.amount || isNaN(Number(pair.amount)))) {
      setToastMessage({
        type: 'alert-error',
        title: 'Missing fields',
        description: 'Please fill in all fields with valid values.',
        bgColor: '#e74c3c',
      });
      return;
    }
    setIsSigning(true);
    try {
      const burnMsg = burnHeldBalance({
        authority: admin ?? '',
        burnCoins: burnPairs.map(pair => ({
          denom: denom.base,
          amount: BigInt(parseFloat(pair.amount) * Math.pow(10, exponent)).toString(),
        })),
      });
      const encodedMessage = Any.fromPartial({
        typeUrl: burnMsg.typeUrl,
        value: MsgBurnHeldBalance.encode(burnMsg.value).finish(),
      });
      const msg = submitProposal({
        groupPolicyAddress: admin ?? '',
        messages: [encodedMessage],
        metadata: '',
        proposers: [address ?? ''],
        title: `Manifest Module Control: Multi Burn MFX`,
        summary: `This proposal includes multiple burn actions for MFX.`,
        exec: 0,
      });

      const fee = await estimateFee(address ?? '', [msg]);
      await tx([msg], {
        fee,
        onSuccess: () => {
          setBurnPairs([{ address: '', amount: '' }]);
          setIsModalOpen(false);
          refetch();
        },
      });
    } catch (error) {
      console.error('Error during multi-burning:', error);
    } finally {
      setIsSigning(false);
    }
  };

  const addBurnPair = () => setBurnPairs([...burnPairs, { address: '', amount: '' }]);
  const removeBurnPair = (index: number) => setBurnPairs(burnPairs.filter((_, i) => i !== index));
  const updateBurnPair = (index: number, field: 'address' | 'amount', value: string) => {
    const newPairs = [...burnPairs];
    newPairs[index][field] = value;
    setBurnPairs(newPairs);
  };

  const handleAddressBookClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setRecipient(address);
  };

  return (
    <div className="animate-fadeIn text-sm z-10">
      <div className="rounded-lg mb-8">
        {isMFX && !isAdmin ? (
          <div className="w-full p-2 justify-center items-center my-auto h-full mt-24 leading-tight text-xl flex flex-col font-medium text-pretty">
            <span>You are not affiliated with any PoA Admin entity.</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">NAME</p>
                <p className="font-semibold text-md max-w-[20ch] truncate">{denom.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">YOUR BALANCE</p>
                <p className="font-semibold text-md">{shiftDigits(balance, -exponent)}</p>
              </div>
              <div>
                <p className="text-md text-gray-500">EXPONENT</p>
                <p className="font-semibold text-md">{denom?.denom_units[1]?.exponent}</p>
              </div>
              <div>
                <p className="text-md text-gray-500">CIRCULATING SUPPLY</p>
                <p className="font-semibold text-md max-w-[20ch] truncate">{denom.display}</p>
              </div>
            </div>
            <div className="flex space-x-4 mt-8">
              <div className="flex-1">
                <label className="label p-0">
                  <p className="text-md">AMOUNT</p>
                </label>
                <input
                  type="text"
                  placeholder="Enter amount"
                  className="input input-bordered h-10 input-sm w-full"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="label p-0">
                  <p className="text-md">TARGET</p>
                </label>
                <div className="flex flex-row items-center">
                  <input
                    type="text"
                    placeholder="Target address"
                    className="input input-bordered input-sm h-10 rounded-tl-lg rounded-bl-lg rounded-tr-none rounded-br-none w-full"
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                  />
                  <button
                    onClick={handleAddressBookClick}
                    className="btn btn-secondary btn-sm h-10 rounded-tr-lg rounded-br-lg rounded-bl-none rounded-tl-none"
                  >
                    <PiAddressBook className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-2">
              <button
                onClick={handleBurn}
                className="btn btn-secondary btn-md flex-grow"
                disabled={isSigning}
              >
                {isSigning ? <span className="loading loading-dots loading-xs"></span> : 'Burn'}
              </button>
              {isMFX && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn btn-secondary btn-md"
                  aria-label={'multi-burn-btn'}
                >
                  Multi Burn
                </button>
              )}
            </div>
            {isMFX && (
              <MultiBurnModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                burnPairs={burnPairs}
                updateBurnPair={updateBurnPair}
                addBurnPair={addBurnPair}
                removeBurnPair={removeBurnPair}
                handleMultiBurn={handleMultiBurn}
                isSigning={isSigning}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
