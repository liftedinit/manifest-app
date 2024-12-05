import React, { useMemo, useState } from 'react';
import { chainName } from '@/config';
import { useTokenFactoryBalance, useFeeEstimation, useTx } from '@/hooks';
import { cosmos, osmosis, liftedinit } from '@liftedinit/manifestjs';

import { MdContacts } from 'react-icons/md';
import { parseNumberToBigInt, shiftDigits } from '@/utils';
import { Any } from '@liftedinit/manifestjs/dist/codegen/google/protobuf/any';
import { MsgBurnHeldBalance } from '@liftedinit/manifestjs/dist/codegen/liftedinit/manifest/v1/tx';

import { useToast } from '@/contexts';
import { Formik, Form } from 'formik';
import Yup from '@/utils/yupExtensions';
import { NumberInput, TextInput } from '@/components/react/inputs';
import { ExtendedMetadataSDKType, truncateString } from '@/utils';
import { TailwindModal } from '@/components/react/modal';

interface BurnPair {
  address: string;
  amount: string;
}

interface BurnFormProps {
  isAdmin: boolean;
  admin: string;
  denom: ExtendedMetadataSDKType;
  address: string;
  refetch: () => void;
  balance: string;
  totalSupply: string;
  onMultiBurnClick: () => void;
}

