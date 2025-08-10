/**
 * Contract Interaction Utilities
 */

import { STACKS_TESTNET, STACKS_MAINNET } from "@stacks/network";
import {
  BooleanCV,
  cvToValue,
  fetchCallReadOnlyFunction,
  OptionalCV,
  TupleCV,
  uintCV,
  UIntCV,
  stringAsciiCV,
  listCV,
  someCV,
  noneCV,
  principalCV,
} from "@stacks/transactions";

// Environment variables dengan fallback values
const GOVERNANCE_TOKEN_CONTRACT =
  process.env.NEXT_PUBLIC_GOVERNANCE_TOKEN_CONTRACT ||
  "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.governance-token-v2";
const DAO_GOVERNANCE_CONTRACT =
  process.env.NEXT_PUBLIC_DAO_GOVERNANCE_CONTRACT ||
  "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dao-governance-v2";
const NETWORK =
  process.env.NEXT_PUBLIC_NETWORK === "mainnet"
    ? STACKS_MAINNET
    : STACKS_TESTNET;

// Check if contracts are configured
if (!GOVERNANCE_TOKEN_CONTRACT || !DAO_GOVERNANCE_CONTRACT) {
  console.warn(
    "Contract addresses not configured properly. Please check your environment variables."
  );
}

// Parse contract address and name
function parseContractId(contractId: string) {
  const [address, name] = contractId.split(".");
  return { address, name };
}

// === TYPE DEFINITIONS ===

export interface GovernanceToken {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  balance: number;
}

export interface Proposal {
  id: number;
  proposer: string;
  title: string;
  description: string;
  startBlock: number;
  endBlock: number;
  forVotes: number;
  againstVotes: number;
  executed: boolean;
  depositAmount: number;
  targetContract?: string;
  functionName?: string;
  functionArgs?: number[];
}

export interface ProposalResults {
  forVotes: number;
  againstVotes: number;
  totalVotes: number;
  quorumMet: boolean;
  proposalPassed: boolean;
  status: number;
  exists: boolean;
}

export interface Vote {
  support: boolean;
  voteWeight: number;
  blockHeight: number;
}

export interface GovernanceInfo {
  proposalThreshold: number;
  quorumThreshold: number;
  votingPeriod: number;
  executionDelay: number;
  proposalDeposit: number;
}

// Proposal status constants
export const PROPOSAL_STATUS = {
  PENDING: 0,
  ACTIVE: 1,
  SUCCEEDED: 2,
  DEFEATED: 3,
  EXECUTED: 4,
  EXPIRED: 5,
} as const;

// === GOVERNANCE TOKEN FUNCTIONS ===

export async function getTokenInfo(): Promise<GovernanceToken | null> {
  try {
    const { address, name } = parseContractId(GOVERNANCE_TOKEN_CONTRACT);

    const [nameResult, symbolResult, decimalsResult, totalSupplyResult] =
      await Promise.all([
        fetchCallReadOnlyFunction({
          contractAddress: address,
          contractName: name,
          functionName: "get-name",
          functionArgs: [],
          senderAddress: address,
          network: NETWORK,
        }),
        fetchCallReadOnlyFunction({
          contractAddress: address,
          contractName: name,
          functionName: "get-symbol",
          functionArgs: [],
          senderAddress: address,
          network: NETWORK,
        }),
        fetchCallReadOnlyFunction({
          contractAddress: address,
          contractName: name,
          functionName: "get-decimals",
          functionArgs: [],
          senderAddress: address,
          network: NETWORK,
        }),
        fetchCallReadOnlyFunction({
          contractAddress: address,
          contractName: name,
          functionName: "get-total-supply",
          functionArgs: [],
          senderAddress: address,
          network: NETWORK,
        }),
      ]);

    // Check if all results are valid
    if (!nameResult || !symbolResult || !decimalsResult || !totalSupplyResult) {
      console.warn("Some token info calls returned null");
      return null;
    }

    // ... di dalam fungsi Anda
    return {
      name: cvToValue(nameResult).value,
      symbol: cvToValue(symbolResult).value,
      decimals: cvToValue(decimalsResult).value,
      totalSupply: cvToValue(totalSupplyResult).value,
      balance: 0, // Akan diisi nanti
    };
  } catch (error) {
    console.error("Error fetching token info:", error);
    return null;
  }
}

export async function getTokenBalance(userAddress: string): Promise<number> {
  try {
    const { address, name } = parseContractId(GOVERNANCE_TOKEN_CONTRACT);

    const balanceResult = await fetchCallReadOnlyFunction({
      contractAddress: address,
      contractName: name,
      functionName: "get-balance",
      functionArgs: [principalCV(userAddress)],
      senderAddress: address,
      network: NETWORK,
    });

    return cvToValue(balanceResult).value;
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return 0;
  }
}

export function createTransferTokenTx(amount: number, recipient: string) {
  const { address, name } = parseContractId(GOVERNANCE_TOKEN_CONTRACT);

  return {
    contractAddress: address,
    contractName: name,
    functionName: "transfer",
    functionArgs: [
      uintCV(amount),
      principalCV(""), // sender will be filled by wallet
      principalCV(recipient),
      noneCV(),
    ],
  };
}

