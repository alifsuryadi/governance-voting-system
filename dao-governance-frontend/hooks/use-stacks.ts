/**
 * Stacks Integration Hook
 * Handles wallet connection and contract interactions
 */

import { useEffect, useState, useCallback } from "react";
import {
  AppConfig,
  openContractCall,
  showConnect,
  type UserData,
  UserSession,
} from "@stacks/connect";
import { PostConditionMode } from "@stacks/transactions";
import { getStxBalance } from "../lib/stx-utils";
import {
  getTokenBalance,
  createProposalTx,
  createVoteTx,
  createExecuteProposalTx,
  createTransferTokenTx,
  createAddToTreasuryTx,
  GovernanceToken,
  getTokenInfo,
} from "../lib/contract-utils";

// App configuration
const appDetails = {
  name: "DAO Governance System",
  icon: "https://cryptologos.cc/logos/stacks-stx-logo.png",
};

const appConfig = new AppConfig(["store_write"]);
const userSession = new UserSession({ appConfig });

// Hook interface
interface UseStacksReturn {
  // User state
  userData: UserData | null;
  stxBalance: number;
  sptBalance: number;
  tokenInfo: GovernanceToken | null;
  isLoading: boolean;

  // Wallet functions
  connectWallet: () => void;
  disconnectWallet: () => void;

  // Contract interaction functions
  handleCreateProposal: (
    title: string,
    description: string,
    targetContract?: string,
    functionName?: string,
    functionArgs?: number[]
  ) => Promise<void>;
  handleVote: (proposalId: number, support: boolean) => Promise<void>;
  handleExecuteProposal: (proposalId: number) => Promise<void>;
  handleTransferTokens: (amount: number, recipient: string) => Promise<void>;
  handleAddToTreasury: (amount: number) => Promise<void>;

  // Refresh functions
  refreshBalances: () => Promise<void>;
  refreshTokenInfo: () => Promise<void>;
}

