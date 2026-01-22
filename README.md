## Features

- **Balance Checking**: Query account balances directly from the blockchain
- **Storage Reading**: Read and decode contract storage slots, including support for Solidity string encoding
- **Exact Gas Estimation**: Get the exact top of block gas costs for contract function calls with precision
- **Contract Interaction**: Execute smart contract functions with optional gas limit overrides

## Installation

```bash
npm install
```

This installs the required dependencies:
- `viem`: Ethereum library for contract interactions
- `dotenv`: Environment variable management

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
PRIVATE_KEY=your_private_key_here
RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x0e10e90f67C67c2cB9DD5071674FDCfb7853a6F5
```
## Scripts

### balance

Check the ETH balance of your account.

```bash
npm run balance
```

**Output**:
```
Balance: 1000000000000000000 wei
```

### exact-gas

Get the exact gas cost for calling the `setGreeting` function on the smart contract. Performs a binary search to find the exact minimum gas needed.

```bash
npm run exact-gas "Hello World"
```

**Arguments**:
- `greeting` (string): The greeting message to set

**Output**:
```
Initial gas estimate: 34402
Testing lower bound: 30961
Binary search between 30961 and 34402
Binary search between 32682 and 34402
...
Binary search between 34041 and 34044
Binary search between 34043 and 34044
Minimum gas limit for successful transaction: 34044
```

### get-storage

Read and decode data stored in a contract's storage slot. Automatically handles Solidity's string encoding (both short strings ≤31 bytes and long strings >31 bytes).

```bash
npm run get-storage
```

**Output** (example for short string):
```
Raw storage value: 0x48656c6c6f20576f726c64000000000000000000000000000000000000000016
Length marker: 0x16 = 22 (decimal)
Short string
Length: 11 bytes, Slots used: 1
Content:
Hello World
```

**Output** (example for long string):
```
Raw storage value: 0x0000000000000000000000000000000000000000000000000000000000000059
Length marker: 0x59 = 89 (decimal)
Long string
Length: 44 bytes, Slots used: 2
Data starts at slot: 0x290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563
Reading slot 0: 0x290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563
Slot 0 data: 0x54686520717569636b2062726f776e20666f78206a756d706564206f76657220
Reading slot 1: 0x290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e564
Slot 1 data: 0x746865206c617a7920666f780000000000000000000000000000000000000000
Content:
The quick brown fox jumped over the lazy fox
```

### set-greeting

Execute a transaction to call the `setGreeting` function on the smart contract.

```bash
npm run set-greeting "Hello World" [gasLimit]
```

**Arguments**:
- `greeting` (string): The greeting message to set
- `gasLimit` (number, optional): Custom gas limit for the transaction

**Output**:
```
Transaction hash: 0x1234567890abcdef...
```
