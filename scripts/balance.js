import { createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import 'dotenv/config';

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;

if (!PRIVATE_KEY || !RPC_URL) {
  throw new Error('Missing PRIVATE_KEY or RPC_URL in environment variables');
}

const account = privateKeyToAccount(PRIVATE_KEY);
const client = createPublicClient({
  transport: http(RPC_URL),
});

const balance = await client.getBalance({ address: account.address });
console.log(`Balance: ${balance} wei`);