export function useStacks(): UseStacksReturn {
  // State management
  const [userData, setUserData] = useState<UserData | null>(null);
  const [stxBalance, setStxBalance] = useState(0);
  const [sptBalance, setSptBalance] = useState(0);
  const [tokenInfo, setTokenInfo] = useState<GovernanceToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Wallet connection functions
  const connectWallet = useCallback(() => {
    showConnect({
      appDetails,
      onFinish: () => {
        window.location.reload();
      },
      userSession,
    });
  }, []);

  const disconnectWallet = useCallback(() => {
    userSession.signUserOut();
    setUserData(null);
    setStxBalance(0);
    setSptBalance(0);
  }, []);

  // Refresh functions
  const refreshBalances = useCallback(async () => {
    if (!userData) return;

    try {
      const address = userData.profile.stxAddress.testnet;
      const [stxBal, sptBal] = await Promise.all([
        getStxBalance(address),
        getTokenBalance(address),
      ]);

      setStxBalance(stxBal);
      setSptBalance(sptBal);
    } catch (error) {
      console.error("Error refreshing balances:", error);
    }
  }, [userData]);

  const refreshTokenInfo = useCallback(async () => {
    try {
      const info = await getTokenInfo();
      setTokenInfo(info);
    } catch (error) {
      console.error("Error refreshing token info:", error);
    }
  }, []);

  // Contract interaction functions
  const handleCreateProposal = useCallback(
    async (
      title: string,
      description: string,
      targetContract?: string,
      functionName?: string,
      functionArgs?: number[]
    ) => {
      if (typeof window === "undefined") return;

      if (!userData) {
        window.alert("Please connect your wallet first");
        return;
      }

      if (!title.trim() || !description.trim()) {
        window.alert("Please provide both title and description");
        return;
      }

      if (title.length > 100) {
        window.alert("Title must be 100 characters or less");
        return;
      }

      if (description.length > 500) {
        window.alert("Description must be 500 characters or less");
        return;
      }

      try {
        const txOptions = createProposalTx(
          title,
          description,
          targetContract,
          functionName,
          functionArgs
        );

        await openContractCall({
          ...txOptions,
          appDetails,
          onFinish: (data) => {
            console.log("Proposal creation transaction:", data);
            window.alert(
              "Proposal creation transaction submitted! Check your wallet for confirmation."
            );
          },
          postConditionMode: PostConditionMode.Allow,
        });
      } catch (error) {
        const err = error as Error;
        console.error("Error creating proposal:", err);
        window.alert(`Error creating proposal: ${err.message}`);
      }
    },
    [userData]
  );

  const handleVote = useCallback(
    async (proposalId: number, support: boolean) => {
      if (typeof window === "undefined") return;

      if (!userData) {
        window.alert("Please connect your wallet first");
        return;
      }

      if (proposalId < 1) {
        window.alert("Invalid proposal ID");
        return;
      }

      try {
        const txOptions = createVoteTx(proposalId, support);

        await openContractCall({
          ...txOptions,
          appDetails,
          onFinish: (data) => {
            console.log("Vote transaction:", data);
            window.alert(
              `Vote ${
                support ? "FOR" : "AGAINST"
              } submitted! Check your wallet for confirmation.`
            );
          },
          postConditionMode: PostConditionMode.Allow,
        });
      } catch (error) {
        const err = error as Error;
        console.error("Error voting:", err);
        window.alert(`Error voting: ${err.message}`);
      }
    },
    [userData]
  );

  const handleExecuteProposal = useCallback(
    async (proposalId: number) => {
      if (typeof window === "undefined") return;

      if (!userData) {
        window.alert("Please connect your wallet first");
        return;
      }

      if (proposalId < 1) {
        window.alert("Invalid proposal ID");
        return;
      }

      try {
        const txOptions = createExecuteProposalTx(proposalId);

        await openContractCall({
          ...txOptions,
          appDetails,
          onFinish: (data) => {
            console.log("Execute proposal transaction:", data);
            window.alert(
              "Proposal execution transaction submitted! Check your wallet for confirmation."
            );
          },
          postConditionMode: PostConditionMode.Allow,
        });
      } catch (error) {
        const err = error as Error;
        console.error("Error executing proposal:", err);
        window.alert(`Error executing proposal: ${err.message}`);
      }
    },
    [userData]
  );

  const handleTransferTokens = useCallback(
    async (amount: number, recipient: string) => {
      if (typeof window === "undefined") return;

      if (!userData) {
        window.alert("Please connect your wallet first");
        return;
      }

      if (amount <= 0) {
        window.alert("Please enter a valid amount");
        return;
      }

      if (!recipient.trim()) {
        window.alert("Please enter a recipient address");
        return;
      }

      try {
        const txOptions = createTransferTokenTx(amount, recipient);

        await openContractCall({
          ...txOptions,
          appDetails,
          onFinish: (data) => {
            console.log("Token transfer transaction:", data);
            window.alert(
              "Token transfer transaction submitted! Check your wallet for confirmation."
            );
          },
          postConditionMode: PostConditionMode.Allow,
        });
      } catch (error) {
        const err = error as Error;
        console.error("Error transferring tokens:", err);
        window.alert(`Error transferring tokens: ${err.message}`);
      }
    },
    [userData]
  );

  const handleAddToTreasury = useCallback(
    async (amount: number) => {
      if (typeof window === "undefined") return;

      if (!userData) {
        window.alert("Please connect your wallet first");
        return;
      }

      if (amount <= 0) {
        window.alert("Please enter a valid amount");
        return;
      }

      try {
        const txOptions = createAddToTreasuryTx(amount);

        await openContractCall({
          ...txOptions,
          appDetails,
          onFinish: (data) => {
            console.log("Add to treasury transaction:", data);
            window.alert(
              "Treasury deposit transaction submitted! Check your wallet for confirmation."
            );
          },
          postConditionMode: PostConditionMode.Allow,
        });
      } catch (error) {
        const err = error as Error;
        console.error("Error adding to treasury:", err);
        window.alert(`Error adding to treasury: ${err.message}`);
      }
    },
    [userData]
  );

  // Initialize user session
  useEffect(() => {
    const initializeSession = async () => {
      setIsLoading(true);

      try {
        if (userSession.isSignInPending()) {
          const userData = await userSession.handlePendingSignIn();
          setUserData(userData);
        } else if (userSession.isUserSignedIn()) {
          const userData = userSession.loadUserData();
          setUserData(userData);
        }
      } catch (error) {
        console.error("Error initializing session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, []);

  // Load balances when user connects
  useEffect(() => {
    if (userData) {
      refreshBalances();
    }
  }, [userData, refreshBalances]);

  // Load token info on mount
  useEffect(() => {
    refreshTokenInfo();
  }, [refreshTokenInfo]);

  return {
    // User state
    userData,
    stxBalance,
    sptBalance,
    tokenInfo,
    isLoading,

    // Wallet functions
    connectWallet,
    disconnectWallet,

    // Contract interaction functions
    handleCreateProposal,
    handleVote,
    handleExecuteProposal,
    handleTransferTokens,
    handleAddToTreasury,

    // Refresh functions
    refreshBalances,
    refreshTokenInfo,
  };
}