// === DAO GOVERNANCE FUNCTIONS ===

export async function getGovernanceInfo(): Promise<GovernanceInfo | null> {
  try {
    const { address, name } = parseContractId(DAO_GOVERNANCE_CONTRACT);

    const infoResult = await fetchCallReadOnlyFunction({
      contractAddress: address,
      contractName: name,
      functionName: "get-governance-info",
      functionArgs: [],
      senderAddress: address,
      network: NETWORK,
    });

    if (!infoResult) {
      console.warn("No governance info returned from contract");
      return null;
    }

    const info = cvToValue(infoResult as TupleCV);

    // Check if the response has the expected structure
    if (!info || !info.value) {
      console.warn("Invalid governance info structure:", info);
      return null;
    }

    const governanceData = info.value;

    // Validate all required fields exist
    const requiredFields = [
      "proposal-threshold",
      "quorum-threshold",
      "voting-period",
      "execution-delay",
      "proposal-deposit",
    ];
    for (const field of requiredFields) {
      if (!governanceData[field]) {
        console.warn(`Missing required field: ${field}`, governanceData);
        return null;
      }
    }

    return {
      proposalThreshold: governanceData["proposal-threshold"].value,
      quorumThreshold: governanceData["quorum-threshold"].value,
      votingPeriod: governanceData["voting-period"].value,
      executionDelay: governanceData["execution-delay"].value,
      proposalDeposit: governanceData["proposal-deposit"].value,
    };
  } catch (error) {
    console.error("Error fetching governance info:", error);
    return null;
  }
}

export async function getNextProposalId(): Promise<number> {
  try {
    const { address, name } = parseContractId(DAO_GOVERNANCE_CONTRACT);

    const result = await fetchCallReadOnlyFunction({
      contractAddress: address,
      contractName: name,
      functionName: "get-next-proposal-id",
      functionArgs: [],
      senderAddress: address,
      network: NETWORK,
    });

    return cvToValue(result as UIntCV);
  } catch (error) {
    console.error("Error fetching next proposal ID:", error);
    return 1;
  }
}

export async function getProposal(
  proposalId: number
): Promise<Proposal | null> {
  try {
    const { address, name } = parseContractId(DAO_GOVERNANCE_CONTRACT);

    const proposalResult = await fetchCallReadOnlyFunction({
      contractAddress: address,
      contractName: name,
      functionName: "get-proposal",
      functionArgs: [uintCV(proposalId)],
      senderAddress: address,
      network: NETWORK,
    });

    const proposalCV = proposalResult as OptionalCV<TupleCV>;
    if (proposalCV.type === "none") return null;

    const proposal = cvToValue(proposalCV);
    return {
      id: proposalId,
      proposer: proposal.value.proposer.value,
      title: proposal.value.title.value,
      description: proposal.value.description.value,
      startBlock: proposal.value["start-block"].value,
      endBlock: proposal.value["end-block"].value,
      forVotes: proposal.value["for-votes"].value,
      againstVotes: proposal.value["against-votes"].value,
      executed: proposal.value.executed.value,
      depositAmount: proposal.value["deposit-amount"].value,
      targetContract: proposal.value["target-contract"]?.value?.value,
      functionName: proposal.value["function-name"]?.value?.value,
      functionArgs: proposal.value["function-args"]?.value?.value,
    };
  } catch (error) {
    console.error("Error fetching proposal:", error);
    return null;
  }
}

export async function getAllProposals(): Promise<Proposal[]> {
  try {
    const nextId = await getNextProposalId();
    if (!nextId || nextId <= 1) {
      console.log("No proposals found or contract not accessible");
      return [];
    }

    const proposals: Proposal[] = [];

    // Fetch all proposals from 1 to nextId-1
    for (let i = 1; i < nextId; i++) {
      try {
        const proposal = await getProposal(i);
        if (proposal) {
          proposals.push(proposal);
        }
      } catch (error) {
        console.warn(`Error fetching proposal ${i}:`, error);
        // Continue with other proposals even if one fails
      }
    }

    return proposals.reverse(); // Most recent first
  } catch (error) {
    console.error("Error fetching all proposals:", error);
    return [];
  }
}

export async function getProposalResults(
  proposalId: number
): Promise<ProposalResults | null> {
  try {
    const { address, name } = parseContractId(DAO_GOVERNANCE_CONTRACT);

    const resultsResult = await fetchCallReadOnlyFunction({
      contractAddress: address,
      contractName: name,
      functionName: "get-proposal-results",
      functionArgs: [uintCV(proposalId)],
      senderAddress: address,
      network: NETWORK,
    });

    const results = cvToValue(resultsResult as TupleCV);
    return {
      forVotes: results.value["for-votes"].value,
      againstVotes: results.value["against-votes"].value,
      totalVotes: results.value["total-votes"].value,
      quorumMet: results.value["quorum-met"].value,
      proposalPassed: results.value["proposal-passed"].value,
      status: results.value.status.value,
      exists: results.value.exists.value,
    };
  } catch (error) {
    console.error("Error fetching proposal results:", error);
    return null;
  }
}

