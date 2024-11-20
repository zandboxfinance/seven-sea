import React from 'react';

interface StakingCardProps {
  totalStaked: string;
  apr: string;
  unlockDate: string;
  rewards: string;
  claimed: boolean;
  onUnstake: () => void;
  onClaimReward: () => void;
}

const StakingCard: React.FC<StakingCardProps> = ({
  totalStaked,
  apr,
  unlockDate,
  rewards,
  claimed,
  onUnstake,
  onClaimReward,
}) => {
  return (
    <div className="flex flex-col px-6 py-4 w-full rounded-xl border-2 border-gray-700">
      <h3 className="text-xl font-bold">Staked: {totalStaked} USDT</h3>
      <p>APR: {apr}</p>
      <p>Unlock Date: {unlockDate}</p>
      <p>Rewards: {rewards} USDT</p>
      <div className="mt-4 flex gap-4">
        {!claimed ? (
          <>
            <button
              onClick={onClaimReward}
              className="px-4 py-2 bg-green-500 rounded-lg text-white font-bold"
            >
              Claim Rewards
            </button>
            <button
              onClick={onUnstake}
              className="px-4 py-2 bg-red-500 rounded-lg text-white font-bold"
            >
              Unstake
            </button>
          </>
        ) : (
          <span className="text-green-400">Claimed</span>
        )}
      </div>
    </div>
  );
};

export default StakingCard;
