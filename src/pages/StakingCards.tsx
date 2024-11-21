import React, { useEffect, useState } from 'react';
import StakingCard from './StakingCard';
import Swal from 'sweetalert2';
import Web3 from "web3";

import { fetchStakes as fetchStakesFromUtils } from '../utils/stakingUtils'; // Import centralized fetch logic

const StakingCards: React.FC = () => {
  const [stakes, setStakes] = useState<any[]>([]);
  const [previousStakes, setPreviousStakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreviousStakes, setShowPreviousStakes] = useState(false);
  const [hasStakes, setHasStakes] = useState(false); // Track if the user has active stakes

  // Centralized function to fetch and set stakes
  const loadStakes = async () => {
    try {
      const { activeStakes, previousStakes, hasStakes } = await fetchStakesFromUtils();
      setStakes(activeStakes);
      setPreviousStakes(previousStakes);
      setHasStakes(hasStakes);
    } catch (error) {
      console.error('Error fetching stakes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true; // Add a flag to prevent state updates if the component unmounts

    const fetchData = async () => {
      if (isMounted) await loadStakes();
    };

    fetchData();

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length > 0 && isMounted) {
        await loadStakes();
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    // Polling logic to fetch stakes every 5 seconds
    const interval = setInterval(() => {
      if (isMounted) {
        loadStakes();
      }
    }, 5000);

    return () => {
      isMounted = false; // Prevent updates to state if unmounted
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
      clearInterval(interval); // Clear the interval on component unmount
    };
  }, []);

  const handleUnstake = async (id: number) => {
    try {
      const web3 = new Web3(window.ethereum);
      const contractABI = JSON.parse(import.meta.env.VITE_CONTRACT_ABI);
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      const accounts = await web3.eth.getAccounts();

      await contract.methods
        .unstake(id)
        .send({ from: accounts[0] })
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

          loadStakes(); // Refresh stakes after successful unstake
        });
    } catch (error: any) {
      console.error('Error during unstake:', error);

      if (error.message.includes('User denied transaction')) {
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
      const contractABI = JSON.parse(import.meta.env.VITE_CONTRACT_ABI);
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      const accounts = await web3.eth.getAccounts();

      await contract.methods.claimRewards(id).send({ from: accounts[0] });
      Swal.fire({
        title: 'Success!',
        text: 'Rewards claimed successfully!',
        icon: 'success',
        confirmButtonText: 'OK',
      });

      loadStakes();
    } catch (error: any) {
      console.error('Error during claim rewards:', error);

      if (error.message.includes('User denied transaction')) {
        Swal.fire({
          title: 'Transaction Denied',
          text: 'You have cancelled the transaction.',
          icon: 'warning',
          confirmButtonText: 'OK',
        });
      } else {
        Swal.fire({
          title: 'Claim Rewards Failed',
          text: `Error: ${error.message}`,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    }
  };

  if (loading) return <p>Loading stakes...</p>;

  return (
    <div>
      {!hasStakes ? (
        <div className="w-full lg:w-[100%] flex flex-col items-center justify-center bg-black rounded-lg p-8">
          <h1 className="text-white text-3xl font-bold mb-4">No Stakes Yet</h1>
          <p className="text-white mb-4 text-2xl">You don’t have any stakes yet.</p>
          <p className="text-white mb-4 text-2xl">Start your journey as a whale and make your first stake.</p>
          <button
            onClick={() => document.getElementById('staking-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-blue-500 text-3xl hover:bg-blue-700 text-white p-3 rounded-md mt-4 transform hover:scale-105 transition-transform duration-300 focus:outline-none"
          >
            Get Started
          </button>
        </div>
      ) : (
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
      )}

      {hasStakes && (
        <button
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg"
          onClick={() => setShowPreviousStakes(!showPreviousStakes)}
        >
          {showPreviousStakes ? 'Hide My Previous Stakes' : 'Show My Previous Stakes'}
        </button>
      )}

      {showPreviousStakes && previousStakes.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mt-8 mb-4">My Previous Stakes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {previousStakes.map((stake, index) => (
              <StakingCard key={index} {...stake} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StakingCards;
