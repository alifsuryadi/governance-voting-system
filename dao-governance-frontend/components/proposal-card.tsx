"use client";

import {
  Proposal,
  ProposalResults,
  PROPOSAL_STATUS,
} from "../lib/contract-utils";
import {
  abbreviateAddress,
  formatSpt,
  formatTimeRemaining,
} from "../lib/stx-utils";
import {
  Clock,
  User,
  TrendingUp,
  TrendingDown,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

interface ProposalCardProps {
  proposal: Proposal;
  results?: ProposalResults;
  currentBlock?: number;
  showVoteButton?: boolean;
  compact?: boolean;
}

export function ProposalCard({
  proposal,
  results,
  currentBlock = 0,
  showVoteButton = true,
  compact = false,
}: ProposalCardProps) {
  const status = results?.status ?? PROPOSAL_STATUS.PENDING;
  const totalVotes =
    results?.totalVotes ?? proposal.forVotes + proposal.againstVotes;

  const statusInfo = useMemo(() => {
    switch (status) {
      case PROPOSAL_STATUS.PENDING:
        return {
          text: "Pending",
          color: "status-pending",
          icon: Clock,
        };
      case PROPOSAL_STATUS.ACTIVE:
        return {
          text: "Active",
          color: "status-active",
          icon: TrendingUp,
        };
      case PROPOSAL_STATUS.SUCCEEDED:
        return {
          text: "Succeeded",
          color: "status-succeeded",
          icon: CheckCircle,
        };
      case PROPOSAL_STATUS.DEFEATED:
        return {
          text: "Defeated",
          color: "status-defeated",
          icon: TrendingDown,
        };
      case PROPOSAL_STATUS.EXECUTED:
        return {
          text: "Executed",
          color: "status-executed",
          icon: CheckCircle,
        };
      case PROPOSAL_STATUS.EXPIRED:
        return {
          text: "Expired",
          color: "status-defeated",
          icon: Clock,
        };
      default:
        return {
          text: "Unknown",
          color: "status-pending",
          icon: Clock,
        };
    }
  }, [status]);

  const timeRemaining = useMemo(() => {
    if (status === PROPOSAL_STATUS.ACTIVE && currentBlock > 0) {
      return formatTimeRemaining(currentBlock, proposal.endBlock);
    }
    return null;
  }, [status, currentBlock, proposal.endBlock]);

  const votePercentages = useMemo(() => {
    if (totalVotes === 0) {
      return { forPercent: 0, againstPercent: 0 };
    }

    const forPercent = (proposal.forVotes / totalVotes) * 100;
    const againstPercent = (proposal.againstVotes / totalVotes) * 100;

    return { forPercent, againstPercent };
  }, [proposal.forVotes, proposal.againstVotes, totalVotes]);

  const StatusIcon = statusInfo.icon;

  if (compact) {
    return (
      <Link href={`/proposals/${proposal.id}`}>
        <div className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className={statusInfo.color}>{statusInfo.text}</span>
                <span className="text-gray-500 text-sm">#{proposal.id}</span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate mb-1">
                {proposal.title}
              </h3>

              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                {proposal.description}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{abbreviateAddress(proposal.proposer)}</span>
                </div>

                {timeRemaining && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{timeRemaining}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="ml-4">
              <StatusIcon className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-lg ${
              statusInfo.color.includes("succeeded")
                ? "bg-success-100 dark:bg-success-900"
                : statusInfo.color.includes("active")
                ? "bg-primary-100 dark:bg-primary-900"
                : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            <StatusIcon
              className={`w-5 h-5 ${
                statusInfo.color.includes("succeeded")
                  ? "text-success-600 dark:text-success-400"
                  : statusInfo.color.includes("active")
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={statusInfo.color}>{statusInfo.text}</span>
              <span className="text-gray-500 text-sm">
                Proposal #{proposal.id}
              </span>
            </div>
            {timeRemaining && (
              <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                <Clock className="w-4 h-4" />
                <span>{timeRemaining} remaining</span>
              </div>
            )}
          </div>
        </div>

        <Link href={`/proposals/${proposal.id}`}>
          <button className="btn-secondary text-sm">View Details</button>
        </Link>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {proposal.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
            {proposal.description}
          </p>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <User className="w-4 h-4" />
            <span>Proposed by {abbreviateAddress(proposal.proposer)}</span>
          </div>

          <div>
            Block {proposal.startBlock} - {proposal.endBlock}
          </div>
        </div>

        {/* Voting Results */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300">
              Voting Results
            </span>
            <span className="text-gray-500">
              {formatSpt(totalVotes)} total votes
            </span>
          </div>

          {/* For Votes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">For</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatSpt(proposal.forVotes)} SPT
                </span>
                <span className="text-gray-500">
                  ({votePercentages.forPercent.toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-success-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${votePercentages.forPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Against Votes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-danger-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  Against
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatSpt(proposal.againstVotes)} SPT
                </span>
                <span className="text-gray-500">
                  ({votePercentages.againstPercent.toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-danger-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${votePercentages.againstPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Quorum Status */}
        {results && (
          <div className="flex items-center justify-between text-sm p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-gray-600 dark:text-gray-400">
              Quorum Status
            </span>
            <span
              className={`font-medium ${
                results.quorumMet
                  ? "text-success-600 dark:text-success-400"
                  : "text-warning-600 dark:text-warning-400"
              }`}
            >
              {results.quorumMet ? "Met" : "Not Met"}
            </span>
          </div>
        )}

        {/* Vote Buttons */}
        {showVoteButton && status === PROPOSAL_STATUS.ACTIVE && (
          <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
            <Link
              href={`/proposals/${proposal.id}/vote?support=true`}
              className="flex-1"
            >
              <button className="w-full btn-success">Vote For</button>
            </Link>
            <Link
              href={`/proposals/${proposal.id}/vote?support=false`}
              className="flex-1"
            >
              <button className="w-full btn-danger">Vote Against</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
