import { createPublicClient, http, toHex, keccak256, pad } from 'viem';
import 'dotenv/config';

const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!RPC_URL || !CONTRACT_ADDRESS) {
  throw new Error('Missing RPC_URL or CONTRACT_ADDRESS in environment variables');
}

const client = createPublicClient({
  transport: http(RPC_URL),
});

const storageValue = await client.getStorageAt({
  address: CONTRACT_ADDRESS,
  slot: toHex(0),
});

console.log(`Raw storage value: ${storageValue}`);

const storageHex = storageValue.slice(2);
const lengthMarkerHex = storageHex.slice(-2);
const lengthMarker = parseInt(lengthMarkerHex, 16);

console.log(`Length marker: 0x${lengthMarkerHex} = ${lengthMarker} (decimal)`);

if ((lengthMarker & 1) === 0) {
  // Short string (<=31 bytes)
  const actualLength = lengthMarker / 2;
  console.log('Short string');

  const stringData = storageHex.slice(0, actualLength * 2);
  console.log(`Length: ${actualLength} bytes, Slots used: 1`);
  console.log('Content:');

  const buffer = Buffer.from(stringData, 'hex');
  console.log(buffer.toString('utf8'));
} else {
  // Long string (>31 bytes)
  const storageInt = BigInt(storageValue);
  const actualLength = Number((storageInt - BigInt(1)) / BigInt(2));
  const slotsNeeded = Math.ceil(actualLength / 32);

  console.log('Long string');
  console.log(`Length: ${actualLength} bytes, Slots used: ${slotsNeeded}`);

  // Calculate keccak256(0) for the starting slot
  const slot0Padded = pad(toHex(0), { size: 32 });
  const dataSlot = keccak256(slot0Padded);

  console.log(`Data starts at slot: ${dataSlot}`);

  let fullContent = '';
  for (let i = 0; i < slotsNeeded; i++) {
    const currentSlot = toHex(BigInt(dataSlot) + BigInt(i));
    console.log(`Reading slot ${i}: ${currentSlot}`);
    const slotData = await client.getStorageAt({
      address: CONTRACT_ADDRESS,
      slot: currentSlot,
    });
    console.log(`Slot ${i} data: ${slotData}`);
    fullContent += slotData.slice(2);
  }

  const contentHex = fullContent.slice(0, actualLength * 2);
  const buffer = Buffer.from(contentHex, 'hex');
  console.log('Content:');
  console.log(buffer.toString('utf8'));
}
