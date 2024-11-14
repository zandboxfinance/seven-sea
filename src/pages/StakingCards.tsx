import React from 'react';
import StakingCard from './StakingCard';

const StakingCards: React.FC = () => {
  const stakingData = [
    { totalStaked: 1000, apr: "15%", unlockDate: "Nov 7 2024 08:00", rewards: "87.42 USDT" },
    { totalStaked: 500, apr: "10%", unlockDate: "Dec 10 2024 08:00", rewards: "50.21 USDT" },
    { totalStaked: 1000, apr: "15%", unlockDate: "Nov 7 2024 08:00", rewards: "87.42 USDT" },
    { totalStaked: 500, apr: "10%", unlockDate: "Dec 10 2024 08:00", rewards: "50.21 USDT" },
    { totalStaked: 1000, apr: "15%", unlockDate: "Nov 7 2024 08:00", rewards: "87.42 USDT" },
    { totalStaked: 500, apr: "10%", unlockDate: "Dec 10 2024 08:00", rewards: "50.21 USDT" }
  ];

  return (
    <section className="self-center mt-7 ml-3.5 w-full max-w-6xl max-md:max-w-full">
      <div className="flex flex-wrap gap-5 justify-center">
        {stakingData.map((data, index) => (
          <div key={index} className="w-1/4 max-w-xs mb-5">
            <StakingCard {...data} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default StakingCards;
