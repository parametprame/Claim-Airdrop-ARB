const ethers = require("ethers");
const dotenv = require("dotenv");
const ClaimTokenABI = require("./ABI/ClaimTokenABI.json");
const ERC20ABI = require("./ABI/ERC20ABI.json");

dotenv.config();

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

async function FastClaim() {
  const blockHasClaimed = await contract.claimPeriodStart();
  const currentBlock = await providerOnEthereum.getBlockNumber();

  if (currentBlock >= blockHasClaimed.toString()) {
    const claimTransaction = contract.claim();

    await claimTransaction.wait();

    const amount = await ArbToken.balanceOf(wallet.address);
    console.log(
      `You received : ${parseInt(amount.toString()) / 10 ** 18} $ARB.`
    );

    const transferTransaction = ArbToken.transfer(RECEIVER_ADDRESS, amount);

    await transferTransaction.wait();
  } else {
    console.log(
      `Not time to claim token. Time To Claim : ${blockHasClaimed.toString()}, Current Time : ${currentBlock}`
    );
  }
}

const cron = require("node-cron");
cron.schedule("*/5 * * * * *", FastClaim);
