import React, { useState } from 'react';
import { useFeeEstimation, useTx } from '@/hooks';
import { cosmos, osmosis } from '@liftedinit/manifestjs';

import { parseNumberToBigInt, shiftDigits, ExtendedMetadataSDKType, truncateString } from '@/utils';
import { MdContacts } from 'react-icons/md';

import { Formik, Form } from 'formik';
import Yup from '@/utils/yupExtensions';
import { NumberInput, TextInput } from '@/components/react/inputs';
import { TailwindModal } from '@/components/react/modal';
import env from '@/config/env';
import { Any } from 'cosmjs-types/google/protobuf/any';
import { MsgMint } from '@liftedinit/manifestjs/dist/codegen/osmosis/tokenfactory/v1beta1/tx';

export default function MintForm({
  isAdmin,
  denom,
  address,
  refetch,
  balance,
  totalSupply,
  isGroup,
  admin,
  onMultiMintClick,
}: Readonly<{
  isAdmin: boolean;
  denom: ExtendedMetadataSDKType;
  address: string;
  refetch: () => void;
  balance: string;
  totalSupply: string;
  isGroup?: boolean;
  admin?: string;
  onMultiMintClick: () => void;
}>) {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState(address);
  const [isContactsOpen, setIsContactsOpen] = useState(false);

  const { tx, isSigning, setIsSigning } = useTx(env.chain);
  const { estimateFee } = useFeeEstimation(env.chain);
  const { mint } = osmosis.tokenfactory.v1beta1.MessageComposer.withTypeUrl;
  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;

  const isMFX = denom.base.includes('mfx');

  const MintSchema = Yup.object().shape({
    amount: Yup.number().positive('Amount must be positive').required('Amount is required'),
    recipient: Yup.string().required('Recipient address is required').manifestAddress(),
  });

  const handleMint = async () => {
    if (!amount || Number.isNaN(Number(amount))) {
      return;
    }
    setIsSigning(true);
    try {
      const amountInBaseUnits = parseNumberToBigInt(amount).toString();
      let msg;

      msg = isGroup
        ? submitProposal({
            groupPolicyAddress: admin!,
            messages: [
              Any.fromPartial({
                typeUrl: MsgMint.typeUrl,
                value: MsgMint.encode(
                  mint({
                    amount: {
                      amount: amountInBaseUnits,
                      denom: denom.base,
                    },
                    sender: admin!,
                    mintToAddress: recipient,
                  }).value
                ).finish(),
              }),
            ],
            metadata: '',
            proposers: [address],
            title: `Mint Tokens`,
            summary: `This proposal will mint ${amount} ${denom.display} to ${recipient}`,
            exec: 0,
          })
        : mint({
            amount: {
              amount: amountInBaseUnits,
              denom: denom.base,
            },
            sender: address,
            mintToAddress: recipient,
          });

      console.log('Estimating fee for address (mint):', address);
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
                  <p className="font-semibold text-md  truncate text-black dark:text-white">
                    {denom.name}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-light text-gray-500 truncate dark:text-gray-400 mb-2">
                  CIRCULATING SUPPLY
                </p>
                <div className="bg-base-300 p-4 rounded-md">
                  <p className="font-semibold text-md truncate text-black dark:text-white">
                    {Number(shiftDigits(totalSupply, -6)).toLocaleString(undefined, {
                      maximumFractionDigits: 6,
                    })}{' '}
                  </p>
                </div>
              </div>
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
                      {!denom.base.includes('umfx') && (
                        <button
                          type="submit"
                          aria-label={`mint-btn-${denom.display}`}
                          className="btn btn-gradient btn-md flex-grow text-white"
                          disabled={isSigning || !isValid || !dirty}
                        >
                          {isSigning ? (
                            <span className="loading loading-dots loading-xs"></span>
                          ) : (
                            `Mint ${
                              denom.display.startsWith('factory')
                                ? denom.display.split('/').pop()?.toUpperCase()
                                : truncateString(denom.display, 12)
                            }`
                          )}
                        </button>
                      )}
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
