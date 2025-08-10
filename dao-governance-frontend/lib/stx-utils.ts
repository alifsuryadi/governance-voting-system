/**
 * STX and Address Utility Functions
 */

// Format STX amount with proper decimals (6 decimal places)
export function formatStx(amount: number): string {
  return (amount / 1_000_000).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

// Parse STX amount from human readable to microSTX
export function parseStx(amount: number): number {
  return Math.floor(amount * 1_000_000);
}

// Format SPT governance tokens (6 decimal places)
export function formatSpt(amount: number): string {
  return (amount / 1_000_000).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

// Parse SPT amount from human readable to base units
export function parseSpt(amount: number): number {
  return Math.floor(amount * 1_000_000);
}

// Abbreviate Stacks address for display
export function abbreviateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
}

// Abbreviate transaction ID for display
export function abbreviateTxnId(txnId: string): string {
  if (txnId.length <= 16) return txnId;
  return `${txnId.substring(0, 8)}...${txnId.substring(txnId.length - 8)}`;
}

// Generate explorer URL for address
export function explorerAddress(
  address: string,
  network: string = "testnet"
): string {
  const baseUrl =
    network === "mainnet"
      ? "https://explorer.hiro.so"
      : "https://explorer.hiro.so";
  return `${baseUrl}/address/${address}?chain=${network}`;
}

// Generate explorer URL for transaction
export function explorerTxn(
  txnId: string,
  network: string = "testnet"
): string {
  const baseUrl =
    network === "mainnet"
      ? "https://explorer.hiro.so"
      : "https://explorer.hiro.so";
  return `${baseUrl}/txid/${txnId}?chain=${network}`;
}

// Get STX balance from API
export async function getStxBalance(
  address: string,
  network: string = "testnet"
): Promise<number> {
  try {
    const baseUrl =
      network === "mainnet"
        ? "https://api.hiro.so"
        : "https://api.testnet.hiro.so";
    const url = `${baseUrl}/extended/v1/address/${address}/stx`;

    const response = await fetch(url);
    const data = await response.json();
    return parseInt(data.balance);
  } catch (error) {
    console.error("Error fetching STX balance:", error);
    return 0;
  }
}

// Format large numbers with K, M, B suffixes
export function formatLargeNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + "B";
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + "K";
  }
  return num.toString();
}

// Calculate percentage with proper formatting
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return "0%";
  const percentage = (value / total) * 100;
  return percentage.toFixed(1) + "%";
}

// Format time remaining until block height
export function formatTimeRemaining(
  currentBlock: number,
  targetBlock: number
): string {
  const blocksRemaining = targetBlock - currentBlock;
  if (blocksRemaining <= 0) return "Expired";

  // Assuming ~10 minutes per block on Stacks
  const minutesRemaining = blocksRemaining * 10;
  const hoursRemaining = Math.floor(minutesRemaining / 60);
  const daysRemaining = Math.floor(hoursRemaining / 24);

  if (daysRemaining > 0) {
    return `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}`;
  }
  if (hoursRemaining > 0) {
    return `${hoursRemaining} hour${hoursRemaining !== 1 ? "s" : ""}`;
  }
  return `${minutesRemaining} minute${minutesRemaining !== 1 ? "s" : ""}`;
}

// Validate Stacks address format
export function isValidStacksAddress(address: string): boolean {
  const stacksAddressRegex =
    /^S[123][0-9A-HJ-NP-Z]{48}$|^ST[0-9A-HJ-NP-Z]{38}$/;
  return stacksAddressRegex.test(address);
}

// Generate random proposal ID for demos/testing
export function generateProposalId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

// Format block number for display
export function formatBlockNumber(blockNumber: number): string {
  return blockNumber.toLocaleString("en-US");
}

// Calculate voting power percentage
export function calculateVotingPowerPercentage(
  userTokens: number,
  totalSupply: number
): number {
  if (totalSupply === 0) return 0;
  return (userTokens / totalSupply) * 100;
}
