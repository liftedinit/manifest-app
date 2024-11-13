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

      // If createDenom is successful, proceed with setDenomMetadata
      const setMetadataMsg = setDenomMetadata({
        sender: address,
        metadata: {
          description: formData.description,
          denomUnits: [
            {
              denom: fullDenom,
              exponent: 0,
              aliases: [],
            },
            {
              denom: formData.subdenom.slice(1).toUpperCase(),
              exponent: 6,
              aliases: [],
            },
          ],
          base: fullDenom,
          display: formData.display,
          name: formData.name,
          symbol: formData.symbol || formData.display,
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
          {/* Token Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4 dark:text-[#FFFFFF99]">Token Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-[12px]">
                <label className="text-sm dark:text-[#FFFFFF66]">Symbol</label>
                <div className="dark:text-[#FFFFFF99]">{formData.symbol || formData.display}</div>
              </div>
              <div className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-[12px]">
                <label className="text-sm dark:text-[#FFFFFF66]">Subdenom</label>
                <div className="dark:text-[#FFFFFF99]">{formData.subdenom}</div>
              </div>
            </div>
            <div className="mt-4 dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-[12px]">
              <label className="text-sm dark:text-[#FFFFFF66]">Description</label>
              <div
                className="overflow-hidden text-ellipsis whitespace-nowrap dark:text-[#FFFFFF99]"
                title={formData.description}
              >
                {formData.description.length > 200
                  ? `${formData.description.slice(0, 200)}...`
                  : formData.description}
              </div>
            </div>
          </div>

          {/* Denom Units */}
          <div>
            <h2 className="text-xl font-semibold mb-4 dark:text-[#FFFFFF99]">Denom Units</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-[12px]">
                <label className="text-sm dark:text-[#FFFFFF66]">Base Denom</label>
                <div className="dark:text-[#FFFFFF99]">{fullDenom}</div>
              </div>
              <div className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-[12px]">
                <label className="text-sm dark:text-[#FFFFFF66]">Display Denom</label>
                <div className="dark:text-[#FFFFFF99]">{formData.subdenom.slice(1)}</div>
              </div>
            </div>
          </div>

          {/* Advanced Details */}
          <div>
            <h2 className="text-xl font-semibold mb-4 dark:text-[#FFFFFF99]">Advanced Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-[12px]">
                <label className="text-sm dark:text-[#FFFFFF66]">URI</label>
                <div className="dark:text-[#FFFFFF99]">{formData.uri || 'N/A'}</div>
              </div>
              <div className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-[12px]">
                <label className="text-sm dark:text-[#FFFFFF66]">URI Hash</label>
                <div className="dark:text-[#FFFFFF99]">{formData.uriHash || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-6  mt-6 mx-auto w-full">
        <button onClick={prevStep} className="btn btn-neutral w-[calc(50%-12px)]">
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
