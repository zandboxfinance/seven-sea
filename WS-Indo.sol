// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol"; // Import SafeMath

contract Staking is Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256; // Use SafeMath for uint256 calculations

    struct StakeInfo {
        uint256 stakedAmount;
        uint256 stakedAt;
        uint256 stakeEnd;
        uint256 rewards;
        uint8 APR;  // APR specific to each stake
        bool claimed;
    }

    IERC20 public immutable USDT;
    address public immutable hotWallet;

    mapping(address => StakeInfo[]) public userStakes;  // Array of stakes per user
    bool public testMode = false;

    event Staked(address indexed stakerAddress, uint256 amount, uint8 APR, uint256 stakeEnd, string message);
    event Unstaked(address indexed stakerAddress, uint256 amount, uint256 rewards, string message);
    event RewardsClaimed(address indexed stakerAddress, uint256 rewards, string message);
    event Withdrawn(address indexed owner, uint256 amount, string message);

    constructor(address _usdtAddress, address _hotWallet) Ownable(msg.sender) {
        USDT = IERC20(_usdtAddress);
        hotWallet = _hotWallet;
    }

    function toggleTestMode(bool _testMode) external onlyOwner {
        testMode = _testMode;
    }

    // Function to stake USDT with specified duration and amount
    function stake(uint8 durationInMonths, uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");

        // Calculate APR and rewards based on duration
        uint8 apr = _getAPR(durationInMonths);
        require(apr > 0, "Invalid staking duration");

        USDT.safeTransferFrom(msg.sender, address(this), amount);
        USDT.safeTransfer(hotWallet, amount);

        // Calculate stake end time with overflow check
        uint256 stakeEnd = _calculateStakeEnd(durationInMonths);
        require(stakeEnd > block.timestamp, "Duration overflow error");

        // Calculate rewards with SafeMath
        uint256 rewards = testMode ? 0 : _calculateRewards(apr, amount);

        // Store the stake information in the user's stake array
        userStakes[msg.sender].push(StakeInfo({
            stakedAmount: amount,
            stakedAt: block.timestamp,
            stakeEnd: stakeEnd,
            rewards: rewards,
            APR: apr,
            claimed: false
        }));

        emit Staked(msg.sender, amount, apr, stakeEnd, "Stake successful");
    }

    // Function to unstake specific stake and claim rewards if eligible
    function unstake(uint256 stakeIndex) external {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        StakeInfo storage stakeInfo = userStakes[msg.sender][stakeIndex];
        require(!stakeInfo.claimed, "Already unstaked or claimed");
        
        uint256 totalToReturn;
        uint256 stakedAmount = stakeInfo.stakedAmount;

        if (!testMode && block.timestamp < stakeInfo.stakeEnd) {
            // Apply 6% penalty for early unstaking in real mode, without any rewards
            uint256 penalty = stakedAmount.mul(6).div(100);
            totalToReturn = stakedAmount.sub(penalty);
            emit Unstaked(msg.sender, totalToReturn, 0, "Unstake successful with 6% penalty applied");
        } else {
            totalToReturn = stakedAmount.add(stakeInfo.rewards);
            emit Unstaked(msg.sender, totalToReturn, stakeInfo.rewards, "Unstake successful with rewards");
        }

        // Ensure hot wallet has enough funds for transfer
        require(
            USDT.balanceOf(hotWallet) >= totalToReturn,
            "Insufficient balance in hot wallet"
        );

        // Transfer amount and mark as claimed
        USDT.safeTransferFrom(hotWallet, msg.sender, totalToReturn);
        stakeInfo.claimed = true;  // Mark this stake as claimed
    }

    // Function for the user to claim rewards without unstaking
    function claimRewards(uint256 stakeIndex) external {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        StakeInfo storage stakeInfo = userStakes[msg.sender][stakeIndex];
        require(!stakeInfo.claimed, "Already claimed");
        require(block.timestamp >= stakeInfo.stakeEnd, "Stake period not yet ended");

        uint256 rewards = stakeInfo.rewards;
        require(rewards > 0, "No rewards to claim");

        require(
            USDT.balanceOf(hotWallet) >= rewards,
            "Insufficient balance in hot wallet"
        );

        USDT.safeTransferFrom(hotWallet, msg.sender, rewards);
        stakeInfo.rewards = 0;  // Reset rewards after claiming
        emit RewardsClaimed(msg.sender, rewards, "Rewards claimed successfully");
    }

    // Function for the owner to withdraw excess profits from contract
    function withdraw(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        USDT.safeTransfer(owner(), amount);
        emit Withdrawn(owner(), amount, "Profit withdrawal successful");
    }

    // Internal function to get APR based on staking duration
    function _getAPR(uint8 durationInMonths) internal pure returns (uint8) {
        if (durationInMonths == 1) {
            return 15;
        } else if (durationInMonths == 6) {
            return 24;
        } else if (durationInMonths == 12) {
            return 36;
        }
        return 0;
    }

    // Internal function to calculate rewards based on APR and amount staked
    function _calculateRewards(uint8 apr, uint256 amount) internal pure returns (uint256 rewards) {
        return amount.mul(apr).div(100); // Use SafeMath for calculation
    }

    // Helper function to calculate stake end time with overflow protection
    function _calculateStakeEnd(uint8 durationInMonths) internal view returns (uint256) {
        require(durationInMonths > 0, "Duration must be greater than zero");
        uint256 durationInSeconds = uint256(durationInMonths).mul(30).mul(1 days); // Cast durationInMonths to uint256
        uint256 stakeEnd = block.timestamp.add(durationInSeconds); // Add duration to current time
        require(stakeEnd > block.timestamp, "Stake end overflow"); // Overflow check
        return stakeEnd;
    }

    // Function to get all stakes for a user
    function getUserStakes(address user) external view returns (StakeInfo[] memory) {
        return userStakes[user];
    }
}
