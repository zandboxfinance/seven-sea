import React from 'react';

interface StakingCardProps {
  totalStaked: string;
  apr: string;
  unlockDate: string;
  rewards: string;
  claimed: boolean;
  unstaked: boolean; // Add this property to indicate unstaked status
  onUnstake: () => void;
  onClaimReward: () => void;
}

const StakingCard: React.FC<StakingCardProps> = ({
    totalStaked,
    apr,
    unlockDate,
    rewards,
    claimed,
    unstaked,
    onUnstake,
    onClaimReward,
  }) => {
    const hasStakedAmount = parseFloat(totalStaked) > 0;
    const canClaimRewards = parseFloat(rewards) > 0;
  
    return (
      <div className="flex flex-col px-6 py-4 w-full rounded-xl border-2 border-gray-700">
        <h3 className="text-xl font-bold">Staked: {totalStaked} USDT</h3>
        <p>APR: {apr}</p>
        <p>Unlock Date: {unlockDate}</p>
        <p>Rewards: {rewards} USDT</p>
        <div className="mt-4 flex gap-4">
          {canClaimRewards && !claimed && (
            <button
              onClick={onClaimReward}
              className="px-4 py-2 bg-green-500 rounded-lg text-white font-bold"
            >
              Claim Rewards
            </button>
          )}
          {hasStakedAmount && (
            <button
              onClick={onUnstake}
              className="px-4 py-2 bg-red-500 rounded-lg text-white font-bold"
            >
              Unstake
            </button>
          )}
          {unstaked && (
            <span className="text-green-400 font-bold">Completed</span>
          )}
        </div>
      </div>
    );
  };  
  

export default StakingCard;
