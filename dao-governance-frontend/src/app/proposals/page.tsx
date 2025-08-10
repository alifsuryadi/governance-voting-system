"use client";

import { useEffect, useState } from "react";
import { ProposalCard } from "../../../components/proposal-card";
import {
  getAllProposals,
  getProposalResults,
  Proposal,
  ProposalResults,
  PROPOSAL_STATUS,
} from "../../../lib/contract-utils";
import {
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Loader2,
  Vote,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";

type FilterType = "all" | "active" | "succeeded" | "defeated" | "executed";
type SortType = "newest" | "oldest" | "most-votes";

interface ProposalWithResults extends Proposal {
  results?: ProposalResults;
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<ProposalWithResults[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<
    ProposalWithResults[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("newest");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Load proposals
  useEffect(() => {
    async function loadProposals() {
      setIsLoading(true);
      try {
        const proposalsData = await getAllProposals();

        // Load results for each proposal
        const proposalsWithResults = await Promise.all(
          proposalsData.map(async (proposal) => {
            try {
              const results = await getProposalResults(proposal.id);
              return { ...proposal, results: results || undefined };
            } catch (error) {
              console.error(
                `Error loading results for proposal ${proposal.id}:`,
                error
              );
              return proposal;
            }
          })
        );

        setProposals(proposalsWithResults);
      } catch (error) {
        console.error("Error loading proposals:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProposals();
  }, []);

  // Filter and sort proposals
  useEffect(() => {
    let filtered = [...proposals];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (proposal) =>
          proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          proposal.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          proposal.proposer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filter !== "all") {
      filtered = filtered.filter((proposal) => {
        const status = proposal.results?.status ?? PROPOSAL_STATUS.PENDING;

        switch (filter) {
          case "active":
            return status === PROPOSAL_STATUS.ACTIVE;
          case "succeeded":
            return status === PROPOSAL_STATUS.SUCCEEDED;
          case "defeated":
            return (
              status === PROPOSAL_STATUS.DEFEATED ||
              status === PROPOSAL_STATUS.EXPIRED
            );
          case "executed":
            return status === PROPOSAL_STATUS.EXECUTED;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "newest":
          comparison = b.id - a.id;
          break;
        case "oldest":
          comparison = a.id - b.id;
          break;
        case "most-votes":
          const aTotalVotes = a.forVotes + a.againstVotes;
          const bTotalVotes = b.forVotes + b.againstVotes;
          comparison = bTotalVotes - aTotalVotes;
          break;
        default:
          comparison = b.id - a.id;
      }

      return sortOrder === "asc" ? -comparison : comparison;
    });

    setFilteredProposals(filtered);
  }, [proposals, searchTerm, filter, sortBy, sortOrder]);

  const filterOptions = [
    { value: "all", label: "All Proposals", count: proposals.length },
    {
      value: "active",
      label: "Active",
      count: proposals.filter(
        (p) => p.results?.status === PROPOSAL_STATUS.ACTIVE
      ).length,
    },
    {
      value: "succeeded",
      label: "Succeeded",
      count: proposals.filter(
        (p) => p.results?.status === PROPOSAL_STATUS.SUCCEEDED
      ).length,
    },
    {
      value: "defeated",
      label: "Defeated",
      count: proposals.filter(
        (p) =>
          p.results?.status === PROPOSAL_STATUS.DEFEATED ||
          p.results?.status === PROPOSAL_STATUS.EXPIRED
      ).length,
    },
    {
      value: "executed",
      label: "Executed",
      count: proposals.filter(
        (p) => p.results?.status === PROPOSAL_STATUS.EXECUTED
      ).length,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Loading Proposals
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we fetch the latest governance proposals...
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
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Governance Proposals
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Browse and vote on community governance proposals
              </p>
            </div>

            <div className="mt-4 sm:mt-0">
              <Link href="/create-proposal">
                <button className="btn-primary flex items-center space-x-2">
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Proposal</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search proposals by title, description, or proposer..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Tabs and Sort */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value as FilterType)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === option.value
                      ? "bg-primary-500 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {option.label} ({option.count})
                </button>
              ))}
            </div>

            {/* Sort Controls */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="input-field text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most-votes">Most Votes</option>
              </select>

              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {sortOrder === "asc" ? (
                  <SortAsc className="w-4 h-4 text-gray-500" />
                ) : (
                  <SortDesc className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredProposals.length} of {proposals.length} proposals
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        </div>

        {/* Proposals Grid */}
        {filteredProposals.length === 0 ? (
          <div className="text-center py-16">
            <Vote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm || filter !== "all"
                ? "No Matching Proposals"
                : "No Proposals Yet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || filter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Be the first to create a governance proposal for the community."}
            </p>

            {!searchTerm && filter === "all" && (
              <Link href="/create-proposal">
                <button className="btn-primary">Create First Proposal</button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredProposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                results={proposal.results}
                compact
                showVoteButton
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