export async function getUserVote(
  proposalId: number,
  userAddress: string
): Promise<Vote | null> {
  try {
    const { address, name } = parseContractId(DAO_GOVERNANCE_CONTRACT);

    const voteResult = await fetchCallReadOnlyFunction({
      contractAddress: address,
      contractName: name,
      functionName: "get-vote",
      functionArgs: [uintCV(proposalId), principalCV(userAddress)],
      senderAddress: address,
      network: NETWORK,
    });

    const voteCV = voteResult as OptionalCV<TupleCV>;
    if (voteCV.type === "none") return null;

    const vote = cvToValue(voteCV);
    return {
      support: vote.value.support.value,
      voteWeight: vote.value["vote-weight"].value,
      blockHeight: vote.value["block-height"].value,
    };
  } catch (error) {
    console.error("Error fetching user vote:", error);
    return null;
  }
}

export async function canUserVote(
  proposalId: number,
  userAddress: string
): Promise<boolean> {
  try {
    const { address, name } = parseContractId(DAO_GOVERNANCE_CONTRACT);

    const canVoteResult = await fetchCallReadOnlyFunction({
      contractAddress: address,
      contractName: name,
      functionName: "can-vote",
      functionArgs: [uintCV(proposalId), principalCV(userAddress)],
      senderAddress: address,
      network: NETWORK,
    });

    return cvToValue(canVoteResult as BooleanCV);
  } catch (error) {
    console.error("Error checking can vote:", error);
    return false;
  }
}

export async function getTreasuryBalance(): Promise<number> {
  try {
    const { address, name } = parseContractId(DAO_GOVERNANCE_CONTRACT);

    const balanceResult = await fetchCallReadOnlyFunction({
      contractAddress: address,
      contractName: name,
      functionName: "get-treasury-balance",
      functionArgs: [],
      senderAddress: address,
      network: NETWORK,
    });

    return cvToValue(balanceResult as UIntCV);
  } catch (error) {
    console.error("Error fetching treasury balance:", error);
    return 0;
  }
}

// === TRANSACTION BUILDERS ===

export function createProposalTx(
  title: string,
  description: string,
  targetContract?: string,
  functionName?: string,
  functionArgs?: number[]
) {
  const { address, name } = parseContractId(DAO_GOVERNANCE_CONTRACT);

  return {
    contractAddress: address,
    contractName: name,
    functionName: "create-proposal",
    functionArgs: [
      stringAsciiCV(title),
      stringAsciiCV(description),
      targetContract ? someCV(principalCV(targetContract)) : noneCV(),
      functionName ? someCV(stringAsciiCV(functionName)) : noneCV(),
      functionArgs
        ? someCV(listCV(functionArgs.map((arg) => uintCV(arg))))
        : noneCV(),
    ],
  };
}

export function createVoteTx(proposalId: number, support: boolean) {
  const { address, name } = parseContractId(DAO_GOVERNANCE_CONTRACT);

  return {
    contractAddress: address,
    contractName: name,
    functionName: "vote",
    functionArgs: [uintCV(proposalId), support ? uintCV(1) : uintCV(0)],
  };
}

export function createExecuteProposalTx(proposalId: number) {
  const { address, name } = parseContractId(DAO_GOVERNANCE_CONTRACT);

  return {
    contractAddress: address,
    contractName: name,
    functionName: "execute-proposal",
    functionArgs: [uintCV(proposalId)],
  };
}

export function createAddToTreasuryTx(amount: number) {
  const { address, name } = parseContractId(DAO_GOVERNANCE_CONTRACT);

  return {
    contractAddress: address,
    contractName: name,
    functionName: "add-to-treasury",
    functionArgs: [uintCV(amount)],
  };
}

// === UTILITY FUNCTIONS ===

export function getProposalStatusText(status: number): string {
  switch (status) {
    case PROPOSAL_STATUS.PENDING:
      return "Pending";
    case PROPOSAL_STATUS.ACTIVE:
      return "Active";
    case PROPOSAL_STATUS.SUCCEEDED:
      return "Succeeded";
    case PROPOSAL_STATUS.DEFEATED:
      return "Defeated";
    case PROPOSAL_STATUS.EXECUTED:
      return "Executed";
    case PROPOSAL_STATUS.EXPIRED:
      return "Expired";
    default:
      return "Unknown";
  }
}

export function getProposalStatusColor(status: number): string {
  switch (status) {
    case PROPOSAL_STATUS.PENDING:
      return "status-pending";
    case PROPOSAL_STATUS.ACTIVE:
      return "status-active";
    case PROPOSAL_STATUS.SUCCEEDED:
      return "status-succeeded";
    case PROPOSAL_STATUS.DEFEATED:
    case PROPOSAL_STATUS.EXPIRED:
      return "status-defeated";
    case PROPOSAL_STATUS.EXECUTED:
      return "status-executed";
    default:
      return "status-pending";
  }
}
