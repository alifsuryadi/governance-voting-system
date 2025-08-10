"use client";

import { useState, useEffect } from "react";
import { useStacks } from "../hooks/use-stacks";
import {
  Proposal,
  Vote,
  canUserVote,
  getUserVote,
  PROPOSAL_STATUS,
  ProposalResults,
} from "../lib/contract-utils";
import { formatSpt } from "../lib/stx-utils";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Vote as VoteIcon,
  Loader2,
  Users,
  Clock,
} from "lucide-react";

interface VotingInterfaceProps {
  proposal: Proposal;
  results?: ProposalResults;
  onVoteSuccess?: () => void;
}

export function VotingInterface({
  proposal,
  results,
  onVoteSuccess,
}: VotingInterfaceProps) {
  const { userData, sptBalance, handleVote } = useStacks();
  const [canVote, setCanVote] = useState(false);
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [selectedSupport, setSelectedSupport] = useState<boolean | null>(null);

  const status = results?.status ?? PROPOSAL_STATUS.PENDING;
  const isActive = status === PROPOSAL_STATUS.ACTIVE;
  const hasVotingPower = sptBalance > 0;

  // Load voting eligibility and existing vote
  useEffect(() => {
    async function loadVotingData() {
      if (!userData) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const userAddress = userData.profile.stxAddress.testnet;
        const [canVoteResult, existingVote] = await Promise.all([
          canUserVote(proposal.id, userAddress),
          getUserVote(proposal.id, userAddress),
        ]);

        setCanVote(canVoteResult);
        setUserVote(existingVote);
      } catch (error) {
        console.error("Error loading voting data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadVotingData();
  }, [userData, proposal.id]);

  const handleVoteSubmit = async (support: boolean) => {
    if (!userData || !canVote || isVoting) return;

    setIsVoting(true);
    try {
      await handleVote(proposal.id, support);

      // Optimistically update the UI
      setUserVote({
        support,
        voteWeight: sptBalance,
        blockHeight: 0, // Will be updated on next refresh
      });
      setCanVote(false);

      onVoteSuccess?.();
    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setIsVoting(false);
      setSelectedSupport(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            Loading voting data...
          </span>
        </div>
      </div>
    );
  }

  // Not connected
  if (!userData) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <VoteIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Connect Your Wallet to Vote
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You need to connect your wallet to participate in governance voting.
          </p>
        </div>
      </div>
    );
  }

  // No voting power
  if (!hasVotingPower) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-warning-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Voting Power
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You need to hold SPT tokens to vote on proposals.
          </p>
          <div className="text-sm text-gray-500">
            Current balance: {formatSpt(sptBalance)} SPT
          </div>
        </div>
      </div>
    );
  }

  // Proposal not active
  if (!isActive) {
    const statusMessages = {
      [PROPOSAL_STATUS.PENDING]: {
        icon: Clock,
        title: "Voting Not Started",
        message: "This proposal is pending and voting has not started yet.",
      },
      [PROPOSAL_STATUS.SUCCEEDED]: {
        icon: CheckCircle,
        title: "Voting Completed",
        message: "This proposal has succeeded and voting is now closed.",
      },
      [PROPOSAL_STATUS.DEFEATED]: {
        icon: XCircle,
        title: "Voting Completed",
        message: "This proposal has been defeated and voting is now closed.",
      },
      [PROPOSAL_STATUS.EXECUTED]: {
        icon: CheckCircle,
        title: "Proposal Executed",
        message: "This proposal has been executed successfully.",
      },
      [PROPOSAL_STATUS.EXPIRED]: {
        icon: Clock,
        title: "Voting Expired",
        message: "The voting period for this proposal has expired.",
      },
    };

    const statusInfo =
      statusMessages[status as keyof typeof statusMessages] ||
      statusMessages[PROPOSAL_STATUS.PENDING];
    const StatusIcon = statusInfo.icon;

    return (
      <div className="card">
        <div className="text-center py-8">
          <StatusIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {statusInfo.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {statusInfo.message}
          </p>
        </div>
      </div>
    );
  }

  // Already voted
  if (userVote) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div
            className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
              userVote.support
                ? "bg-success-100 dark:bg-success-900"
                : "bg-danger-100 dark:bg-danger-900"
            }`}
          >
            {userVote.support ? (
              <CheckCircle className="w-6 h-6 text-success-600 dark:text-success-400" />
            ) : (
              <XCircle className="w-6 h-6 text-danger-600 dark:text-danger-400" />
            )}
          </div>

          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Vote Recorded
          </h3>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You voted <strong>{userVote.support ? "FOR" : "AGAINST"}</strong>{" "}
            this proposal
          </p>

          <div className="text-sm text-gray-500">
            Vote weight: {formatSpt(userVote.voteWeight)} SPT
          </div>
        </div>
      </div>
    );
  }

  // Can vote - show voting interface
  return (
    <div className="card">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center">
          <VoteIcon className="w-5 h-5 mr-2 text-primary-500" />
          Cast Your Vote
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Your vote will be weighted by your SPT token balance.
        </p>
      </div>

      {/* Voting Power Display */}
      <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <span className="text-primary-700 dark:text-primary-300 font-medium">
              Your Voting Power
            </span>
          </div>
          <span className="text-primary-900 dark:text-primary-100 font-bold text-lg">
            {formatSpt(sptBalance)} SPT
          </span>
        </div>
      </div>

      {/* Vote Options */}
      <div className="space-y-4 mb-6">
        {/* Vote For */}
        <button
          onClick={() => setSelectedSupport(true)}
          disabled={isVoting}
          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
            selectedSupport === true
              ? "border-success-500 bg-success-50 dark:bg-success-900/20"
              : "border-gray-200 dark:border-gray-600 hover:border-success-300 dark:hover:border-success-600"
          } ${isVoting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedSupport === true
                  ? "border-success-500 bg-success-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              {selectedSupport === true && (
                <CheckCircle className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900 dark:text-white">
                Vote FOR
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Support this proposal
              </div>
            </div>
          </div>
        </button>

        {/* Vote Against */}
        <button
          onClick={() => setSelectedSupport(false)}
          disabled={isVoting}
          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
            selectedSupport === false
              ? "border-danger-500 bg-danger-50 dark:bg-danger-900/20"
              : "border-gray-200 dark:border-gray-600 hover:border-danger-300 dark:hover:border-danger-600"
          } ${isVoting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedSupport === false
                  ? "border-danger-500 bg-danger-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              {selectedSupport === false && (
                <XCircle className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900 dark:text-white">
                Vote AGAINST
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Oppose this proposal
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Submit Button */}
      <button
        onClick={() =>
          selectedSupport !== null && handleVoteSubmit(selectedSupport)
        }
        disabled={selectedSupport === null || isVoting}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isVoting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Submitting Vote...</span>
          </>
        ) : (
          <>
            <VoteIcon className="w-4 h-4" />
            <span>Submit Vote</span>
          </>
        )}
      </button>

      {/* Warning Note */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <AlertCircle className="w-4 h-4 inline mr-1" />
        Votes are final and cannot be changed once submitted.
      </div>
    </div>
  );
}
