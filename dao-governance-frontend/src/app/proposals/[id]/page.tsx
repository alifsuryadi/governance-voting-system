"use client";

import React, { useEffect, useState } from "react";
import { VotingInterface } from "../../../../components/voting-interface";
import {
  getProposal,
  getProposalResults,
  Proposal,
  ProposalResults,
  PROPOSAL_STATUS,
  getProposalStatusText,
  getProposalStatusColor,
} from "../../../../lib/contract-utils";
import {
  abbreviateAddress,
  explorerAddress,
  formatSpt,
  formatTimeRemaining,
  formatBlockNumber,
} from "../../../../lib/stx-utils";
import { useStacks } from "../../../../hooks/use-stacks";
import {
  ArrowLeft,
  User,
  Calendar,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Copy,
  Hash,
} from "lucide-react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type Params = Promise<{ id: string }>;

export default function ProposalDetailPage({ params }: { params: Params }) {
  const { id } = React.use(params);
  const { handleExecuteProposal } = useStacks();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [results, setResults] = useState<ProposalResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentBlock, setCurrentBlock] = useState(0);

  useEffect(() => {
    async function loadProposalData() {
      setIsLoading(true);
      try {
        const proposalId = parseInt(id);
        if (isNaN(proposalId)) {
          throw new Error("Invalid proposal ID");
        }

        const [proposalData, resultsData] = await Promise.all([
          getProposal(proposalId),
          getProposalResults(proposalId),
        ]);

        if (!proposalData) {
          throw new Error("Proposal not found");
        }

        setProposal(proposalData);
        setResults(resultsData);

        // Rough current block estimation (in a real app, you'd fetch this from the network)
        setCurrentBlock(Math.floor(Date.now() / 1000 / 600)); // ~10 min blocks
      } catch (error) {
        console.error("Error loading proposal:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProposalData();
  }, [id]);

  const handleExecute = async () => {
    if (!proposal) return;

    setIsExecuting(true);
    try {
      await handleExecuteProposal(proposal.id);
      // Refresh proposal data after execution
      setTimeout(async () => {
        const updatedProposal = await getProposal(proposal.id);
        if (updatedProposal) {
          setProposal(updatedProposal);
        }
      }, 2000);
    } catch (error) {
      console.error("Error executing proposal:", error);
    } finally {
      setIsExecuting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Loading Proposal
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we fetch the proposal details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!proposal || !results) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Proposal Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The proposal youre looking for doesnt exist or has been removed.
            </p>
            <Link href="/proposals">
              <button className="btn-primary">Back to Proposals</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const status = results.status;
  const statusText = getProposalStatusText(status);
  const statusColor = getProposalStatusColor(status);
  const totalVotes = proposal.forVotes + proposal.againstVotes;

  const voteData = [
    { name: "For", value: proposal.forVotes, color: "#22c55e" },
    { name: "Against", value: proposal.againstVotes, color: "#ef4444" },
  ].filter((item) => item.value > 0);

  const forPercentage =
    totalVotes > 0 ? (proposal.forVotes / totalVotes) * 100 : 0;
  const againstPercentage =
    totalVotes > 0 ? (proposal.againstVotes / totalVotes) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/proposals">
            <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Proposals</span>
            </button>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Proposal Header */}
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Hash className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-500 font-medium">
                      Proposal {proposal.id}
                    </span>
                  </div>
                  <span className={statusColor}>{statusText}</span>
                </div>

                {status === PROPOSAL_STATUS.SUCCEEDED && !proposal.executed && (
                  <button
                    onClick={handleExecute}
                    disabled={isExecuting}
                    className="btn-success flex items-center space-x-2"
                  >
                    {isExecuting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Executing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Execute Proposal</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {proposal.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>Proposed by</span>
                  <button
                    onClick={() => copyToClipboard(proposal.proposer)}
                    className="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    <span>{abbreviateAddress(proposal.proposer)}</span>
                    <Copy className="w-3 h-3" />
                  </button>
                  <a
                    href={explorerAddress(proposal.proposer)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Blocks {formatBlockNumber(proposal.startBlock)} -{" "}
                    {formatBlockNumber(proposal.endBlock)}
                  </span>
                </div>

                {status === PROPOSAL_STATUS.ACTIVE && (
                  <div className="flex items-center space-x-1 text-warning-600 dark:text-warning-400">
                    <Clock className="w-4 h-4" />
                    <span>
                      {formatTimeRemaining(currentBlock, proposal.endBlock)}{" "}
                      remaining
                    </span>
                  </div>
                )}
              </div>

              <div className="prose max-w-none dark:prose-invert">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {proposal.description}
                </p>
              </div>

              {/* Contract Call Info */}
              {proposal.targetContract && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Contract Execution Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Target Contract:</span>
                      <span className="ml-2 font-mono text-gray-900 dark:text-gray-100">
                        {proposal.targetContract}
                      </span>
                    </div>
                    {proposal.functionName && (
                      <div>
                        <span className="text-gray-500">Function:</span>
                        <span className="ml-2 font-mono text-gray-900 dark:text-gray-100">
                          {proposal.functionName}
                        </span>
                      </div>
                    )}
                    {proposal.functionArgs &&
                      proposal.functionArgs.length > 0 && (
                        <div>
                          <span className="text-gray-500">Arguments:</span>
                          <span className="ml-2 font-mono text-gray-900 dark:text-gray-100">
                            [{proposal.functionArgs.join(", ")}]
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>

            {/* Voting Results */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Voting Results
              </h2>

              {totalVotes === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No votes cast yet
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Vote Chart */}
                  {voteData.length > 0 && (
                    <div className="flex justify-center">
                      <div className="w-64 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={voteData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                              label={({ name, percent }) =>
                                `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`
                              }
                            >
                              {voteData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value) =>
                                formatSpt(value as number) + " SPT"
                              }
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Vote Breakdown */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* For Votes */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-success-500" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            For
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900 dark:text-white">
                            {formatSpt(proposal.forVotes)} SPT
                          </div>
                          <div className="text-sm text-gray-500">
                            {forPercentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-success-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${forPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Against Votes */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <XCircle className="w-5 h-5 text-danger-500" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            Against
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900 dark:text-white">
                            {formatSpt(proposal.againstVotes)} SPT
                          </div>
                          <div className="text-sm text-gray-500">
                            {againstPercentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-danger-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${againstPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Vote Summary */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatSpt(totalVotes)}
                      </div>
                      <div className="text-sm text-gray-500">Total Votes</div>
                    </div>

                    <div className="text-center">
                      <div
                        className={`text-2xl font-bold ${
                          results.quorumMet
                            ? "text-success-600"
                            : "text-warning-600"
                        }`}
                      >
                        {results.quorumMet ? "Met" : "Not Met"}
                      </div>
                      <div className="text-sm text-gray-500">Quorum</div>
                    </div>

                    <div className="text-center">
                      <div
                        className={`text-2xl font-bold ${
                          results.proposalPassed
                            ? "text-success-600"
                            : "text-danger-600"
                        }`}
                      >
                        {results.proposalPassed ? "Passed" : "Failed"}
                      </div>
                      <div className="text-sm text-gray-500">Result</div>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatSpt(proposal.depositAmount)}
                      </div>
                      <div className="text-sm text-gray-500">Deposit</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Voting Interface Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <VotingInterface
                proposal={proposal}
                results={results}
                onVoteSuccess={() => {
                  // Refresh proposal data after vote
                  setTimeout(async () => {
                    const [updatedProposal, updatedResults] = await Promise.all(
                      [
                        getProposal(proposal.id),
                        getProposalResults(proposal.id),
                      ]
                    );
                    if (updatedProposal) setProposal(updatedProposal);
                    if (updatedResults) setResults(updatedResults);
                  }, 2000);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
