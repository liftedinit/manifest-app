import { QueryTallyResultResponseSDKType } from '@manifest-network/manifestjs/dist/codegen/cosmos/group/v1/query';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';

interface TallyProps {
  tallies: QueryTallyResultResponseSDKType;
}

export function Tally({ tallies }: TallyProps) {
  const { tallyYes, tallyNo, tallyVeto, tallyAbstain, totalTally } = useMemo(() => {
    const tallyYes = BigNumber(tallies.tally?.yes_count);
    const tallyNo = BigNumber(tallies.tally?.no_count);
    const tallyVeto = BigNumber(tallies.tally?.no_with_veto_count);
    const tallyAbstain = BigNumber(tallies.tally?.abstain_count);
    const safeYes = tallyYes.isFinite() ? tallyYes : BigNumber(0);
    const safeNo = tallyNo.isFinite() ? tallyNo : BigNumber(0);
    const safeVeto = tallyVeto.isFinite() ? tallyVeto : BigNumber(0);
    const safeAbstain = tallyAbstain.isFinite() ? tallyAbstain : BigNumber(0);
    const totalTally = BigNumber.sum(safeYes, safeNo, safeVeto, safeAbstain);
    return {
      tallyYes: safeYes,
      tallyNo: safeNo,
      tallyVeto: safeVeto,
      tallyAbstain: safeAbstain,
      totalTally,
    };
  }, [tallies]);

  const getPercentage = (tally: BigNumber) =>
    totalTally.isZero() ? BigNumber(0) : tally.div(totalTally).multipliedBy(100);

  const tallyYesPercentage = getPercentage(tallyYes);
  const tallyNoPercentage = getPercentage(tallyNo);
  const tallyVetoPercentage = getPercentage(tallyVeto);
  const tallyAbstainPercentage = getPercentage(tallyAbstain);

  const bars = [
    { id: 'yes', color: '#4CAF50', percentage: tallyYesPercentage },
    { id: 'no', color: '#E53935', percentage: tallyNoPercentage },
    { id: 'veto', color: '#FFB300', percentage: tallyVetoPercentage },
    { id: 'abstain', color: '#3F51B5', percentage: tallyAbstainPercentage },
  ];

  const visibleBars = bars.filter(bar => bar.percentage.gt(0));

  return (
    <>
      <div
        className="w-full bg-gray-700 rounded-lg h-6 relative mt-2 flex"
        aria-label="chart-tally"
      >
        {visibleBars.map((bar, index) => {
          const borderClasses = [
            index === 0 && 'rounded-l-lg',
            index === visibleBars.length - 1 && 'rounded-r-lg',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div
              key={bar.id}
              className={`h-6 ${borderClasses}`}
              style={{ backgroundColor: bar.color, width: `${bar.percentage}%` }}
            />
          );
        })}
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
