import { MetadataSDKType } from "@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank";

export default function TransferForm({ denom }: { denom: MetadataSDKType }) {
  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold mb-4">Transfer {denom.display}</h2>
      {/* Add form fields for transferring */}
    </div>
  );
}
