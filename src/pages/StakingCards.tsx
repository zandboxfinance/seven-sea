import React, { useEffect, useState } from 'react';
import StakingCard from './StakingCard';
import Swal from 'sweetalert2';
import Web3 from 'web3';


import { fetchStakes as fetchStakesFromUtils } from "../utils/stakingUtils"; // Import centralized fetch logic

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
  
      interface StakeInfo {
        stakedAmount: string;
        stakedAt: string;
        stakeEnd: string;
        rewards: string;
        APR: string;
        claimed: boolean;
      }
  
      // Fetch stake details
      const stakeInfo: StakeInfo[] = await contract.methods.getUserStakes(accounts[0]).call();
      const currentStake = stakeInfo[id];
  
      if (!currentStake) {
        Swal.fire({
          title: "Error",
          text: "Invalid stake ID. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }
  
      const currentTime = Math.floor(Date.now() / 1000);
      const stakeEnd = Number(currentStake.stakeEnd);
  
      // If unstaking early, warn the user about penalties
      if (currentTime < stakeEnd) {
        const result = await Swal.fire({
          title: "Early Unstake Warning",
          html: "You are attempting to unstake early.<br>A 6% penalty will be applied.<br>Do you wish to continue?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, Unstake",
          cancelButtonText: "No, Cancel",
        });
  
        if (!result.isConfirmed) {
          return;
        }
      }
  
      // Determine the amount to unstake
      const totalToUnstake =
        parseFloat(currentStake.rewards) > 0 && !currentStake.claimed
          ? parseFloat(currentStake.stakedAmount) + parseFloat(currentStake.rewards) // Include rewards
          : parseFloat(currentStake.stakedAmount); // Only staked amount if rewards are claimed
  
      const transaction = await contract.methods.unstake(id).send({
        from: accounts[0],
        gas: "2000000", // Set a reasonable gas limit as a string
        gasPrice: web3.utils.toWei("6", "gwei"), // Set gas price
      });
  
      // Transaction hash for BscScan
      const transactionHash = transaction.transactionHash;
  
      Swal.fire({
        title: "Transaction in Progress",
        html: `Transaction Hash: <a href="https://testnet.bscscan.com/tx/${transactionHash}" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">View on BscScan</a>`,
        icon: "info",
        confirmButtonText: "OK",
      });
  
      const receipt = await web3.eth.getTransactionReceipt(transactionHash);
      if (receipt.status) {
        Swal.fire({
          title: "Success!",
          html: `Unstaked successfully! <br /> <a href="https://testnet.bscscan.com/tx/${transactionHash}" target="_blank" 
             rel="noopener noreferrer" 
             style="background: #e53e3e; padding: 10px 20px; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-top: 10px;">
             View Transaction on BscScan</a>`,
          icon: "success",
          confirmButtonText: "OK",
        });
        await loadStakes(); // Refresh stakes after successful unstake
      } else {
        throw new Error("Transaction failed: The transaction was reverted.");
      }
    } catch (error: any) {
      console.error("Error during unstake:", error);
  
      let errorMessage = "An unexpected error occurred. Please try again later.";
      if (error?.receipt?.transactionHash) {
        errorMessage = `Transaction failed. Check transaction details <a href="https://testnet.bscscan.com/tx/${error.receipt.transactionHash}" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">here</a>.`;
      }
  
      Swal.fire({
        title: "Unstake Failed",
        html: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
  


 const handleClaimRewards = async (id: number) => {
    try {
        const web3 = new Web3(window.ethereum); // Initialize Web3
        const contractABI = JSON.parse(import.meta.env.VITE_CONTRACT_ABI);
        const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        const accounts = await web3.eth.getAccounts();

        // Send the transaction and get the receipt
        const transaction = await contract.methods.claimRewards(id).send({
            from: accounts[0],
            gas: "2000000", // Increased gas limit
            gasPrice: web3.utils.toWei("6", "gwei"),
        });

        // Access the transaction hash from the returned transaction object
        const transactionHash = transaction.transactionHash;

        // Show transaction in progress popup with enhanced styling
        Swal.fire({
            title: '<h2 style="color: #3182ce; font-weight: bold;">Transaction in Progress</h2>',
            html: `
                <p style="color: #444; font-size: 16px; margin: 10px 0;">
                    Your transaction is being processed. You can monitor its status on BscScan:
                </p>
                <a href="https://testnet.bscscan.com/tx/${transactionHash}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   style="background: #4299e1; padding: 10px 20px; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-top: 10px;">
                   View Transaction on BscScan
                </a>
            `,
            icon: "info",
            showConfirmButton: false, // No confirm button for progress
        });

        // Wait for the transaction receipt
        const receipt = await web3.eth.getTransactionReceipt(transactionHash);
        if (receipt.status) {
            Swal.fire({
                title: '<h2 style="color: #38a169; font-weight: bold;">Success!</h2>',
                html: `
                    <p style="color: #444; font-size: 16px; margin: 10px 0;">
                        Rewards have been successfully claimed. View transaction details:
                    </p>
                    <a href="https://testnet.bscscan.com/tx/${transactionHash}" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       style="background: #38a169; padding: 10px 20px; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-top: 10px;">
                       View Transaction on BscScan
                    </a>
                `,
                icon: "success",
                confirmButtonText: '<span style="font-size: 16px; font-weight: bold;">OK</span>',
                confirmButtonColor: '#38a169',
            });
            loadStakes(); // Refresh stakes after successful claim
        } else {
            throw new Error("Transaction failed: The transaction was reverted.");
        }
    } catch (error: any) {
        console.error("Error during claim rewards:", error);

        let errorMessage = `
            <p style="color: #444; font-size: 16px; margin: 10px 0;">
                An unexpected error occurred. Please try again later.
            </p>
        `;

        if (error?.receipt?.transactionHash) {
            errorMessage = `
                <p style="color: #444; font-size: 16px; margin: 10px 0;">
                    Unfortunately, the transaction failed. You can review the transaction details on BscScan:
                </p>
                <a href="https://testnet.bscscan.com/tx/${error.receipt.transactionHash}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   style="background: #e53e3e; padding: 10px 20px; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-top: 10px;">
                   View Transaction on BscScan
                </a>
            `;
        }

        Swal.fire({
            title: '<h2 style="color: #e53e3e; font-weight: bold;">Claim Rewards Failed</h2>',
            html: errorMessage,
            icon: "error",
            confirmButtonText: '<span style="font-size: 16px; font-weight: bold;">OK</span>',
            confirmButtonColor: '#e53e3e',
        });
    }
};



  if (loading) return <p>Loading stakes...</p>;

  return (
    <div>
        {!hasStakes ? (
        <div>
          <div className="w-full lg:w-[100%] flex flex-col items-center justify-center bg-black rounded-lg p-8">
            <h1 className="text-white text-3xl font-bold mb-4">No Stakes Yet</h1>
            <p className="text-white mb-4 text-2xl">You don’t have any active stakes yet.</p>
            <button
              onClick={() => document.getElementById('staking-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-blue-500 text-3xl hover:bg-blue-700 text-white p-3 rounded-md mt-4"
            >
              Get Started
            </button>
          </div>
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

      {previousStakes.length > 0 && (
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
                <StakingCard
                key={index}
                {...stake}
                onUnstake={() => handleUnstake(stake.id)} // Add onUnstake logic here
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