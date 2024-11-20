import { ConnectButton } from '@rainbow-me/rainbowkit';
import Navbar from './pages/Navbar';
import Staking from './pages/Staking';

function App() {
  return (
    <div className="flex flex-col items-center bg-[#000000] text-stone-900 dark:text-stone-300 min-h-screen font-inter">
      {/* Navbar Component */}
      <Navbar />

      {/* Main Content */}
      <div className="px-4 w-full md:w-[95%] xl:w-3/4">
        {/* Staking Section */}
        <Staking />
      </div>
    </div>
  );
}

export default App;
