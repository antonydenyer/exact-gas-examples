import { createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import 'dotenv/config';

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!PRIVATE_KEY || !RPC_URL || !CONTRACT_ADDRESS) {
  throw new Error('Missing PRIVATE_KEY, RPC_URL, or CONTRACT_ADDRESS in environment variables');
}

const greeting = process.argv[2];

if (!greeting) {
  throw new Error('Please provide a greeting message as argument');
}

const account = privateKeyToAccount(PRIVATE_KEY);
const client = createPublicClient({
  transport: http(RPC_URL),
});

const upper = await client.estimateContractGas({
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
  account,
});

console.log(`Initial gas estimate: ${upper}`);

const estimateWithGasLimit = async (gasLimit) => {
  try {
    await client.simulateContract({
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
      account,
      gas: gasLimit,
    });
    return true;
  } catch {
    return false;
  }
};

if (!(await estimateWithGasLimit(upper))) {
  console.error(`Estimate failed at initial upper bound: ${upper}`);
  process.exit(1);
}

let low = Number((upper * BigInt(9)) / BigInt(10));
let high = Number(upper);
console.log(`Testing lower bound: ${low}`);

if (await estimateWithGasLimit(BigInt(low))) {
  console.error(`Lower bound (${low}) unexpectedly succeeds; adjust the multiplier`);
  process.exit(1);
}

while (low < high) {
  console.log(`Binary search between ${low} and ${high}`);
  const mid = Math.floor((low + high) / 2);
  if (await estimateWithGasLimit(BigInt(mid))) {
    high = mid;
  } else {
    low = mid + 1;
  }
}

console.log(`Minimum gas limit for successful transaction: ${low}`);
