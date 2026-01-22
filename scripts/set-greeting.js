import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import 'dotenv/config';

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!PRIVATE_KEY || !RPC_URL || !CONTRACT_ADDRESS) {
  throw new Error('Missing PRIVATE_KEY, RPC_URL, or CONTRACT_ADDRESS in environment variables');
}

const greeting = process.argv[2];
const gasLimit = process.argv[3];


const account = privateKeyToAccount(PRIVATE_KEY);
const publicClient = createPublicClient({
  transport: http(RPC_URL),
});
const client = createWalletClient({
  transport: http(RPC_URL),
  account,
});

const txHash = await client.writeContract({
  address: CONTRACT_ADDRESS,
  abi: [
    {
      type: 'function',
      name: 'setGreeting',
      inputs: [{ name: 'newGreeting', type: 'string' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
  ],
  functionName: 'setGreeting',
  args: [greeting],
  ...(gasLimit && { gas: BigInt(gasLimit) }),
});

console.log(`Transaction hash: ${txHash}`);

const receipt = await publicClient.waitForTransactionReceipt({ 
  hash: txHash,
  confirmations: 0,
  checkReplacement: false,
  pollingInterval: 1000,
  retryCount: 12 * 10, // Retry for 10 blocks assuming ~12s block time
});

console.log(`Transaction confirmed in block ${receipt.blockNumber} with status ${receipt.status}`);
