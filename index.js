const ethers = require("ethers");

require("dotenv").config();

const ClaimTokenABI = require("./ABI/ClaimTokenABI.json");
const ERC20ABI = require("./ABI/ERC20ABI.json");

async function FastClaim() {
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const RPC = process.env.RPC;
  const RPC_ETHEREUM = process.env.RPC_ETHEREUM;
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
  const CONTRACT_TOKEN = process.env.CONTRACT_TOKEN;
  const RECEIVER_ADDRESS = process.env.RECEIVER_ADDRESS;

  const provider = new ethers.providers.JsonRpcProvider(RPC);

  const providerOnEthereum = new ethers.providers.JsonRpcProvider(RPC_ETHEREUM);

  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ClaimTokenABI, wallet);
  const ArbToken = new ethers.Contract(CONTRACT_TOKEN, ERC20ABI, wallet);

  const blockHasClaimed = await contract.claimPeriodStart();
  const currentBlock = await providerOnEthereum.getBlockNumber();

  if (currentBlock >= blockHasClaimed.toString()) {
    await contract.claim();
    const amount = await ArbToken.balanceOf(wallet.address);
    console.log(`You recevied : ${parseInt(amount.toString())} $ARB.`);
    await ArbToken.transfer(RECEIVER_ADDRESS, amount);
  } else {
    console.log(
      `Not time to claim token. Time To Claim : ${blockHasClaimed.toString()}, Current Time : ${currentBlock}`
    );
  }
}

setInterval(FastClaim, 5000);
