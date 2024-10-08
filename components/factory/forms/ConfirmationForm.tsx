import { useState } from 'react';
import { TokenFormData } from '@/helpers/formReducer';
import { useFeeEstimation } from '@/hooks/useFeeEstimation';
import { useTx } from '@/hooks/useTx';
import { osmosis } from '@chalabi/manifestjs';
import { chainName } from '@/config';
import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';

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
  const [isSigning, setIsSigning] = useState(false);
  const { tx } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);
  const { setDenomMetadata } = osmosis.tokenfactory.v1beta1.MessageComposer.withTypeUrl;

  const fullDenom = `factory/${address}/${formData.subdenom}`;

  const handleConfirm = async () => {
    setIsSigning(true);
    try {
      const msg = setDenomMetadata({
        sender: address,
        metadata: {
          description: formData.description,
          denomUnits: [
            {
              denom: fullDenom,
              exponent: 0,
              aliases: formData.denomUnits[0].aliases,
            },
            {
              denom: formData.denomUnits[1].denom,
              exponent: formData.denomUnits[1].exponent,
              aliases: formData.denomUnits[1].aliases,
            },
          ],
          base: fullDenom,
          display: formData.display,
          name: formData.display,
          symbol: formData.symbol,
          uri: formData.uri,
          uriHash: formData.uriHash,
        },
      });

      const fee = await estimateFee(address ?? '', [msg]);
      await tx([msg], {
        fee,
        onSuccess: () => {
          nextStep();
        },
      });
    } catch (error) {
      setIsSigning(false);
      console.error('Error during transaction setup:', error);
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <section>
      <div className="w-full dark:bg-[#FFFFFF0F] bg-[#FFFFFFCC] p-[24px] rounded-[24px]">
        <div className="flex justify-center p-4 rounded-[8px] mb-6 w-full dark:bg-[#FAFAFA1F] bg-[#A087FF1F] items-center">
          <h1 className="text-xl text-primary font-bold">{formData.display}</h1>
        </div>

        <div className="space-y-6">
          {/* Token Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4 dark:text-[#FFFFFF99]">Token Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-[12px]">
                <label className="text-sm dark:text-[#FFFFFF66]">Symbol</label>
                <div className="dark:text-[#FFFFFF99]">{formData.symbol}</div>
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
          <div className="max-h-44 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 dark:text-[#FFFFFF99]">Denom Units</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-[12px]">
                <label className="text-sm dark:text-[#FFFFFF66]">Base Denom</label>
                <div className="dark:text-[#FFFFFF99]">{fullDenom}</div>
              </div>
              <div className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-[12px]">
                <label className="text-sm dark:text-[#FFFFFF66]">Base Exponent</label>
                <div className="dark:text-[#FFFFFF99]">0</div>
              </div>
              <div className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-[12px]">
                <label className="text-sm dark:text-[#FFFFFF66]">Display Denom</label>
                <div className="dark:text-[#FFFFFF99]">{formData.display}</div>
              </div>
              <div className="dark:bg-[#2A2A38] bg-[#FFFFFF] p-4 rounded-[12px]">
                <label className="text-sm dark:text-[#FFFFFF66]">Display Exponent</label>
                <div className="dark:text-[#FFFFFF99]">{formData.denomUnits[1].exponent}</div>
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
      <div className="flex space-x-3 mt-6 mx-auto w-full">
        <button onClick={prevStep} className="btn btn-neutral w-1/2">
          Edit Token Metadata
        </button>
        <button
          onClick={handleConfirm}
          disabled={isSigning}
          className="w-1/2 btn btn-gradient text-white"
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
