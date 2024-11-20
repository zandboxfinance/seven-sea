import Web3 from 'web3';

const contractABI = JSON.parse(import.meta.env.VITE_CONTRACT_ABI);
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

/**
 * Fetch user stakes from the blockchain.
 * @returns An object containing formatted stakes and a flag indicating if the user has active stakes.
 * @throws Will throw an error if the fetch fails.
 */
export const fetchStakes = async () => {
  try {
    if (!window.ethereum) {
      throw new Error('Ethereum wallet is not available. Please install MetaMask.');
    }

    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    const accounts = await web3.eth.getAccounts();

    const userStakes = (await contract.methods.getUserStakes(accounts[0]).call()) as any[];

    if (!Array.isArray(userStakes)) {
      throw new Error('Invalid data: getUserStakes did not return an array');
    }

    const formattedStakes = userStakes.map((stake, index) => ({
      id: index,
      totalStaked: web3.utils.fromWei(stake.stakedAmount.toString(), 'ether'),
      apr: `${stake.APR}%`,
      unlockDate: new Date(Number(stake.stakeEnd) * 1000).toLocaleString(),
      rewards: web3.utils.fromWei(stake.rewards.toString(), 'ether'),
      claimed: stake.claimed,
    }));

    const activeStakes = formattedStakes.filter((stake) => !stake.claimed);
    const previousStakes = formattedStakes.filter((stake) => stake.claimed);

    return {
      activeStakes,
      previousStakes,
      hasStakes: activeStakes.length > 0,
    };
  } catch (error) {
    console.error('Error fetching stakes:', error);
    throw error;
  }
};
