"use client";

import { useState, useEffect } from "react";
import { useStacks } from "../../../hooks/use-stacks";
import { getGovernanceInfo, GovernanceInfo } from "../../../lib/contract-utils";
import {
  formatSpt,
  parseSpt,
  isValidStacksAddress,
} from "../../../lib/stx-utils";
import {
  PlusCircle,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
  ArrowLeft,
  Code,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

export default function CreateProposalPage() {
  const { userData, sptBalance, handleCreateProposal, connectWallet } =
    useStacks();

  const [governanceInfo, setGovernanceInfo] = useState<GovernanceInfo | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [includeContractCall, setIncludeContractCall] = useState(false);
  const [targetContract, setTargetContract] = useState("");
  const [functionName, setFunctionName] = useState("");
  const [functionArgs, setFunctionArgs] = useState("");

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadGovernanceInfo() {
      setIsLoading(true);
      try {
        const info = await getGovernanceInfo();
        setGovernanceInfo(info);
      } catch (error) {
        console.error("Error loading governance info:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadGovernanceInfo();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Title validation
    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length > 100) {
      newErrors.title = "Title must be 100 characters or less";
    }

    // Description validation
    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.length > 500) {
      newErrors.description = "Description must be 500 characters or less";
    }

    // Contract call validation
    if (includeContractCall) {
      if (!targetContract.trim()) {
        newErrors.targetContract = "Target contract is required";
      } else if (!isValidStacksAddress(targetContract)) {
        newErrors.targetContract = "Invalid Stacks contract address";
      }

      if (!functionName.trim()) {
        newErrors.functionName = "Function name is required";
      } else if (functionName.length > 50) {
        newErrors.functionName = "Function name must be 50 characters or less";
      }

      if (functionArgs.trim()) {
        try {
          const args = JSON.parse(`[${functionArgs}]`);
          if (
            !Array.isArray(args) ||
            !args.every((arg) => typeof arg === "number")
          ) {
            newErrors.functionArgs =
              "Arguments must be a comma-separated list of numbers";
          }
        } catch {
          newErrors.functionArgs =
            "Invalid argument format. Use comma-separated numbers.";
        }
      }
    }

    // Governance requirements validation
    if (userData && governanceInfo) {
      if (sptBalance < governanceInfo.proposalThreshold) {
        newErrors.balance = `Insufficient SPT balance. You need at least ${formatSpt(
          governanceInfo.proposalThreshold
        )} SPT to create a proposal.`;
      }

      if (sptBalance < governanceInfo.proposalDeposit) {
        newErrors.deposit = `Insufficient SPT balance for deposit. You need at least ${formatSpt(
          governanceInfo.proposalDeposit
        )} SPT as deposit.`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!userData) {
      connectWallet();
      return;
    }

    setIsSubmitting(true);
    try {
      let parsedArgs: number[] | undefined;
      if (includeContractCall && functionArgs.trim()) {
        parsedArgs = JSON.parse(`[${functionArgs}]`);
      }

      await handleCreateProposal(
        title.trim(),
        description.trim(),
        includeContractCall ? targetContract.trim() : undefined,
        includeContractCall ? functionName.trim() : undefined,
        parsedArgs
      );

      // Reset form on success
      setTitle("");
      setDescription("");
      setTargetContract("");
      setFunctionName("");
      setFunctionArgs("");
      setIncludeContractCall(false);
      setErrors({});

      // Could redirect to proposals page or show success message
      // For now, just show success in form
    } catch (error) {
      console.error("Error creating proposal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Loading Governance Info
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we fetch the governance parameters...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const canCreateProposal =
    userData &&
    governanceInfo &&
    sptBalance >= governanceInfo.proposalThreshold &&
    sptBalance >= governanceInfo.proposalDeposit;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/proposals">
            <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Proposals</span>
            </button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create New Proposal
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Submit a governance proposal for the community to vote on.
          </p>
        </div>

        {/* Governance Requirements */}
        {governanceInfo && (
          <div className="card mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2 text-primary-500" />
              Governance Requirements
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Minimum Token Balance:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatSpt(governanceInfo.proposalThreshold)} SPT
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Required Deposit:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatSpt(governanceInfo.proposalDeposit)} SPT
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Voting Period:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {governanceInfo.votingPeriod} blocks
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Your SPT Balance:
                </span>
                <span
                  className={`font-medium ${
                    canCreateProposal ? "text-success-600" : "text-warning-600"
                  }`}
                >
                  {userData ? formatSpt(sptBalance) : "---"} SPT
                </span>
              </div>
            </div>

            {/* Status Messages */}
            {userData && governanceInfo && (
              <div className="mt-4">
                {canCreateProposal ? (
                  <div className="flex items-center space-x-2 text-success-600 dark:text-success-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">
                      You meet all requirements to create a proposal
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-warning-600 dark:text-warning-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">
                      You need more SPT tokens to create a proposal
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Main Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Proposal Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`input-field ${
                  errors.title ? "border-red-500" : ""
                }`}
                placeholder="Enter a clear, concise title for your proposal"
                maxLength={100}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.title && (
                  <span className="text-red-500 text-sm">{errors.title}</span>
                )}
                <span className="text-gray-500 text-sm ml-auto">
                  {title.length}/100 characters
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Proposal Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className={`input-field ${
                  errors.description ? "border-red-500" : ""
                }`}
                placeholder="Provide a detailed description of your proposal, including rationale, implementation details, and expected outcomes..."
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description && (
                  <span className="text-red-500 text-sm">
                    {errors.description}
                  </span>
                )}
                <span className="text-gray-500 text-sm ml-auto">
                  {description.length}/500 characters
                </span>
              </div>
            </div>

            {/* Contract Call Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="includeContractCall"
                  checked={includeContractCall}
                  onChange={(e) => setIncludeContractCall(e.target.checked)}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="includeContractCall"
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  <Code className="w-4 h-4" />
                  <span>Include Contract Execution</span>
                </label>
              </div>

              {includeContractCall && (
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Optional: If your proposal requires executing a smart
                    contract function upon approval, specify the contract
                    details below.
                  </p>

                  {/* Target Contract */}
                  <div>
                    <label
                      htmlFor="targetContract"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Target Contract Address
                    </label>
                    <input
                      type="text"
                      id="targetContract"
                      value={targetContract}
                      onChange={(e) => setTargetContract(e.target.value)}
                      className={`input-field ${
                        errors.targetContract ? "border-red-500" : ""
                      }`}
                      placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.contract-name"
                    />
                    {errors.targetContract && (
                      <span className="text-red-500 text-sm">
                        {errors.targetContract}
                      </span>
                    )}
                  </div>

                  {/* Function Name */}
                  <div>
                    <label
                      htmlFor="functionName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Function Name
                    </label>
                    <input
                      type="text"
                      id="functionName"
                      value={functionName}
                      onChange={(e) => setFunctionName(e.target.value)}
                      className={`input-field ${
                        errors.functionName ? "border-red-500" : ""
                      }`}
                      placeholder="function-name"
                      maxLength={50}
                    />
                    {errors.functionName && (
                      <span className="text-red-500 text-sm">
                        {errors.functionName}
                      </span>
                    )}
                  </div>

                  {/* Function Arguments */}
                  <div>
                    <label
                      htmlFor="functionArgs"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Function Arguments (Optional)
                    </label>
                    <input
                      type="text"
                      id="functionArgs"
                      value={functionArgs}
                      onChange={(e) => setFunctionArgs(e.target.value)}
                      className={`input-field ${
                        errors.functionArgs ? "border-red-500" : ""
                      }`}
                      placeholder="1000000, 42, 123 (comma-separated numbers)"
                    />
                    {errors.functionArgs && (
                      <span className="text-red-500 text-sm">
                        {errors.functionArgs}
                      </span>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Enter comma-separated numbers only. Leave empty if the
                      function takes no arguments.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Error Messages */}
            {(errors.balance || errors.deposit) && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">Cannot Create Proposal</span>
                </div>
                <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.balance && <div>{errors.balance}</div>}
                  {errors.deposit && <div>{errors.deposit}</div>}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Proposal deposit:{" "}
                {governanceInfo
                  ? formatSpt(governanceInfo.proposalDeposit)
                  : "---"}{" "}
                SPT
              </div>

              {!userData ? (
                <button
                  type="button"
                  onClick={connectWallet}
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>Connect Wallet</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!canCreateProposal || isSubmitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>Create Proposal</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="card mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Proposal Guidelines
          </h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
              <span>Clearly describe the problem your proposal solves</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
              <span>Explain the implementation plan and timeline</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
              <span>Consider potential risks and mitigation strategies</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
              <span>Engage with the community before submitting</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
