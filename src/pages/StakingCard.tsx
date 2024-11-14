import React from 'react';

interface StakingCardProps {
  totalStaked: number;
  apr: string;
  unlockDate: string;
  rewards: string;
}

const StakingCard: React.FC<StakingCardProps> = ({ totalStaked, apr, unlockDate, rewards }) => {
  return (
    <div className="flex flex-col px-6 py-4 w-full rounded-2xl border border-white border-solid max-md:pl-5 max-md:mt-9">
      <div className="flex gap-10">
        <div className="flex flex-col flex-1 items-start text-white">
          <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/3c9e1754eb6c983b3c083be3e815ec6e9e6f61aaf87165caca408be687fed677?placeholderIfAbsent=true&apiKey=3982f1c4caac4533b049cdd9bd51d206" alt="" className="object-contain rounded-full aspect-square w-[27px]" />
          <div className="mt-5 text-xs tracking-wide text-center">Total Staked</div>
          <div className="mt-3 text-xl font-bold tracking-wider">{totalStaked}</div>
        </div>
        <div className="flex flex-col flex-1 font-bold text-right">
          <div className="px-2.5 py-1.5 text-sm tracking-wider text-black bg-white rounded-lg">UNLOCK</div>
          <div className="flex flex-col px-2.5 mt-5">
            <div className="text-xs tracking-tight leading-tight text-neutral-400">≈{totalStaked} USDT</div>
            <div className="mt-3 text-xl tracking-wider text-white max-md:ml-2.5">USDT</div>
          </div>
        </div>
      </div>
      <button className="flex gap-1.5 px-9 py-3 mt-5 text-base font-semibold tracking-wider text-white bg-indigo-500 rounded-lg max-md:px-5 max-md:mr-1">
        <span className="grow">claim rewards</span>
        <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/b0b02b79e71972eb77efc0ed2445675c547b5c8b646f3d8ea9e5fdeacd3376f8?placeholderIfAbsent=true&apiKey=3982f1c4caac4533b049cdd9bd51d206" alt="" className="object-contain shrink-0 my-auto w-4 aspect-[1.6]" />
      </button>
      <div className="flex gap-5 justify-between mt-4 text-xs tracking-wide max-md:mr-1">
        <div className="flex flex-col items-start font-medium text-neutral-400">
          <div>APR:</div>
          <div className="mt-3">Unlock Date:</div>
          <div className="mt-3">Rewards:</div>
        </div>
        <div className="flex flex-col font-semibold text-right text-white">
          <div className="self-end">{apr}</div>
          <div className="mt-3">{unlockDate}</div>
          <div className="self-start mt-3 ml-4 max-md:ml-2.5">{rewards}</div>
        </div>
      </div>
    </div>
  );
};

export default StakingCard;