export default function BurnForm({
  isAdmin,
  admin,
  denom,
  address,
  refetch,
  balance,
  totalSupply,
  onMultiBurnClick,
}: BurnFormProps) {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState(address);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [burnPairs, setBurnPairs] = useState<BurnPair[]>([{ address: '', amount: '' }]);

  const [isContactsOpen, setIsContactsOpen] = useState(false);

  const { tx, isSigning, setIsSigning } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);
  const { burn } = osmosis.tokenfactory.v1beta1.MessageComposer.withTypeUrl;
  const { burnHeldBalance } = liftedinit.manifest.v1.MessageComposer.withTypeUrl;
  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;
  const { setToastMessage } = useToast();
  const exponent = denom?.denom_units?.find(unit => unit.denom === denom.display)?.exponent || 0;
  const isMFX = denom.base.includes('mfx');

  const { balance: recipientBalance } = useTokenFactoryBalance(recipient ?? '', denom.base);
  const balanceNumber = useMemo(
    () =>
      parseFloat(
        shiftDigits(
          isMFX ? recipientBalance?.amount || '0' : recipientBalance?.amount || '0',
          -exponent
        )
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recipientBalance?.amount, balance, exponent, isMFX, recipient]
  );

  const BurnSchema = Yup.object().shape({
    amount: Yup.number()
      .positive('Amount must be positive')
      .required('Amount is required')
      .test('max-balance', 'Amount exceeds balance', function (value) {
        return value <= balanceNumber;
      }),
    recipient: Yup.string().required('Recipient address is required').manifestAddress(),
  });

  // Format balance safely
  function formatAmount(amount: string | null | undefined): string {
    if (amount == null) {
      return '-';
    }
    try {
      return Number(shiftDigits(amount, -exponent)).toLocaleString(undefined, {
        maximumFractionDigits: exponent,
      });
    } catch (error) {
      console.warn('Error formatting amount:', error);
      return 'x';
    }
  }

  const handleBurn = async () => {
    if (!amount || Number.isNaN(Number(amount))) {
      return;
    }
    setIsSigning(true);
    try {
      const amountInBaseUnits = parseNumberToBigInt(amount, exponent).toString();
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
          amount: parseNumberToBigInt(pair.amount, exponent).toString(),
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

  return (
    <div className="animate-fadeIn text-sm z-10">
      <div className="rounded-lg">
        {isMFX && !isAdmin ? (
          <div className="w-full p-2 justify-center items-center my-auto leading-tight text-xl flex flex-col font-medium text-pretty">
            <span>You must be apart of the admin group to burn MFX.</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-light text-gray-500 dark:text-gray-400 mb-2">NAME</p>
                <div className="bg-base-300 p-4 rounded-md">
                  <p className="font-semibold text-md max-w-[20ch] truncate text-black dark:text-white">
                    {denom.name}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-light text-gray-500 dark:text-gray-400 mb-2">
                  CIRCULATING SUPPLY
                </p>
                <div className="bg-base-300 p-4 rounded-md">
                  <p className="font-semibold text-md text-black truncate dark:text-white">
                    {Number(shiftDigits(totalSupply, -exponent)).toLocaleString(undefined, {
                      maximumFractionDigits: exponent,
                    })}{' '}
                  </p>
                </div>
              </div>
            </div>
            {!denom.base.includes('umfx') && (
              <Formik
                initialValues={{ amount: '', recipient: address }}
                validationSchema={BurnSchema}
                onSubmit={values => {
                  setAmount(values.amount);
                  setRecipient(values.recipient);
                  handleBurn();
                }}
                validateOnChange={true}
                validateOnBlur={true}
              >
                {({ isValid, dirty, setFieldValue, errors, touched }) => (
                  <Form>
                    <div className="flex space-x-4 mt-8">
                      <div className="flex-grow relative">
                        <NumberInput
                          showError={false}
                          label="AMOUNT"
                          name="amount"
                          placeholder="Enter amount"
                          value={amount}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setAmount(e.target.value);
                            setFieldValue('amount', e.target.value);
                          }}
                          className={`input input-bordered w-full ${
                            touched.amount && errors.amount ? 'input-error' : ''
                          }`}
                        />
                        {touched.amount && errors.amount && (
                          <div
                            className="tooltip tooltip-bottom tooltip-open tooltip-error bottom-0 absolute left-1/2 transform -translate-x-1/2 translate-y-full mt-1 z-50 text-white text-xs"
                            data-tip={errors.amount}
                          >
                            <div className="w-0 h-0"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex-grow relative">
                        <TextInput
                          showError={false}
                          label="TARGET"
                          name="recipient"
                          placeholder="Recipient address"
                          value={recipient}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setRecipient(e.target.value);
                            setFieldValue('recipient', e.target.value);
                          }}
                          className={`input input-bordered w-full transition-none ${
                            touched.recipient && errors.recipient ? 'input-error' : ''
                          }`}
                          rightElement={
                            <button
                              type="button"
                              aria-label="contacts-btn"
                              onClick={() => setIsContactsOpen(true)}
                              className="btn btn-primary btn-sm text-white"
                            >
                              <MdContacts className="w-5 h-5" />
                            </button>
                          }
                        />
                        {touched.recipient && errors.recipient && (
                          <div
                            className="tooltip tooltip-bottom tooltip-open tooltip-error bottom-0 absolute left-1/2 transform -translate-x-1/2 translate-y-full mt-1 z-50 text-white text-xs"
                            data-tip={errors.recipient}
                          >
                            <div className="w-0 h-0"></div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end mt-6">
                      <button
                        type="submit"
                        aria-label={`burn-btn-${denom.base}`}
                        className="btn btn-error disabled:bg-error/40 disabled:text-white/40 btn-md flex-grow text-white"
                        disabled={isSigning || !isValid || !dirty}
                      >
                        {isSigning ? (
                          <span className="loading loading-dots loading-xs"></span>
                        ) : (
                          `Burn ${
                            denom.display.startsWith('factory')
                              ? denom.display.split('/').pop()?.toUpperCase()
                              : truncateString(denom.display, 12)
                          }`
                        )}
                      </button>
                    </div>
                    <TailwindModal
                      isOpen={isContactsOpen}
                      setOpen={setIsContactsOpen}
                      showContacts={true}
                      currentAddress={address}
                      onSelect={(selectedAddress: string) => {
                        setRecipient(selectedAddress);
                        setFieldValue('recipient', selectedAddress);
                      }}
                    />
                  </Form>
                )}
              </Formik>
            )}
          </>
        )}
      </div>
      {isMFX && (
        <button
          type="button"
          onClick={onMultiBurnClick}
          className="btn btn-error btn-md flex-grow w-full text-white mt-6"
          aria-label="multi-burn-button"
          disabled={!isAdmin}
        >
          Multi Burn
        </button>
      )}
    </div>
  );
}
