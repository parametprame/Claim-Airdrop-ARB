const ethers = require("ethers");

require("dotenv").config();

const ClaimTokenABI = require("./ABI/ClaimTokenABI.json");

async function FastClaim() {
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const RPC = process.env.RPC;
  const RPC_ETHEREUM = process.env.RPC_ETHEREUM;
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

  const provider = new ethers.providers.JsonRpcProvider(RPC);

  const providerOnEthereum = new ethers.providers.JsonRpcProvider(RPC_ETHEREUM);

  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ClaimTokenABI, wallet);

  const blockHasClaimed = await contract.claimPeriodStart();
  const currentBlock = await providerOnEthereum.getBlockNumber();

  if (currentBlock >= blockHasClaimed.toString()) {
    await contract.claim();
  } else {
    console.log(
      `Not time to claim token. Time To Claim : ${blockHasClaimed.toString()}, Current Time : ${currentBlock}`
    );
  }
}

setInterval(FastClaim, 5000);
