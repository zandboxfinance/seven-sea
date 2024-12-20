import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LANGUAGES } from "../constants";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi"; // Wallet connection
import Web3 from "web3";
import Swal from "sweetalert2";

function Navbar() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState({
    label: t("English"), // Default language label
    img: "", // Default language icon
  });

  const { isConnected, address } = useAccount(); // Wallet connection status and address
  const [isOwner, setIsOwner] = useState(false);
  const [testMode, setTestMode] = useState(false); // Test mode state
  const [paused, setPaused] = useState(false); // Paused state

  // Contract details
  const contractABI = JSON.parse(import.meta.env.VITE_CONTRACT_ABI);
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const OWNER_ADDRESS = import.meta.env.VITE_OWNER_ADDRESS;

  // Check if the connected wallet address is the owner and fetch test mode/paused status
  useEffect(() => {
    const initialize = async () => {
      if (isConnected && address?.toLowerCase() === OWNER_ADDRESS.toLowerCase()) {
        setIsOwner(true);
        await fetchTestModeStatus();
        await fetchPausedStatus();
      } else {
        setIsOwner(false);
      }
    };
    initialize();
  }, [address, isConnected]);

  // Fetch the current test mode status from the smart contract
  const fetchTestModeStatus = async () => {
    if (isConnected && address && isOwner) {
      try {
        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        const currentTestMode: boolean = await contract.methods.testMode().call();
        setTestMode(currentTestMode);
      } catch (error) {
        console.error("Error fetching Test Mode status:", error);
      }
    }
  };

  // Fetch the current paused status from the smart contract
  const fetchPausedStatus = async () => {
    if (isConnected && address && isOwner) {
      try {
        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        const currentPausedStatus: boolean = await contract.methods.paused().call();
        setPaused(currentPausedStatus);
      } catch (error) {
        console.error("Error fetching Paused status:", error);
      }
    }
  };

  // Function to toggle test mode on the smart contract
  const handleTestModeToggle = async () => {
    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      const newTestMode = !testMode; // Toggle the current test mode value
      await contract.methods.toggleTestMode(newTestMode).send({ from: address });

      setTestMode(newTestMode);

      Swal.fire({
        title: "Test Mode Toggled",
        text: `Test Mode is now ${newTestMode ? "enabled" : "disabled"}!`,
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error: any) {
      console.error("Error toggling Test Mode:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to toggle Test Mode. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  // Function to toggle the paused state on the smart contract
  const handlePauseToggle = async () => {
    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      await contract.methods.togglePause().send({ from: address });

      // Update the local paused state
      const newPausedStatus = !paused;
      setPaused(newPausedStatus);

      Swal.fire({
        title: "Pause Toggled",
        text: `The contract is now ${newPausedStatus ? "paused" : "unpaused"}!`,
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error: any) {
      console.error("Error toggling Pause:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to toggle Pause. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  // Function to handle language change
  const onChangeLang = (code: string, label: string, img: string) => {
    i18n.changeLanguage(code);
    setSelectedLanguage({ label, img });
    setIsOpen(false);
  };

  return (
    <div className="px-2 flex w-full items-center justify-between fixed z-40 top-0 left-0 h-28 md:pr-8 font dark:bg-[rgba(255,255,255,0)] backdrop-blur-[30px] shadow-[0_3px_6px_3px_rgba(0,0,0,0.4)] transition-all duration-300">
      <a href="https://whalestrategy.net/">
        <img src="/logo.png" className="w-16 h-16 sm:ml-10" alt="Logo" />
      </a>
      <div className="flex items-center">
        <ConnectButton />
        
        {/* Owner Section */}
        {isOwner && (
          <div className="ml-4 flex items-center">
            <button
              onClick={handleTestModeToggle}
              className="bg-[#0E76FD] text-white px-4 py-2 rounded-md font-bold"
            >
              Toggle Test Mode
            </button>
            <span className="ml-4 text-white font-bold">
              Test Mode: {testMode ? "ON" : "OFF"}
            </span>

            <button
              onClick={handlePauseToggle}
              className="ml-4 bg-red-600 text-white px-4 py-2 rounded-md font-bold"
            >
              {paused ? "Unpause" : "Pause"}
            </button>
            <span className="ml-4 text-white font-bold">
              Status: {paused ? "Paused" : "Active"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;
