import { StatsDashboard } from "../../components/stats-dashboard";
import { getAllProposals, getGovernanceInfo } from "../../lib/contract-utils";
import { ProposalCard } from "../../components/proposal-card";
import Link from "next/link";
import "./globals.css";
import {
  Vote,
  PlusCircle,
  TrendingUp,
  Users,
  ArrowRight,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { Proposal, GovernanceInfo } from "../../lib/contract-utils";

// Force dynamic rendering for real-time data
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch initial data server-side dengan error handling
  let proposals: Proposal[] = [];
  let governanceInfo: GovernanceInfo | null = null;
  let hasErrors = false;

  try {
    const [proposalsData, governanceInfoData] = await Promise.all([
      getAllProposals().catch((err) => {
        console.error("Error fetching proposals:", err);
        return [];
      }),
      getGovernanceInfo().catch((err) => {
        console.error("Error fetching governance info:", err);
        return null;
      }),
    ]);

    proposals = proposalsData;
    governanceInfo = governanceInfoData;

    if (!governanceInfo && proposals.length === 0) {
      hasErrors = true;
    }
  } catch (error) {
    console.error("Error loading page data:", error);
    hasErrors = true;
  }

  const recentProposals = proposals.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Vote className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              DAO Governance
              <span className="block text-blue-600 dark:text-blue-400">
                System
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Participate in decentralized governance on the Stacks blockchain.
              Create proposals, vote with your SPT tokens, and shape the future
              of our community.
            </p>

            {hasErrors && (
              <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg max-w-2xl mx-auto">
                <div className="flex items-center justify-center space-x-2 text-yellow-600 dark:text-yellow-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Contract Connection Issue</span>
                </div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                  Unable to connect to governance contracts. Please check that
                  the contracts are deployed and environment variables are
                  configured correctly.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/proposals">
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                  <Vote className="w-5 h-5" />
                  <span>View Proposals</span>
                </button>
              </Link>

              <Link href="/create-proposal">
                <button className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                  <PlusCircle className="w-5 h-5" />
                  <span>Create Proposal</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Dashboard - Only show if data is available */}
      {!hasErrors && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Governance Overview
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Real-time statistics and metrics for our DAO governance system
              </p>
            </div>

            <StatsDashboard />
          </div>
        </section>
      )}

      {/* Recent Proposals - Only show if we have proposals */}
      {recentProposals.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Recent Proposals
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Latest governance proposals from the community
                </p>
              </div>

              <Link href="/proposals">
                <button className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {recentProposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  compact
                  showVoteButton={false}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Simple steps to participate in DAO governance
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                1. Get SPT Tokens
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Acquire SPT governance tokens to participate in voting and
                proposal creation.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-success-100 dark:bg-success-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlusCircle className="w-8 h-8 text-success-600 dark:text-success-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                2. Create Proposals
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Submit governance proposals that benefit the community and
                ecosystem.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-warning-100 dark:bg-warning-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Vote className="w-8 h-8 text-warning-600 dark:text-warning-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                3. Vote on Proposals
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Cast your vote on active proposals. Your voting power equals
                your SPT balance.
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                4. Execute Changes
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Successful proposals are executed automatically, implementing
                community decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Participate?
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            Join our decentralized governance system and help shape the future
            of our community.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/governance">
              <button className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Learn More</span>
              </button>
            </Link>

            <Link href="/create-proposal">
              <button className="bg-primary-700 hover:bg-primary-800 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                <PlusCircle className="w-5 h-5" />
                <span>Create First Proposal</span>
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
