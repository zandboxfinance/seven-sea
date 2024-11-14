import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import banner from '../assets/banner.png';
import usdtbackground from '../assets/usdtplanbackground.png';
import mystake from '../assets/my_staking_btg.png';
import usdt from '../assets/usdt.png';
import bg_whale from '../assets/bg-whale.png';
import linktree1 from '../assets/social/linktree1.png';
import discord1 from '../assets/social/discord1.png';

import WhaleSlider from "../components/SliderComponent";
import PrimeInput from "../components/PrimeInput";
import DurationSelector from "../components/DurationSelector";
import StakingCards from "../pages/StakingCards"; // Import StakingCards component

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
    const { t } = useTranslation();
    const [usdtduration, setUsdtDuration] = useState("");
    const [apr, setApr] = useState("15%");
    const [inputValueusdt, setInputValueusdt] = useState('');
    const [sliderValueusdt, setSliderValueusdt] = useState<number>(0);
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    // Function to scroll to the staking section
    const scrollToStakingSection = () => {
        const stakingSection = document.getElementById('staking-section'); // Assume you have a wrapper element with this ID
        if (stakingSection) {
            stakingSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Function to handle duration change and update APR accordingly
    const handleDurationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedDuration = event.target.value;
        setUsdtDuration(selectedDuration);

        // Update APR based on selected duration
        if (selectedDuration === "30 Days") {
            setApr("15%");
        } else if (selectedDuration === "6 Months") {
            setApr("24%");
        } else if (selectedDuration === "1 Year") {
            setApr("36%");
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
                        className="flex gap-5 items-start py-5 pr-5 pl-6 mt-8 text-xl font-medium leading-tight uppercase border border-white border-solid bg-white bg-opacity-0 rounded-[50px] max-md:px-5" id="staking-section">
                        <span data-layername="getStarted">get started</span>
                        <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/bc8a1e896fc15726b7d3f8274b0443debdc7f13601a48ce005764821aca12045?placeholderIfAbsent=true&apiKey=3982f1c4caac4533b049cdd9bd51d206" alt="" className="object-contain shrink-0 aspect-square w-[25px]" />
                    </button>
                </div>
            </div>
            <div className="flex justify-between w-full">
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
                    <p className="text-gray-400">balance: 42069 USDT</p>
                    <p className="text-gray-400">≈ $42,069 USD</p>
                </div>

                <div className="flex justify-between">
                    <div className="flex flex-col w-1/2 pr-4">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-gray-400">Duration:</p>
                            <select
                                value={usdtduration}
                                onChange={handleDurationChange}
                                className="bg-gray-800 text-white p-2 rounded"
                            >
                                <option value="30 Days">30 Days</option>
                                <option value="6 Months">6 Months</option>
                                <option value="1 Year">1 Year</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <p className="text-gray-400">APR:</p>
                            <p className="text-white text-lg">{apr}</p>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <p className="text-gray-400">Unlock On:</p>
                            <p className="text-white text-lg">Nov 7 2024 08:00</p>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <p className="text-gray-400">You Will Get:</p>
                            <p className="text-white text-lg">100 USDT</p>
                        </div>
                    </div>

                    <div className="flex flex-col w-1/2 pl-4">
                        <div className="mb-4 items-right">
                            <PrimeInput
                                value={inputValueusdt}
                                setValue={setInputValueusdt}
                                validatePrime={() => {}}
                            />
                        </div>

                        <WhaleSlider
                            sliderValue={sliderValueusdt}
                            setSliderValue={setSliderValueusdt}
                            getWhaleHeadSrc={getWhaleHeadSrcusdt}
                        />
                    </div>
                </div>

                <button className="w-full mt-6 py-3 bg-blue-900 rounded-lg text-white font-bold">
                    STAKE ▼
                </button>
            </div>
            <div className="w-full lg:w-[47%] flex flex-col items-center justify-center bg-black rounded-lg p-8">
                <h2 className="text-white text-3xl font-bold mb-4">{t('nostakeyet')}</h2>
                <p className="text-white mb-4">
                    {t('nostakeline')}
                </p>
                <button
                    onClick={scrollToStakingSection}
                    className="bg-blue-500 hover:bg-blue-700 text-white p-3 rounded-md mt-4 transform hover:scale-105 transition-transform duration-300 focus:outline-none"
                >
                    {t('getstarted')}
                </button>
            </div>
            <div className="flex justify-between w-full">
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
