import { describe, it, expect, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

describe("DAO Governance System Tests", () => {
  let accounts: Map<string, string>;

  beforeEach(() => {
    accounts = simnet.getAccounts();
  });

  describe("Governance Token Tests", () => {
    it("Can initialize governance token", () => {
      const deployer = accounts.get("deployer")!;

      const result = simnet.callPublicFn(
        "governance-token",
        "initialize",
        [],
        deployer
      );

      expect(result.result).toEqual(Cl.ok(Cl.bool(true)));
    });

    it("Can distribute tokens to users", () => {
      const deployer = accounts.get("deployer")!;
      const user1 = accounts.get("wallet_1")!;
      const user2 = accounts.get("wallet_2")!;

      // Initialize first
      simnet.callPublicFn("governance-token", "initialize", [], deployer);

      // Distribute tokens
      const recipients = Cl.list([
        Cl.tuple({
          address: Cl.standardPrincipal(user1),
          amount: Cl.uint(50000000000), // 50,000 SPT
        }),
        Cl.tuple({
          address: Cl.standardPrincipal(user2),
          amount: Cl.uint(30000000000), // 30,000 SPT
        }),
      ]);

      const result = simnet.callPublicFn(
        "governance-token",
        "distribute-tokens",
        [recipients],
        deployer
      );

      expect(result.result).toBeOk(Cl.bool(true));

      // Verify balances
      const user1Balance = simnet.callReadOnlyFn(
        "governance-token",
        "get-balance",
        [Cl.standardPrincipal(user1)],
        user1
      );

      expect(user1Balance.result).toEqual(Cl.ok(Cl.uint(50000000000)));
    });
  });

  describe("Proposal Creation Tests", () => {
    beforeEach(() => {
      const deployer = accounts.get("deployer")!;
      const user1 = accounts.get("wallet_1")!;

      // Setup tokens
      simnet.callPublicFn("governance-token", "initialize", [], deployer);

      const recipients = Cl.list([
        Cl.tuple({
          address: Cl.standardPrincipal(user1),
          amount: Cl.uint(50000000000), // 50,000 SPT (meets threshold)
        }),
      ]);

      simnet.callPublicFn(
        "governance-token",
        "distribute-tokens",
        [recipients],
        deployer
      );
    });

    it("Can create proposal dengan sufficient tokens", () => {
      const user1 = accounts.get("wallet_1")!;

      const result = simnet.callPublicFn(
        "dao-governance",
        "create-proposal",
        [
          Cl.stringAscii("Treasury Funding"),
          Cl.stringAscii("Allocate 10,000 STX for development funding"),
          Cl.none(),
          Cl.none(),
          Cl.none(),
        ],
        user1
      );

      expect(result.result).toEqual(Cl.ok(Cl.uint(1)));
    });

    it("Cannot create proposal dengan insufficient tokens", () => {
      const user2 = accounts.get("wallet_2")!; // No tokens

      const result = simnet.callPublicFn(
        "dao-governance",
        "create-proposal",
        [
          Cl.stringAscii("Invalid Proposal"),
          Cl.stringAscii("This should fail"),
          Cl.none(),
          Cl.none(),
          Cl.none(),
        ],
        user2
      );

      expect(result.result).toEqual(Cl.error(Cl.uint(2000))); // ERR_INSUFFICIENT_VOTING_POWER
    });
  });

  describe("Voting System Tests", () => {
    let proposalId: number;

    beforeEach(() => {
      const deployer = accounts.get("deployer")!;
      const user1 = accounts.get("wallet_1")!;
      const user2 = accounts.get("wallet_2")!;

      // Setup tokens dan proposal
      simnet.callPublicFn("governance-token", "initialize", [], deployer);

      const recipients = Cl.list([
        Cl.tuple({
          address: Cl.standardPrincipal(user1),
          amount: Cl.uint(60000000000), // 60,000 SPT
        }),
        Cl.tuple({
          address: Cl.standardPrincipal(user2),
          amount: Cl.uint(50000000000), // 50,000 SPT
        }),
      ]);

      simnet.callPublicFn(
        "governance-token",
        "distribute-tokens",
        [recipients],
        deployer
      );

      // Create proposal
      const proposalResult = simnet.callPublicFn(
        "dao-governance",
        "create-proposal",
        [
          Cl.stringAscii("Test Proposal"),
          Cl.stringAscii("A test proposal for voting"),
          Cl.none(),
          Cl.none(),
          Cl.none(),
        ],
        user1
      );

      proposalId = 1;

      // Mine blocks untuk activate voting
      simnet.mineEmptyBlocks(15);
    });

    it("Can vote on active proposal", () => {
      const user2 = accounts.get("wallet_2")!;

      const result = simnet.callPublicFn(
        "dao-governance",
        "vote",
        [Cl.uint(proposalId), Cl.bool(true)], // Vote FOR
        user2
      );

      expect(result.result).toEqual(Cl.ok(Cl.bool(true)));
    });

    it("Cannot vote twice on same proposal", () => {
      const user2 = accounts.get("wallet_2")!;

      // First vote
      simnet.callPublicFn(
        "dao-governance",
        "vote",
        [Cl.uint(proposalId), Cl.bool(true)],
        user2
      );

      // Second vote should fail
      const result = simnet.callPublicFn(
        "dao-governance",
        "vote",
        [Cl.uint(proposalId), Cl.bool(false)],
        user2
      );

      expect(result.result).toEqual(Cl.error(Cl.uint(2003))); // ERR_ALREADY_VOTED
    });

    it("Proposal passes dengan sufficient support", () => {
      const user1 = accounts.get("wallet_1")!;
      const user2 = accounts.get("wallet_2")!;

      // Both users vote FOR (110,000 SPT total > 100,000 quorum)
      simnet.callPublicFn(
        "dao-governance",
        "vote",
        [Cl.uint(proposalId), Cl.bool(true)],
        user1
      );
      simnet.callPublicFn(
        "dao-governance",
        "vote",
        [Cl.uint(proposalId), Cl.bool(true)],
        user2
      );

      // End voting period
      simnet.mineEmptyBlocks(1450);

      // Check proposal status
      const statusResult = simnet.callReadOnlyFn(
        "dao-governance",
        "get-proposal-status",
        [Cl.uint(proposalId)],
        user1
      );

      expect(statusResult.result).toEqual(Cl.uint(2)); // STATUS_SUCCEEDED
    });
  });

  describe("Proposal Execution Tests", () => {
    it("Can execute successful proposal after delay", () => {
      const deployer = accounts.get("deployer")!;
      const user1 = accounts.get("wallet_1")!;
      const user2 = accounts.get("wallet_2")!;

      // Complete setup dan voting
      simnet.callPublicFn("governance-token", "initialize", [], deployer);

      const recipients = Cl.list([
        Cl.tuple({
          address: Cl.standardPrincipal(user1),
          amount: Cl.uint(60000000000),
        }),
        Cl.tuple({
          address: Cl.standardPrincipal(user2),
          amount: Cl.uint(50000000000),
        }),
      ]);

      simnet.callPublicFn(
        "governance-token",
        "distribute-tokens",
        [recipients],
        deployer
      );

      // Create proposal
      simnet.callPublicFn(
        "dao-governance",
        "create-proposal",
        [
          Cl.stringAscii("Executable Proposal"),
          Cl.stringAscii("Test execution"),
          Cl.none(),
          Cl.none(),
          Cl.none(),
        ],
        user1
      );

      // Activate voting
      simnet.mineEmptyBlocks(15);

      // Vote
      simnet.callPublicFn(
        "dao-governance",
        "vote",
        [Cl.uint(1), Cl.bool(true)],
        user1
      );
      simnet.callPublicFn(
        "dao-governance",
        "vote",
        [Cl.uint(1), Cl.bool(true)],
        user2
      );

      // End voting period
      simnet.mineEmptyBlocks(1450);

      // Wait execution delay
      simnet.mineEmptyBlocks(150);

      // Execute proposal
      const result = simnet.callPublicFn(
        "dao-governance",
        "execute-proposal",
        [Cl.uint(1)],
        user1
      );

      expect(result.result).toEqual(Cl.ok(Cl.bool(true)));
    });
  });
});
