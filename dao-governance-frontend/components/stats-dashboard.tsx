"use client";

import { useEffect, useState } from "react";
import { useStacks } from "../hooks/use-stacks";
import {
  GovernanceInfo,
  getGovernanceInfo,
  getTreasuryBalance,
  getAllProposals,
  Proposal,
} from "../lib/contract-utils";
import {
  formatStx,
  formatSpt,
  formatLargeNumber,
  calculateVotingPowerPercentage,
} from "../lib/stx-utils";
import {
  TrendingUp,
  Users,
  Vote,
  DollarSign,
  BarChart3,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StatsData {
  governanceInfo: GovernanceInfo | null;
  treasuryBalance: number;
  proposals: Proposal[];
  totalProposals: number;
  activeProposals: number;
  succeededProposals: number;
  defeatedProposals: number;
  executedProposals: number;
}

const COLORS = {
  primary: "#3b82f6",
  success: "#22c55e",
  danger: "#ef4444",
  warning: "#f59e0b",
  gray: "#6b7280",
};

export function StatsDashboard() {
  const { userData, sptBalance, tokenInfo } = useStacks();
  const [stats, setStats] = useState<StatsData>({
    governanceInfo: null,
    treasuryBalance: 0,
    proposals: [],
    totalProposals: 0,
    activeProposals: 0,
    succeededProposals: 0,
    defeatedProposals: 0,
    executedProposals: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true);
      try {
        const [governanceInfo, treasuryBalance, proposals] = await Promise.all([
          getGovernanceInfo(),
          getTreasuryBalance(),
          getAllProposals(),
        ]);

        // Calculate proposal statistics
        const totalProposals = proposals.length;
        let activeProposals = 0;
        let succeededProposals = 0;
        let defeatedProposals = 0;
        let executedProposals = 0;

        proposals.forEach((proposal) => {
          // For simplicity, we'll estimate status based on current state
          // In a real app, you'd want to call get-proposal-results for each
          if (proposal.executed) {
            executedProposals++;
          } else if (
            proposal.forVotes > proposal.againstVotes &&
            proposal.forVotes + proposal.againstVotes >
              (governanceInfo?.quorumThreshold || 0)
          ) {
            succeededProposals++;
          } else if (proposal.forVotes + proposal.againstVotes > 0) {
            // Rough estimation - in real app you'd check actual status
            const currentBlock = Date.now() / 1000 / 600; // Rough block estimation
            if (currentBlock < proposal.endBlock) {
              activeProposals++;
            } else {
              defeatedProposals++;
            }
          } else {
            activeProposals++;
          }
        });

        setStats({
          governanceInfo,
          treasuryBalance,
          proposals,
          totalProposals,
          activeProposals,
          succeededProposals,
          defeatedProposals,
          executedProposals,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading governance statistics...
          </p>
        </div>
      </div>
    );
  }

  const votingPowerPercentage = tokenInfo
    ? calculateVotingPowerPercentage(sptBalance, tokenInfo.totalSupply)
    : 0;

  // Data for charts
  const proposalStatusData = [
    { name: "Active", value: stats.activeProposals, color: COLORS.primary },
    {
      name: "Succeeded",
      value: stats.succeededProposals,
      color: COLORS.success,
    },
    { name: "Defeated", value: stats.defeatedProposals, color: COLORS.danger },
    { name: "Executed", value: stats.executedProposals, color: COLORS.gray },
  ].filter((item) => item.value > 0);

  const recentProposals = stats.proposals.slice(0, 5).map((proposal) => ({
    name: `#${proposal.id}`,
    forVotes: proposal.forVotes / 1_000_000, // Convert to readable format
    againstVotes: proposal.againstVotes / 1_000_000,
  }));

  return (
    <div className="space-y-8">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Proposals */}
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <Vote className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Proposals
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalProposals}
              </p>
            </div>
          </div>
        </div>

        {/* Active Proposals */}
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-success-100 dark:bg-success-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Proposals
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.activeProposals}
              </p>
            </div>
          </div>
        </div>

        {/* Treasury Balance */}
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-warning-100 dark:bg-warning-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-warning-600 dark:text-warning-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Treasury
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatStx(stats.treasuryBalance)}
              </p>
              <p className="text-xs text-gray-500">STX</p>
            </div>
          </div>
        </div>

        {/* Your Voting Power */}
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your Voting Power
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {userData ? formatSpt(sptBalance) : "---"}
              </p>
              <p className="text-xs text-gray-500">
                {userData
                  ? `${votingPowerPercentage.toFixed(3)}%`
                  : "Connect wallet"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Governance Info */}
      {stats.governanceInfo && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Governance Parameters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Proposal Threshold
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatLargeNumber(
                  stats.governanceInfo.proposalThreshold / 1_000_000
                )}{" "}
                SPT
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Quorum Threshold
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatLargeNumber(
                  stats.governanceInfo.quorumThreshold / 1_000_000
                )}{" "}
                SPT
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Voting Period
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.governanceInfo.votingPeriod} blocks
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Execution Delay
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.governanceInfo.executionDelay} blocks
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Proposal Deposit
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatLargeNumber(
                  stats.governanceInfo.proposalDeposit / 1_000_000
                )}{" "}
                SPT
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Proposal Status Distribution */}
        {proposalStatusData.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Proposal Status Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={proposalStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {proposalStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Proposals Voting */}
        {recentProposals.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Proposals Voting (SPT)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recentProposals}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="forVotes" fill={COLORS.success} name="For" />
                  <Bar
                    dataKey="againstVotes"
                    fill={COLORS.danger}
                    name="Against"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Proposals
        </h3>

        {stats.proposals.length === 0 ? (
          <div className="text-center py-8">
            <Vote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No proposals yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.proposals.slice(0, 5).map((proposal) => (
              <div
                key={proposal.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                      #{proposal.id}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                      {proposal.title}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-success-500" />
                        <span>{formatSpt(proposal.forVotes)} For</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <XCircle className="w-4 h-4 text-danger-500" />
                        <span>{formatSpt(proposal.againstVotes)} Against</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      proposal.executed
                        ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        : "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                    }`}
                  >
                    {proposal.executed ? "Executed" : "Active"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
