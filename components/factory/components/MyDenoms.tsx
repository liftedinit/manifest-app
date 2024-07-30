import ProfileAvatar from "@/utils/identicon";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { MetadataSDKType } from "@chalabi/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank";
import { DenomImage } from "./DenomImage";

export default function MyDenoms({
  denoms,
  isLoading,
  isError,
  refetchDenoms,
  onSelectDenom,
}: {
  denoms: MetadataSDKType[];
  isLoading: boolean;
  isError: Error | null | boolean;
  refetchDenoms: () => void;
  onSelectDenom: (denom: MetadataSDKType) => void;
}) {
  const [selectedDenom, setSelectedDenom] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const denomRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const denomFromUrl = router.query.denom as string;

    if (!selectedDenom && denoms.length > 0 && !isLoading) {
      if (denomFromUrl) {
        setSelectedDenom(denomFromUrl);
        const metadata = denoms.find((denom) => denom.base === denomFromUrl);
        if (metadata) onSelectDenom(metadata);
        scrollToDenom(denomFromUrl);
      } else {
        const defaultDenom = denoms[0].base;
        setSelectedDenom(defaultDenom);
        onSelectDenom(denoms[0]);
        router.push(`?denom=${defaultDenom}`, undefined, {
          shallow: true,
        });
      }
    }
  }, [denoms]);

  const scrollToDenom = (denom: string) => {
    const denomElement = denomRefs.current[denom];
    if (denomElement) {
      denomElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const handleDenomSelect = (denom: MetadataSDKType) => {
    setSelectedDenom(denom.base);
    onSelectDenom(denom);
    router.push(`?denom=${denom.base}`, undefined, {
      shallow: true,
    });
    scrollToDenom(denom.base);
  };

  const renderSkeleton = () => (
    <div className="py-8">
      <div className="skeleton rounded-md mx-auto h-16 w-5/6"></div>
    </div>
  );

  const filteredDenoms = denoms?.filter((denom) =>
    denom?.display.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col rounded-md max-h-[23rem] min-h-[23rem] bg-base-100 shadow w-full p-4">
      <div className="w-full rounded-md ">
        <div className="px-4 py-2 border-base-content flex justify-between items-center">
          <h3 className="text-lg font-bold leading-6">My Tokens</h3>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered input-xs w-1/3 max-w-xs"
          />
        </div>
        <div className="divider divider-horizon -mt-2"></div>
        <div className="overflow-y-auto max-h-[17rem] -mt-4 mb-2 gap-4">
          {isLoading ? renderSkeleton() : null}
          {filteredDenoms?.map((denom, index) => {
            return (
              <div
                key={index}
                ref={(el) => (denomRefs.current[denom.base] = el)}
                className={`relative flex flex-row justify-between rounded-md mb-4 mt-2 items-center px-4 py-2 hover:cursor-pointer transition-all duration-200 ${
                  selectedDenom === denom.base
                    ? "bg-primary border-r-4 border-r-[#263c3add] border-b-[#263c3add] border-b-4"
                    : "bg-base-300 border-r-4 border-r-base-200 border-b-base-200 border-b-4 active:scale-95 hover:bg-base-200"
                }`}
                onClick={() => handleDenomSelect(denom)}
              >
                <DenomImage denom={denom} />

                <div className="ml-2 flex-grow">
                  <h5 className="text-base font-medium truncate">
                    {denom.display.length > 24
                      ? `${denom.display.substring(0, 24)}...`
                      : denom.display}
                  </h5>
                </div>
              </div>
            );
          })}
          {!isLoading && !isError && filteredDenoms?.length === 0 && (
            <div className="text-center mt-6">No tokens found</div>
          )}
        </div>
      </div>
    </div>
  );
}
