import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Web3 from "web3";
import { useAccount } from "wagmi"; // Import to use wallet info


import banner from '../assets/banner.png';
import usdtbackground from '../assets/usdtplanbackground.png';
import mystake from '../assets/my_staking_btg.png';
import usdt from '../assets/usdt.png';
import bg_whale from '../assets/bg-whale.png';
import linktree1 from '../assets/social/linktree1.png';
import discord1 from '../assets/social/discord1.png';
import Swal from 'sweetalert2';
import { fetchStakes } from "../utils/stakingUtils";


import WhaleSlider from "../components/SliderComponent";
import PrimeInput from "../components/PrimeInput";
import DurationSelector from "../components/DurationSelector";
import StakingCards from '../pages/StakingCards'; // Import StakingCards component
import BigNumber from 'bignumber.js'; // For handling large numbers


interface WhaleImagePaths {
    "0-25": string;
    "25-75": string;
    "75-100": string;
}

const headImages: WhaleImagePaths = {
    "0-25": './whale/TTTTWHALE.png',
    "25-75": './whale/25-75.png',
    "75-100": './whale/75-100.png'
};

function Staking() {
    const [testMode, setTestMode] = useState(false); // Test mode state
    const { t } = useTranslation();
    const [usdtduration, setUsdtDuration] = useState("");
    const [apr, setApr] = useState("");
    const [inputValueusdt, setInputValueusdt] = useState('');
    const [sliderValueusdt, setSliderValueusdt] = useState<number>(0);
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    const [unlockDate, setUnlockDate] = useState<string>("");

    const erc20ABI = JSON.parse(import.meta.env.VITE_erc20ABI); // Assuming the ABI is stored as a JSON string
    const contractABI = JSON.parse(import.meta.env.VITE_CONTRACT_ABI);
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    const usdtAddress = import.meta.env.VITE_USDT_ADDRESS;
    const [calculatedReward, setCalculatedReward] = useState<string>("0");
    const [hasStakes, setHasStakes] = useState(false);



    const [usdtPrice, setUsdtPrice] = useState<number | null>(null);

    const { isConnected, address } = useAccount(); // To get wallet address and connection status
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [usdtWalletBalance, setUsdtWalletBalance] = useState<string | null>(null);
    const [contract, setContract] = useState<any>(null);

    // Function to scroll to the staking section
    const scrollToStakingSection = () => {
        const stakingSection = document.getElementById('staking-section'); // Assume you have a wrapper element with this ID
        if (stakingSection) {
            stakingSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Function to scroll to the staking section
    const scrollToStakingSection2 = () => {
        const stakingSection = document.getElementById('my-stakes-section'); // Assume you have a wrapper element with this ID
        if (stakingSection) {
            stakingSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Fetch wallet balance function to be used globally
    const fetchWalletBalance = async () => {
        if (web3 && address && isConnected) {
            try {
                // USDT Balance
                const usdtContract = new web3.eth.Contract(erc20ABI, usdtAddress);
                const usdtBalance: string = await usdtContract.methods.balanceOf(address).call();
                setUsdtWalletBalance(web3.utils.fromWei(usdtBalance, 'ether'));
            } catch (error) {
                console.error("Error fetching balances:", error);
                setUsdtWalletBalance("Error");
            }
        } else {
            setUsdtWalletBalance("Connect Wallet");
        }
    };
    // UseEffect to call fetchWalletBalance when needed
    useEffect(() => {
        if (isConnected) {
            console.log("Wallet connection status:", isConnected);
            console.log("Wallet address:", address);

            // Show success notification when the wallet is connected
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Wallet connected successfully!',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });

            fetchWalletBalance();
        }

        // Polling logic to fetch wallet balance every 5 seconds
        const interval = setInterval(() => {
            if (isConnected && web3) {
                fetchWalletBalance();
            }
        }, 5000);

        // Cleanup interval when the component is unmounted
        return () => clearInterval(interval);
    }, [web3, address, isConnected]);


    // Update APR and Unlock Date based on Duration
    const handleDurationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedDuration = event.target.value;
        setUsdtDuration(selectedDuration);

        const now = new Date();
        if (testMode) {
            // Test mode: Fixed 1-minute duration
            setApr("5%");
            now.setMinutes(now.getMinutes() + 1);
        } else {
            // Real mode: Calculate based on duration
            if (selectedDuration === "30 Days") {
                setApr("15%");
                now.setDate(now.getDate() + 30);
            } else if (selectedDuration === "6 Months") {
                setApr("24%");
                now.setMonth(now.getMonth() + 6);
            } else if (selectedDuration === "1 Year") {
                setApr("36%");
                now.setFullYear(now.getFullYear() + 1);
            }
        }
        setUnlockDate(now.toLocaleString());
    };

    // Function to format BigInt values for ERC20 tokens with 18 decimals
    const formatBigInt = (value: any, decimals = 4) => {
        if (!value) return "0.0000";
  
        try {
          // Create a BigNumber from the value
          const bigValue = new BigNumber(value.toString());
  
          // Shift by -18 to convert from WEI to the token value (e.g., 1 USDT instead of 1 * 10^18 WEI)
          const formattedValue = bigValue.shiftedBy(-18);
  
          // Format with a fixed number of decimals (e.g., 2 decimals)
          return formattedValue.toFixed(decimals);
        } catch (error) {
        console.error("Error formatting BigInt value:", error);
        return value.toString();
        }
    };

    useEffect(() => { 
        if (window.ethereum) {
            const web3Instance = new Web3(window.ethereum);
            setWeb3(web3Instance);
    
            if (address && isConnected) {
                const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
                setContract(contractInstance);
    
                console.log("Wallet connected:", isConnected);
                console.log("Wallet address:", address);
                console.log("Web3 initialized:", web3Instance);
                console.log("Contract initialized:", contractInstance);
    
                // Fetch test mode immediately
                fetchTestMode(contractInstance);
    
                // Set up polling to fetch test mode status periodically
                const interval = setInterval(() => {
                    fetchTestMode(contractInstance);
                }, 5000); // Poll every 5 seconds
    
                // Cleanup interval when component unmounts
                return () => clearInterval(interval);
            } else {
                console.error("Wallet is not connected.");
            }
        } else {
            console.error("No Ethereum provider found.");
        }
    }, [isConnected, address]);
    
    // Global fetchTestMode function
    const fetchTestMode = async (contractInstance: any) => {
        try {
            const isTestMode = await contractInstance.methods.testMode().call();
            setTestMode(!!isTestMode); // Ensure the value is boolean
            console.log("Test Mode:", isTestMode ? "Enabled" : "Disabled");
        } catch (error) {
            console.error("Error fetching test mode:", error);
        }
    };
    
    

    const calculateReward = () => {
        if (!inputValueusdt || isNaN(Number(inputValueusdt))) {
            setCalculatedReward("0");
            return;
        }
    
        const inputAmount = parseFloat(inputValueusdt); // Convert input to a number
        const aprValue = parseFloat(apr.replace("%", "")) / 100; // Convert APR to a decimal
    
        let durationFraction;
    
        if (testMode) {
            // Test mode: 1 minute as a fraction of a year (525600 minutes in a year)
            durationFraction = 1;
        } else {
            // Real mode: Duration as a fraction of the year
            durationFraction =
                usdtduration === "30 Days"
                    ? 30 / 365 // 30 days as a fraction of a year
                    : usdtduration === "6 Months"
                    ? 6 / 12 // 6 months as a fraction of a year
                    : 1; // 1 year
        }
    
        // Calculate the reward
        const reward = inputAmount + inputAmount * aprValue * durationFraction;
        setCalculatedReward(reward.toFixed(4)); // Format to 4 decimals
    };
    

    useEffect(() => {
        calculateReward(); // Recalculate reward when inputs change
    }, [inputValueusdt, apr, usdtduration, testMode]);

    

    useEffect(() => {
        // Fetch the price of USDT from CoinGecko API
        const fetchUsdtPrice = async () => {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd');
                const data = await response.json();
                if (data.tether) {
                    setUsdtPrice(data.tether.usd); // Update the USDT price state
                }
            } catch (error) {
                console.error("Error fetching USDT price:", error);
            }
        };
    
        fetchUsdtPrice();
    }, []);
    

    const handleStakeUSDT = () => {
        if (!web3 || !contract || !address) {
            Swal.fire({
                title: '<h2 style="color: #e53e3e; font-weight: bold;">Oops!</h2>',
                html: `
                    <p style="color: #444; font-size: 16px; margin: 10px 0;">
                        Please connect your wallet first!
                    </p>
                `,
                icon: "warning",
                confirmButtonText: '<span style="font-size: 16px; font-weight: bold;">OK</span>',
                confirmButtonColor: "#e53e3e",
            });
            return;
        }
    
        // Validate input amount
        if (isNaN(parseFloat(inputValueusdt)) || parseFloat(inputValueusdt) <= 0) {
            Swal.fire({
                title: '<h2 style="color: #e53e3e; font-weight: bold;">Invalid Input</h2>',
                html: `
                    <p style="color: #444; font-size: 16px; margin: 10px 0;">
                        Please enter a valid amount greater than zero to stake.
                    </p>
                `,
                icon: "error",
                confirmButtonText: '<span style="font-size: 16px; font-weight: bold;">OK</span>',
                confirmButtonColor: "#e53e3e",
            });
            return;
        }

        if (usdtWalletBalance === null || parseFloat(usdtWalletBalance) < parseFloat(inputValueusdt)) {
            Swal.fire({
                title: '<h2 style="color: #e53e3e; font-weight: bold;">Insufficient Balance</h2>',
                html: `
                    <p style="color: #444; font-size: 16px; margin: 10px 0;">
                        You do not have enough USDT to complete this stake. Please reduce the amount.
                    </p>
                `,
                icon: "error",
                confirmButtonText: '<span style="font-size: 16px; font-weight: bold;">OK</span>',
                confirmButtonColor: "#e53e3e",
            });
            return;
        }
        
        
    
        // Validate duration selection
        if (!usdtduration) {
            Swal.fire({
                title: '<h2 style="color: #4299e1; font-weight: bold;">Select Duration</h2>',
                html: `
                    <p style="color: #444; font-size: 16px; margin: 10px 0;">
                        Please select a staking duration.
                    </p>
                `,
                icon: "info",
                confirmButtonText: '<span style="font-size: 16px; font-weight: bold;">OK</span>',
                confirmButtonColor: "#4299e1",
            });
            return;
        }
    
        // Confirm staking details
        confirmStaking('USDT', inputValueusdt, usdtduration, executeStakeUSDT);
    };
    
    const confirmStaking = (
        tokenName: string,
        amount: string | number,
        duration: string,
        handleStake: () => Promise<void>
    ) => {
        Swal.fire({
            title: `<h2 style="color: #3182ce; font-weight: bold;">Confirm Staking ${tokenName}</h2>`,
            html: `
                <p style="color: #444; font-size: 16px; margin: 10px 0;">
                    You are about to stake:
                </p>
                <ul style="color: #444; font-size: 16px; margin: 10px 0;">
                    <li><b>Token:</b> ${tokenName}</li>
                    <li><b>Amount:</b> ${amount}</li>
                    <li><b>Duration:</b> ${duration}</li>
                </ul>
            `,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: '<span style="font-size: 16px; font-weight: bold;">Confirm</span>',
            cancelButtonText: '<span style="font-size: 16px; font-weight: bold;">Cancel</span>',
            confirmButtonColor: "#3182ce",
            cancelButtonColor: "#e53e3e",
        }).then((result) => {
            if (result.isConfirmed) {
                handleStake();
            }
        });
    };

    const validatePrime = (value: string, setter: (value: string) => void) => {
        const num = Number(value);
        if (num !== Math.floor(num)) {
            return;
        }
    };
    
    const executeStakeUSDT = async () => {
        if (!web3) {
            console.error("Web3 is not initialized");
            return;
        }
    
        try {
            const amountToStake = web3.utils.toWei(inputValueusdt, "ether");
            const usdtContract = new web3.eth.Contract(erc20ABI, usdtAddress);
    
            // Step 1: Check allowance
            const allowance = await usdtContract.methods.allowance(address, contractAddress).call();
    
            if (Number(allowance) < Number(amountToStake)) {
                // Approve transaction
                const approval = await usdtContract.methods
                    .approve(contractAddress, amountToStake)
                    .send({ from: address });
    
                Swal.fire({
                    title: '<h2 style="color: #3182ce; font-weight: bold;">Approval in Progress</h2>',
                    html: `
                        <p style="color: #444; font-size: 16px; margin: 10px 0;">
                            Approval transaction is being processed. You can monitor its status here:
                        </p>
                        <a href="https://testnet.bscscan.com/tx/${approval.transactionHash}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           style="background: #4299e1; padding: 10px 20px; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-top: 10px;">
                           View Transaction on BscScan
                        </a>
                    `,
                    icon: "info",
                    showConfirmButton: true,
                });
            }
    
            // Step 2: Stake transaction
            const durationInMonths = usdtduration === "30 Days" ? 1 : usdtduration === "6 Months" ? 6 : 12;
    
            const transaction = await contract.methods.stake(durationInMonths, amountToStake).send({
                from: address,
                gas: 2000000,
                gasPrice: web3.utils.toWei("6", "gwei"),
            });
    
            Swal.fire({
                title: '<h2 style="color: #38a169; font-weight: bold;">Staking Successful!</h2>',
                html: `
                    <p style="color: #444; font-size: 16px; margin: 10px 0;">
                        Your staking transaction was successful. View transaction details:
                    </p>
                    <a href="https://testnet.bscscan.com/tx/${transaction.transactionHash}" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       style="background: #38a169; padding: 10px 20px; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-top: 10px;">
                       View Transaction on BscScan
                    </a>
                `,
                icon: "success",
                confirmButtonText: '<span style="font-size: 16px; font-weight: bold;">OK</span>',
                confirmButtonColor: "#38a169",
            });
    
            setInputValueusdt("");
            setSliderValueusdt(0);
            setUsdtDuration("");
            await fetchStakes();
            await fetchWalletBalance();
        } catch (error: any) {
            console.error("Staking error:", error);
    
            let errorMessage = `
                <p style="color: #444; font-size: 16px; margin: 10px 0;">
                    An unexpected error occurred. Please try again later.
                </p>
            `;
    
            if (error?.receipt?.transactionHash) {
                errorMessage = `
                    <p style="color: #444; font-size: 16px; margin: 10px 0;">
                        Unfortunately, the transaction failed. You can review the transaction details:
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
                title: '<h2 style="color: #e53e3e; font-weight: bold;">Staking Failed</h2>',
                html: errorMessage,
                icon: "error",
                confirmButtonText: '<span style="font-size: 16px; font-weight: bold;">OK</span>',
                confirmButtonColor: "#e53e3e",
            });
        }
    };
            

    const getWhaleHeadSrcusdt = (): string => {
        if (sliderValueusdt <= 25) return headImages["0-25"];
        if (sliderValueusdt <= 75) return headImages["25-75"];
        return headImages["75-100"];
    };

    return (
        <div className="flex flex-col w-full items-center text-white">
            <div className="flex h-screen w-full items-center text-[40px] my-[20px] md:my-0 md:text-[80px] relative justify-center">
                <img src={banner} alt="Whale" className="absolute w-full h-[100%] my-[20px] md:h-[auto]" />
                <div className="relative z-10 flex flex-col justify-center items-start w-full h-full px-4 mb-[-40px]">
                    <h1 className="font-bold text-[35px] md:text-[65px]">{t('swim')}</h1>
                    <h1 className="font-bold text-[35px] md:text-[65px]">{t('earn')}</h1>
                    <p className="mt-4 text-[15px] md:text-[25px]">{t('Join')}</p>
                    <button 
                        onClick={scrollToStakingSection}
                        className="flex gap-5 items-start py-5 pr-5 pl-6 mt-8 text-xl font-medium leading-tight uppercase border border-white border-solid bg-white bg-opacity-0 rounded-[50px] max-md:px-5">
                        <span data-layername="getStarted">get started</span>
                        <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/bc8a1e896fc15726b7d3f8274b0443debdc7f13601a48ce005764821aca12045?placeholderIfAbsent=true&apiKey=3982f1c4caac4533b049cdd9bd51d206" alt="" className="object-contain shrink-0 aspect-square w-[25px]" />
                    </button>
                </div>
            </div>
            <div className="flex justify-between w-full" id="staking-section">
                <h1 className="flex md:text-[60px] text-[30px] font-bold">{t('trading')}</h1>
                <p className="md:text-[20px] text-[13px] items-end flex">{t('risk')}</p>
            </div>
            


            {/* USDT Section */}
            <div className="flex flex-col w-full md:flex-grow p-6 mt-10 bg-black rounded-lg shadow-lg relative border-2 border-white">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                        <img src={usdt} alt="USDT" className="w-10 h-10 mr-2" />
                        <p className="text-xl font-bold text-white">USDT</p>
                    </div>
                    
                    <div 
                        className="relative" 
                        onMouseEnter={() => setIsTooltipVisible(true)} 
                        onMouseLeave={() => setIsTooltipVisible(false)}
                    >
                        <button className="text-gray-400 text-lg">i</button>
                        {isTooltipVisible && (
                            <div className="absolute right-0 mt-2 w-48 bg-gray-700 text-white p-2 rounded-lg shadow-lg">
                                Information about staking terms, risks, and more.
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between mb-4">
                    <p>Balance: {usdtWalletBalance && usdtWalletBalance !== "Error" && usdtWalletBalance !== "Connect Wallet" && !isNaN(parseFloat(usdtWalletBalance))
                                        ? parseFloat(usdtWalletBalance).toFixed(2)
                                        : usdtWalletBalance}
                        
                    </p>
                    <p className="text-gray-400">{usdtPrice !== null && usdtWalletBalance && usdtWalletBalance !== "Error" && usdtWalletBalance !== "Connect Wallet" && !isNaN(parseFloat(usdtWalletBalance)) && (
                                    <p className="text-sm text-right">≈{(parseFloat(usdtWalletBalance) * usdtPrice).toFixed(2)} USD</p>
                                )}</p>
                </div>

                <div className="flex justify-between">
                    <div className="flex flex-col w-1/2 pr-4">
                        <div className="flex items-center justify-between mb-4">
                            <p>Duration:</p>
                            <select
                                value={usdtduration}
                                onChange={handleDurationChange}
                                className="p-2 bg-gray-800 text-white rounded"
                            >
                                <option value="">Select Duration</option>
                                {testMode ? (
                                    <option value="1 Minute">1 Minute</option>
                                ) : (
                                    <>
                                        <option value="30 Days">30 Days</option>
                                        <option value="6 Months">6 Months</option>
                                        <option value="1 Year">1 Year</option>
                                    </>
                                )}
                            </select>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <p>APR:</p>
                            <p>{apr}</p>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <p>Unlock On:</p>
                            <p>{unlockDate}</p>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <p className="text-gray-400">You Will Get:</p>
                            <p className="text-white text-lg">{calculatedReward} USDT</p>
                        </div>
                    </div>

                    <div className="flex flex-col w-1/2 pl-4">
                        <div className="mb-4 items-right">
                        <PrimeInput
                                value={inputValueusdt}
                                setValue={(val: any) => {
                                    setInputValueusdt(val);

                                    // Update the slider value based on the input value
                                    if (usdtWalletBalance && usdtWalletBalance !== "Error" && usdtWalletBalance !== "Connect Wallet" && !isNaN(parseFloat(usdtWalletBalance))) {
                                        const balance = parseFloat(usdtWalletBalance);
                                        const newSliderValue = Math.min(100, (val / balance) * 100);
                                        setSliderValueusdt(newSliderValue);
                                    }
                                }}
                                validatePrime={validatePrime}
                            />
                        </div>
                        {/* Whale Slider */}
                        <WhaleSlider
                            sliderValue={sliderValueusdt}
                            setSliderValue={(val) => {
                                setSliderValueusdt(val);
                                if (usdtWalletBalance && usdtWalletBalance !== "Error" && usdtWalletBalance !== "Connect Wallet" && !isNaN(parseFloat(usdtWalletBalance))) {
                                    // Convert balance to a float and get its precision
                                    const balanceFloat = parseFloat(usdtWalletBalance);
                                    const precision = balanceFloat.toString().split(".")[1]?.length || 0; // Get decimal precision

                                    // Calculate based on selected percentage (e.g., 25%, 50%, 75%, or 100%)
                                    const calculatedValue = (balanceFloat * val) / 100;
                                    
                                    setInputValueusdt(
                                        val === 100
                                            ? balanceFloat.toFixed(precision) // Use entire balance for "All In"
                                            : calculatedValue.toFixed(precision) // Adjusted calculated value for other percentages
                                    );
                                }
                            }}
                            getWhaleHeadSrc={getWhaleHeadSrcusdt}
                            availableBalance={usdtWalletBalance !== "Error" && usdtWalletBalance !== "Connect Wallet" && !isNaN(formatBigInt(usdtWalletBalance))
                                ? formatBigInt(usdtWalletBalance)
                                : 0}
                            setInputValue={setInputValueusdt}
                        />

                    </div>
                </div>

                <button 
                onClick={handleStakeUSDT}
                className="w-full mt-6 py-3 bg-blue-900 rounded-lg text-white font-bold">
                    STAKE ▼
                </button>
            </div>
            <div className="w-full h-1"></div>
            <div className="flex justify-between w-full" id="my-stakes-section">
                <h1 className="flex md:text-[60px] text-[30px] font-bold">{t('staking')}</h1>
            </div>

            {/* Staking Cards Section */}
            <StakingCards />

            {/* Footer Section */}
            <div className="flex flex-col my-10 w-full h-auto bg-black">
                <img src={bg_whale} className="w-full h-auto" alt="" />
                <p className="lg:pl-20 pl-10 mt-[-90px] lg:mt-[-475px] text-[18px] md:text-[40px] font-bold lg:text-[51px]">{t('crypto')}</p>
                <div className="flex w-full mt-10 lg:mt-40 justify-left">
                    <a href="https://linktr.ee/WHALESTRATEGY" className="w-[25%] lg:w-[25%] ml-20 ">
                        <img src={linktree1} alt="" className="w-full h-auto cursor-pointer" />
                    </a>
                    <a href="https://discord.gg/xpkF6U9KJY" className="w-[25%] lg:w-[25%] ml-10">
                        <img src={discord1} alt="" className="w-full h-auto cursor-pointer" />
                    </a>
                </div>
            </div>
            <footer className="flex flex-wrap gap-5 justify-between mt-48 text-xl font-medium tracking-wide leading-tight text-white max-md:mt-10 max-md:max-w-full">
                <div data-layername="2024WhaleStrategyAllRightsReserved">
                    © 2024 Whale Strategy. All rights reserved.
                </div>
                <a href="#" data-layername="risksInvolved" className="text-right">
                    risks involved
                </a>
            </footer>
            <div className="w-full h-1"></div>
        </div>
    );
}


export default Staking;
