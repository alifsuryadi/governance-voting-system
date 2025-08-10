"use client";

import { useEffect, useState } from "react";
import { useStacks } from "../../../hooks/use-stacks";
import {
  getGovernanceInfo,
  getTokenInfo,
  GovernanceInfo,
  GovernanceToken,
} from "../../../lib/contract-utils";
import {
  formatSpt,
  parseSpt,
  isValidStacksAddress,
  calculateVotingPowerPercentage,
} from "../../../lib/stx-utils";
import {
  Users,
  Vote,
  Clock,
  Shield,
  DollarSign,
  Send,
  Info,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  BarChart3,
  Coins,
} from "lucide-react";
import Link from "next/link";

export default function GovernancePage() {
  const { userData, sptBalance, handleTransferTokens, connectWallet } =
    useStacks();

  const [governanceInfo, setGovernanceInfo] = useState<GovernanceInfo | null>(
    null
  );
  const [tokenInfo, setTokenInfo] = useState<GovernanceToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Transfer form state
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferRecipient, setTransferRecipient] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferErrors, setTransferErrors] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    async function loadGovernanceData() {
      setIsLoading(true);
      try {
        const [govInfo, tokInfo] = await Promise.all([
          getGovernanceInfo(),
          getTokenInfo(),
        ]);

        setGovernanceInfo(govInfo);
        setTokenInfo(tokInfo);
      } catch (error) {
        console.error("Error loading governance data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadGovernanceData();
  }, []);

  const validateTransfer = () => {
    const errors: Record<string, string> = {};

    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      errors.amount = "Please enter a valid amount";
    } else if (parseFloat(transferAmount) > sptBalance / 1_000_000) {
      errors.amount = "Insufficient balance";
    }

    if (!transferRecipient.trim()) {
      errors.recipient = "Please enter a recipient address";
    } else if (!isValidStacksAddress(transferRecipient)) {
      errors.recipient = "Invalid Stacks address";
    }

    setTransferErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateTransfer() || !userData) return;

    setIsTransferring(true);
    try {
      const amount = parseSpt(parseFloat(transferAmount));
      await handleTransferTokens(amount, transferRecipient.trim());

      // Reset form on success
      setTransferAmount("");
      setTransferRecipient("");
      setShowTransferForm(false);
      setTransferErrors({});
    } catch (error) {
      console.error("Error transferring tokens:", error);
    } finally {
      setIsTransferring(false);
    }
  };

  const votingPowerPercentage = tokenInfo
    ? calculateVotingPowerPercentage(sptBalance, tokenInfo.totalSupply)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Loading Governance Information
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we fetch the governance system details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Governance System
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Learn how our decentralized governance works and manage your SPT
            tokens
          </p>
        </div>

        {/* User Token Info */}
        {userData && tokenInfo && (
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Coins className="w-5 h-5 mr-2 text-primary-500" />
              Your Token Information
            </h2>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  {formatSpt(sptBalance)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Your SPT Balance
                </div>
              </div>

              <div className="text-center p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
                <div className="text-3xl font-bold text-success-600 dark:text-success-400 mb-2">
                  {votingPowerPercentage.toFixed(3)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Voting Power
                </div>
              </div>

              <div className="text-center p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
                <div className="text-3xl font-bold text-warning-600 dark:text-warning-400 mb-2">
                  {formatSpt(tokenInfo.totalSupply)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Supply
                </div>
              </div>
            </div>

            {/* Transfer Tokens */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              {!showTransferForm ? (
                <button
                  onClick={() => setShowTransferForm(true)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Transfer SPT Tokens</span>
                </button>
              ) : (
                <form onSubmit={handleTransfer} className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Transfer SPT Tokens
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Amount (SPT)
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        max={sptBalance / 1_000_000}
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        className={`input-field ${
                          transferErrors.amount ? "border-red-500" : ""
                        }`}
                        placeholder="0.0"
                      />
                      {transferErrors.amount && (
                        <span className="text-red-500 text-sm">
                          {transferErrors.amount}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Recipient Address
                      </label>
                      <input
                        type="text"
                        value={transferRecipient}
                        onChange={(e) => setTransferRecipient(e.target.value)}
                        className={`input-field ${
                          transferErrors.recipient ? "border-red-500" : ""
                        }`}
                        placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                      />
                      {transferErrors.recipient && (
                        <span className="text-red-500 text-sm">
                          {transferErrors.recipient}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={isTransferring}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isTransferring ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Transferring...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Transfer</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowTransferForm(false);
                        setTransferAmount("");
                        setTransferRecipient("");
                        setTransferErrors({});
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Governance Parameters */}
        {governanceInfo && (
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-primary-500" />
              Governance Parameters
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Proposal Threshold
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {formatSpt(governanceInfo.proposalThreshold)} SPT
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-10 h-10 bg-success-100 dark:bg-success-900 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-success-600 dark:text-success-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Quorum Threshold
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {formatSpt(governanceInfo.quorumThreshold)} SPT
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-10 h-10 bg-warning-100 dark:bg-warning-900 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Voting Period
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {governanceInfo.votingPeriod} blocks
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Execution Delay
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {governanceInfo.executionDelay} blocks
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Proposal Deposit
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {formatSpt(governanceInfo.proposalDeposit)} SPT
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-primary-500" />
            How Governance Works
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                    1
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    Proposal Creation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Anyone with sufficient SPT tokens can create a governance
                    proposal by depositing the required amount.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                    2
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    Voting Period
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Token holders can vote FOR or AGAINST proposals during the
                    voting period. Voting power equals token balance.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                    3
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    Execution
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Approved proposals can be executed after the execution delay
                    period, implementing the communitys decision.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-2">
                  <Info className="w-4 h-4" />
                  <span className="font-medium">Quorum Requirement</span>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Proposals need a minimum number of votes (quorum) to be valid,
                  ensuring broad community participation.
                </p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Token-Weighted Voting</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Your voting power is proportional to your SPT token balance,
                  giving more influence to larger stakeholders.
                </p>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">Execution Delay</span>
                </div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Theres a delay between proposal approval and execution,
                  providing time for final review and preparation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Participation Guide */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Get Involved
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">
                For Voters
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                  <span>Acquire SPT tokens to gain voting power</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                  <span>Review proposals carefully before voting</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                  <span>Participate in community discussions</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                  <span>Vote on every proposal you care about</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">
                For Proposers
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                  <span>Ensure you meet the minimum token requirement</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                  <span>Write clear, detailed proposal descriptions</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                  <span>Engage with the community for feedback</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                  <span>Be prepared to deposit the required amount</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            {!userData ? (
              <button
                onClick={connectWallet}
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <span>Connect Wallet to Participate</span>
              </button>
            ) : (
              <>
                <Link href="/proposals">
                  <button className="btn-primary flex items-center space-x-2">
                    <Vote className="w-4 h-4" />
                    <span>View Proposals</span>
                  </button>
                </Link>

                <Link href="/create-proposal">
                  <button className="btn-secondary flex items-center space-x-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Create Proposal</span>
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
