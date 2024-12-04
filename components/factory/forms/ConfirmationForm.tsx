import { useState } from 'react';
import { TokenFormData } from '@/helpers/formReducer';
import { useFeeEstimation } from '@/hooks/useFeeEstimation';
import { useTx } from '@/hooks/useTx';
import { osmosis } from '@liftedinit/manifestjs';
import { chainName } from '@/config';

export default function ConfirmationForm({
  nextStep,
  prevStep,
  formData,
  address,
}: Readonly<{
  nextStep: () => void;
  prevStep: () => void;
  formData: TokenFormData;
  address: string;
}>) {
  const { tx, isSigning, setIsSigning } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);
  const { setDenomMetadata, createDenom } =
    osmosis.tokenfactory.v1beta1.MessageComposer.withTypeUrl;

  const fullDenom = `factory/${address}/${formData.subdenom}`;

  const handleConfirm = async () => {
    setIsSigning(true);

    try {
      // First, create the denom
      const createDenomMsg = createDenom({
        sender: address,
        subdenom: formData.subdenom,
      });

      const createDenomFee = await estimateFee(address, [createDenomMsg]);
      const createDenomResult = await tx([createDenomMsg], {
        fee: createDenomFee,
        returnError: true,
      });

      if (createDenomResult && createDenomResult.error) {
        console.error('Error creating denom:', createDenomResult.error);
        return;
      }

      const symbol = formData.subdenom.slice(1).toUpperCase();
      // If createDenom is successful, proceed with setDenomMetadata
      const setMetadataMsg = setDenomMetadata({
        sender: address,
        metadata: {
          description: formData.description,
          denomUnits: [
            {
              denom: fullDenom,
              exponent: 0,
              aliases: [symbol],
            },
            {
              denom: symbol,
              exponent: 6,
              aliases: [fullDenom],
            },
          ],
          base: fullDenom,
          display: formData.display,
          name: formData.name,
          symbol: formData.display,
          uri: formData.uri,
          uriHash: formData.uriHash,
        },
      });

      const setMetadataFee = await estimateFee(address, [setMetadataMsg]);
      await tx([setMetadataMsg], {
        fee: setMetadataFee,
        onSuccess: () => {
          nextStep();
        },
        returnError: true,
      });
    } catch (error) {
      console.error('Error during transaction setup:', error);
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <section>
      <div className="w-full dark:bg-[#FFFFFF0F] bg-[#FFFFFFCC] p-[24px] rounded-[24px]">
        <div className="flex justify-center p-4 rounded-[8px] mb-6 w-full dark:bg-[#FAFAFA1F] bg-[#A087FF1F] items-center">
          <h1 className="text-xl text-primary font-bold">{formData.name}</h1>
        </div>

        <div className="space-y-6">
          <div className="text-md">
            You will be required to sign two messages: the first to create the token on the
            blockchain, and the second to configure the token&#39;s metadata, including its name,
            symbol, description, and other details.
          </div>
          {/* Token Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4 ">Token Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-base-300 p-4 rounded-[12px]">
                <label className="text-sm text-gray-500 dark:text-gray-400">Symbol</label>
                <div className="">{formData.symbol || formData.display}</div>
              </div>
              <div className="bg-base-300 p-4 rounded-[12px]">
                <label className="text-sm text-gray-500 dark:text-gray-400">Logo URL</label>
                <div className="">{formData.uri || 'N/A'}</div>
              </div>
            </div>
            <div className="mt-4 bg-base-300 p-4 rounded-[12px]">
              <label className="text-sm text-gray-500 dark:text-gray-400">Description</label>
              <div
                className="overflow-hidden text-ellipsis whitespace-nowrap "
                title={formData.description}
              >
                {formData.description.length > 200
                  ? `${formData.description.slice(0, 200)}...`
                  : formData.description}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-6  mt-6 mx-auto w-full">
        <button
          onClick={prevStep}
          className="btn btn-neutral dark:text-white text-black w-[calc(50%-12px)]"
        >
          Edit Token Metadata
        </button>
        <button
          onClick={handleConfirm}
          disabled={isSigning}
          className="w-[calc(50%-12px)] btn px-5 py-2.5 sm:py-3.5 btn-gradient text-white disabled:text-black"
        >
          {isSigning ? (
            <span className="loading loading-dots loading-sm"></span>
          ) : (
            'Sign Transaction'
          )}
        </button>
      </div>
    </section>
  );
}
