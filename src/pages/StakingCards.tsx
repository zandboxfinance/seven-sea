import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import StakingCard from './StakingCard';
import Swal from 'sweetalert2';


const StakingCards: React.FC = () => {
  const [stakes, setStakes] = useState<any[]>([]);
  const [previousStakes, setPreviousStakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreviousStakes, setShowPreviousStakes] = useState(false);
  const [hasStakes, setHasStakes] = useState(false); // Track if the user has active stakes


  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const contractABI = JSON.parse(import.meta.env.VITE_CONTRACT_ABI);

  const fetchStakes = async () => {
    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      const accounts = await web3.eth.getAccounts();

      const userStakes = await contract.methods.getUserStakes(accounts[0]).call();
      console.log('Raw User Stakes:', userStakes);

      if (!Array.isArray(userStakes)) {
        console.error('getUserStakes did not return an array:', userStakes);
        return;
      }

      const formattedStakes = userStakes.map((stake: any, index: number) => ({
        id: index,
        totalStaked: web3.utils.fromWei(stake.stakedAmount.toString(), 'ether'),
        apr: `${stake.APR}%`,
        unlockDate: new Date(Number(stake.stakeEnd) * 1000).toLocaleString(),
        rewards: web3.utils.fromWei(stake.rewards.toString(), 'ether'),
        claimed: stake.claimed,
      }));

      const activeStakes = formattedStakes.filter((stake) => !stake.claimed);
      const previousStakes = formattedStakes.filter((stake) => stake.claimed);

      setStakes(activeStakes);
      setPreviousStakes(previousStakes);
      setHasStakes(activeStakes.length > 0); // Check if there are active stakes
    } catch (error) {
      console.error('Error fetching stakes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStakes();

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length > 0) {
        await fetchStakes();
      }
    };

    // Polling logic to fetch stakes every 5 seconds
    const interval = setInterval(() => {
        fetchStakes();
    }, 5000);

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
      clearInterval(interval); // Clear the interval when the component unmounts
    };
  }, []);

  const handleUnstake = async (id: number) => {
    try {
        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        const accounts = await web3.eth.getAccounts();

        await contract.methods.unstake(id).send({ from: accounts[0] })
            .on('transactionHash', (hash) => {
                Swal.fire({
                    title: 'Transaction in Progress',
                    text: `Transaction Hash: ${hash}`,
                    icon: 'info',
                    confirmButtonText: 'OK',
                });
            })
            .on('receipt', () => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Unstaked successfully!',
                    icon: 'success',
                    confirmButtonText: 'OK',
                });

                fetchStakes(); // Refresh stakes after successful unstake
            });
    } catch (error: any) {
        console.error('Error during unstake:', error);

        if (error.message.includes("User denied transaction")) {
            Swal.fire({
                title: 'Transaction Denied',
                text: 'You have cancelled the transaction.',
                icon: 'warning',
                confirmButtonText: 'OK',
            });
        } else {
            Swal.fire({
                title: 'Unstake Failed',
                text: `Error: ${error.message}`,
                icon: 'error',
                confirmButtonText: 'OK',
            });
        
         }

      }
    };


  const handleClaimRewards = async (id: number) => {
    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      const accounts = await web3.eth.getAccounts();

      await contract.methods.claimRewards(id).send({ from: accounts[0] });
      alert('Rewards claimed successfully!');
      fetchStakes();
    } catch (error) {
      console.error('Error during claim rewards:', error);
      alert('Claiming rewards failed.');
    }
  };

  if (loading) return <p>Loading stakes...</p>;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stakes.map((stake, index) => (
          <StakingCard
            key={index}
            {...stake}
            onUnstake={() => handleUnstake(stake.id)}
            onClaimReward={() => handleClaimRewards(stake.id)}
          />
        ))}
      </div>

      <button
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg"
        onClick={() => setShowPreviousStakes(!showPreviousStakes)}
      >
        {showPreviousStakes ? 'Hide My Previous Stakes' : 'Show My Previous Stakes'}
      </button>

      {showPreviousStakes && (
        <div>
          <h2 className="text-2xl font-bold mt-8 mb-4">My Previous Stakes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {previousStakes.map((stake, index) => (
              <StakingCard
                key={index}
                {...stake}
                onUnstake={() => {}}
                onClaimReward={() => {}}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StakingCards;
