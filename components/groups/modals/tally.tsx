import { QueryTallyResultResponseSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/query';
import { useMemo } from 'react';
import BigNumber from 'bignumber.js';

interface TallyProps {
  tallies: QueryTallyResultResponseSDKType;
}

export function Tally({ tallies }: TallyProps) {
  const tallyYes = useMemo(() => {
    const yes = BigNumber(tallies.tally?.yes_count);
    return yes.isFinite() ? yes : BigNumber(0);
  }, [tallies]);

  const tallyNo = useMemo(() => {
    const no = BigNumber(tallies.tally?.no_count);
    return no.isFinite() ? no : BigNumber(0);
  }, [tallies]);

  const tallyVeto = useMemo(() => {
    const veto = BigNumber(tallies.tally?.no_with_veto_count);
    return veto.isFinite() ? veto : BigNumber(0);
  }, [tallies]);

  const tallyAbstain = useMemo(() => {
    const abstain = BigNumber(tallies.tally?.abstain_count);
    return abstain.isFinite() ? abstain : BigNumber(0);
  }, [tallies]);

  const totalTally = useMemo(() => {
    return BigNumber.sum(tallyYes, tallyNo, tallyVeto, tallyAbstain);
  }, [tallyYes, tallyNo, tallyVeto, tallyAbstain]);

  const tallyYesPercentage = useMemo(() => {
    return totalTally.isZero() ? BigNumber(0) : tallyYes.div(totalTally).multipliedBy(100);
  }, [tallyYes, totalTally]);

  const tallyNoPercentage = useMemo(() => {
    return totalTally.isZero() ? BigNumber(0) : tallyNo.div(totalTally).multipliedBy(100);
  }, [tallyNo, totalTally]);

  const tallyVetoPercentage = useMemo(() => {
    return totalTally.isZero() ? BigNumber(0) : tallyVeto.div(totalTally).multipliedBy(100);
  }, [tallyVeto, totalTally]);

  const tallyAbstainPercentage = useMemo(() => {
    return totalTally.isZero() ? BigNumber(0) : tallyAbstain.div(totalTally).multipliedBy(100);
  }, [tallyAbstain, totalTally]);
  return (
    <>
      <div
        className="w-full bg-gray-700 rounded-lg h-6 relative mt-2 flex"
        aria-label="chart-tally"
      >
        <div
          className={`bg-[#4CAF50] h-6 ${tallyYesPercentage.eq(100) && 'rounded-l-lg rounded-r-lg'}`}
          style={{ width: `${tallyYesPercentage}%` }}
        ></div>
        <div
          className={`bg-[#E53935] h-6 ${tallyNoPercentage.eq(100) && 'rounded-l-lg rounded-r-lg'}`}
          style={{ width: `${tallyNoPercentage}%` }}
        ></div>
        <div
          className={`bg-[#FFB300] h-6 ${tallyVetoPercentage.eq(100) && 'rounded-l-lg rounded-r-lg'}`}
          style={{ width: `${tallyVetoPercentage}%` }}
        ></div>
        <div
          className={`bg-[#3F51B5] h-6 ${tallyAbstainPercentage.eq(100) && 'rounded-l-lg'} rounded-r-lg`}
          style={{ width: `${tallyAbstainPercentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span className="flex items-center">
          <span className="inline-block w-3 h-3 bg-[#4CAF50] mr-1"></span>
          Yes ({tallyYesPercentage.toFixed(2)}%)
        </span>
        <span className="flex items-center">
          <span className="inline-block w-3 h-3 bg-[#E53935] mr-1"></span>
          No ({tallyNoPercentage.toFixed(2)}%)
        </span>
        <span className="flex items-center">
          <span className="inline-block w-3 h-3 bg-[#FFB300] mr-1"></span>
          No with Veto ({tallyVetoPercentage.toFixed(2)}%)
        </span>
        <span className="flex items-center">
          <span className="inline-block w-3 h-3 bg-[#3F51B5] mr-1"></span>
          Abstain ({tallyAbstainPercentage.toFixed(2)}%)
        </span>
      </div>
    </>
  );
}
