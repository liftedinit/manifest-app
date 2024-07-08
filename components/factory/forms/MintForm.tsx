import { MetadataSDKType } from "@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank";

export default function MintForm({ denom }: { denom: MetadataSDKType }) {
  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold mb-4">Mint {denom.display}</h2>
    </div>
  );
}
