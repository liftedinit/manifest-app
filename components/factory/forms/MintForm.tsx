import React, { useState } from 'react';
import { chainName } from '@/config';
import { useFeeEstimation, useTx } from '@/hooks';
import { osmosis } from '@liftedinit/manifestjs';

import { shiftDigits } from '@/utils';
import { MdContacts } from 'react-icons/md';

import { Formik, Form } from 'formik';
import Yup from '@/utils/yupExtensions';
import { NumberInput, TextInput } from '@/components/react/inputs';
import { ExtendedMetadataSDKType, truncateString } from '@/utils';
import { TailwindModal } from '@/components/react/modal';

export default function MintForm({
  isAdmin,
  admin,
  denom,
  address,
  refetch,
  balance,
  totalSupply,
  onMultiMintClick,
}: Readonly<{
  isAdmin: boolean;
  admin: string;
  denom: ExtendedMetadataSDKType;
  address: string;
  refetch: () => void;
  balance: string;
  totalSupply: string;
  onMultiMintClick: () => void;
}>) {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState(address);
  const [isContactsOpen, setIsContactsOpen] = useState(false);

  const { tx, isSigning, setIsSigning } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);
  const { mint } = osmosis.tokenfactory.v1beta1.MessageComposer.withTypeUrl;

  const exponent =
    denom?.denom_units?.find((unit: { denom: string }) => unit.denom === denom.display)?.exponent ||
    0;
  const isMFX = denom.base.includes('mfx');

  const MintSchema = Yup.object().shape({
    amount: Yup.number()
      .positive('Amount must be positive')
      .required('Amount is required')
      .max(1e12, 'Amount is too large'),
    recipient: Yup.string().required('Recipient address is required').manifestAddress(),
  });

  const handleMint = async () => {
    if (!amount || Number.isNaN(Number(amount))) {
      return;
    }
    setIsSigning(true);
    try {
      const amountInBaseUnits = BigInt(parseFloat(amount) * Math.pow(10, exponent)).toString();

      let msg;

      msg = mint({
        amount: {
          amount: amountInBaseUnits,
          denom: denom.base,
        },
        sender: address,
        mintToAddress: recipient,
      });

      const fee = await estimateFee(address ?? '', [msg]);
      await tx([msg], {
        fee,
        onSuccess: () => {
          setAmount('');
          refetch();
        },
      });
    } catch (error) {
      console.error('Error during minting:', error);
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="animate-fadeIn text-sm z-10">
      <div className="rounded-lg">
        {isMFX && !isAdmin ? (
          <div className="w-full p-2 justify-center items-center my-auto leading-tight text-xl flex flex-col font-medium text-pretty">
            <span>You must be a member of the admin group to mint MFX.</span>
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
                  YOUR BALANCE
                </p>
                <div className="bg-base-300 p-4 rounded-md">
                  <p className="font-semibold text-md text-black dark:text-white">
                    {Number(shiftDigits(balance, -exponent)).toLocaleString(undefined, {
                      maximumFractionDigits: exponent,
                    })}
                  </p>
                </div>
              </div>
              {denom?.denom_units[1]?.exponent && (
                <div>
                  <p className="text-sm font-light text-gray-500 dark:text-gray-400 mb-2">
                    EXPONENT
                  </p>
                  <div className="bg-base-300 p-4 rounded-md">
                    <p className="font-semibold text-md text-black dark:text-white">
                      {denom?.denom_units[1]?.exponent}
                    </p>
                  </div>
                </div>
              )}
              {totalSupply !== '0' && (
                <div>
                  <p className="text-sm font-light text-gray-500 dark:text-gray-400 mb-2">
                    CIRCULATING SUPPLY
                  </p>
                  <div className="bg-base-300 p-4 rounded-md">
                    <p className="font-semibold text-md max-w-[20ch] truncate text-black dark:text-white">
                      {Number(shiftDigits(totalSupply, -exponent)).toLocaleString(undefined, {
                        maximumFractionDigits: exponent,
                      })}{' '}
                      {denom.display.toUpperCase()}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {!denom.base.includes('umfx') && (
              <Formik
                initialValues={{ amount: '', recipient: address }}
                validationSchema={MintSchema}
                onSubmit={values => {
                  setAmount(values.amount);
                  setRecipient(values.recipient);
                  handleMint();
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
                          label="RECIPIENT"
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
                              style={{ transition: 'none' }}
                              onClick={() => setIsContactsOpen(true)}
                              className="btn btn-primary transition-none btn-sm text-white absolute right-2 top-1/2 -translate-y-1/2"
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
                      {!denom.base.includes('umfx') && (
                        <button
                          type="submit"
                          className="btn btn-gradient btn-md flex-grow text-white"
                          disabled={isSigning || !isValid || !dirty}
                        >
                          {isSigning ? (
                            <span className="loading loading-dots loading-xs"></span>
                          ) : (
                            `Mint ${truncateString(denom.display ?? 'Denom', 20).toUpperCase()}`
                          )}
                        </button>
                      )}
                    </div>
                    <TailwindModal
                      isOpen={isContactsOpen}
                      setOpen={setIsContactsOpen}
                      showContacts={true}
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
          onClick={onMultiMintClick}
          className="btn btn-gradient btn-md flex-grow w-full text-white mt-6"
          aria-label="multi-mint-button"
          disabled={!isAdmin}
        >
          Multi Mint
        </button>
      )}
    </div>
  );
}
