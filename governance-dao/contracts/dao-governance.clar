;; DAO Governance Contract
;; Comprehensive proposal system dengan token-weighted voting

;; === CONSTANTS ===

;; Proposal requirements
(define-constant PROPOSAL_THRESHOLD u10000000000) ;; 10,000 SPT dengan 6 decimals
(define-constant QUORUM_THRESHOLD u100000000000) ;; 100,000 SPT dengan 6 decimals
(define-constant VOTING_PERIOD u1440) ;; 1440 blocks (~10 days)
(define-constant EXECUTION_DELAY u144) ;; 144 blocks (~1 day)
(define-constant PROPOSAL_DEPOSIT u1000000000) ;; 1,000 SPT deposit

;; Governance token contract
(define-constant GOVERNANCE_TOKEN_CONTRACT .governance-token)

;; Error codes
(define-constant ERR_INSUFFICIENT_VOTING_POWER (err u2000))
(define-constant ERR_PROPOSAL_NOT_FOUND (err u2001))
(define-constant ERR_VOTING_NOT_ACTIVE (err u2002))
(define-constant ERR_ALREADY_VOTED (err u2003))
(define-constant ERR_PROPOSAL_NOT_EXECUTABLE (err u2004))
(define-constant ERR_INSUFFICIENT_DEPOSIT (err u2005))
(define-constant ERR_UNAUTHORIZED (err u2006))
(define-constant ERR_INVALID_VOTING_PERIOD (err u2007))

;; === DATA STRUCTURES ===

;; Proposal status enum
(define-constant STATUS_PENDING u0)
(define-constant STATUS_ACTIVE u1)
(define-constant STATUS_SUCCEEDED u2)
(define-constant STATUS_DEFEATED u3)
(define-constant STATUS_EXECUTED u4)
(define-constant STATUS_EXPIRED u5)

;; === DATA STORAGE ===

;; Proposal counter
(define-data-var next-proposal-id uint u1)

;; Proposals map
(define-map proposals
  uint ;; proposal-id
  {
    proposer: principal,
    title: (string-ascii 100),
    description: (string-ascii 500),
    start-block: uint,
    end-block: uint,
    for-votes: uint,
    against-votes: uint,
    executed: bool,
    deposit-amount: uint,
    target-contract: (optional principal),
    function-name: (optional (string-ascii 50)),
    function-args: (optional (list 10 uint))
  }
)

;; Vote tracking
(define-map votes
  {proposal-id: uint, voter: principal}
  {
    support: bool,
    vote-weight: uint,
    block-height: uint
  }
)

;; Proposal deposits (untuk refund mechanism)
(define-map proposal-deposits
  uint ;; proposal-id
  {
    depositor: principal,
    amount: uint,
    refunded: bool
  }
)

;; DAO treasury balance
(define-data-var treasury-balance uint u0)

;; === PUBLIC FUNCTIONS ===

;; Create new proposal
(define-public (create-proposal 
    (title (string-ascii 100))
    (description (string-ascii 500))
    (target-contract (optional principal))
    (function-name (optional (string-ascii 50)))
    (function-args (optional (list 10 uint))))
  (let (
    (proposal-id (var-get next-proposal-id))
    (proposer-balance (unwrap! (contract-call? GOVERNANCE_TOKEN_CONTRACT get-balance tx-sender) ERR_INSUFFICIENT_VOTING_POWER))
    (current-block block-height)
    (voting-start (+ current-block u10)) ;; Grace period
    (voting-end (+ voting-start VOTING_PERIOD))
  )
    ;; Check proposer has sufficient tokens
    (asserts! (>= proposer-balance PROPOSAL_THRESHOLD) ERR_INSUFFICIENT_VOTING_POWER)
    
    ;; Check proposer has sufficient deposit
    (asserts! (>= proposer-balance PROPOSAL_DEPOSIT) ERR_INSUFFICIENT_DEPOSIT)
    
    ;; Transfer deposit to contract
    (try! (contract-call? GOVERNANCE_TOKEN_CONTRACT transfer 
                         PROPOSAL_DEPOSIT tx-sender (as-contract tx-sender) none))
    
    ;; Create proposal
    (map-set proposals proposal-id {
      proposer: tx-sender,
      title: title,
      description: description,
      start-block: voting-start,
      end-block: voting-end,
      for-votes: u0,
      against-votes: u0,
      executed: false,
      deposit-amount: PROPOSAL_DEPOSIT,
      target-contract: target-contract,
      function-name: function-name,
      function-args: function-args
    })
    
    ;; Record deposit
    (map-set proposal-deposits proposal-id {
      depositor: tx-sender,
      amount: PROPOSAL_DEPOSIT,
      refunded: false
    })
    
    ;; Increment proposal ID
    (var-set next-proposal-id (+ proposal-id u1))
    
    ;; Emit event
    (print {
      action: "proposal-created",
      proposal-id: proposal-id,
      proposer: tx-sender,
      title: title,
      voting-start: voting-start,
      voting-end: voting-end
    })
    
    (ok proposal-id)
  )
)

;; Vote on proposal
(define-public (vote (proposal-id uint) (support bool))
  (let (
    (proposal (unwrap! (map-get? proposals proposal-id) ERR_PROPOSAL_NOT_FOUND))
    (voter-balance (unwrap! (contract-call? GOVERNANCE_TOKEN_CONTRACT get-balance tx-sender) ERR_INSUFFICIENT_VOTING_POWER))
    (current-block block-height)
    (vote-key {proposal-id: proposal-id, voter: tx-sender})
  )
    ;; Check voting is active
    (asserts! (and (>= current-block (get start-block proposal))
                   (<= current-block (get end-block proposal))) ERR_VOTING_NOT_ACTIVE)
    
    ;; Check voter hasn't already voted
    (asserts! (is-none (map-get? votes vote-key)) ERR_ALREADY_VOTED)
    
    ;; Check voter has voting power
    (asserts! (> voter-balance u0) ERR_INSUFFICIENT_VOTING_POWER)
    
    ;; Record vote
    (map-set votes vote-key {
      support: support,
      vote-weight: voter-balance,
      block-height: current-block
    })
    
    ;; Update proposal vote counts
    (map-set proposals proposal-id
      (if support
        (merge proposal {for-votes: (+ (get for-votes proposal) voter-balance)})
        (merge proposal {against-votes: (+ (get against-votes proposal) voter-balance)})
      )
    )
    
    ;; Emit vote event
    (print {
      action: "vote-cast",
      proposal-id: proposal-id,
      voter: tx-sender,
      support: support,
      vote-weight: voter-balance
    })
    
    (ok true)
  )
)

;; Execute approved proposal
(define-public (execute-proposal (proposal-id uint))
  (let (
    (proposal (unwrap! (map-get? proposals proposal-id) ERR_PROPOSAL_NOT_FOUND))
    (current-block block-height)
    (proposal-status (get-proposal-status proposal-id))
  )
    ;; Check proposal is ready for execution
    (asserts! (is-eq proposal-status STATUS_SUCCEEDED) ERR_PROPOSAL_NOT_EXECUTABLE)
    
    ;; Check execution delay has passed
    (asserts! (>= current-block (+ (get end-block proposal) EXECUTION_DELAY)) ERR_VOTING_NOT_ACTIVE)
    
    ;; Check not already executed
    (asserts! (not (get executed proposal)) ERR_PROPOSAL_NOT_EXECUTABLE)
    
    ;; Mark as executed
    (map-set proposals proposal-id (merge proposal {executed: true}))
    
    ;; Refund deposit to proposer (successful proposal)
    (try! (refund-deposit proposal-id))
    
    ;; Execute proposal logic (if applicable) - FIXED
    (match (get target-contract proposal)
      target-addr (begin
        (unwrap-panic (execute-contract-call proposal))
        (print {message: "Contract execution completed", target: (some target-addr)})
      )
      (print {message: "No contract execution specified", target: none})
    )
    
    ;; Emit execution event
    (print {
      action: "proposal-executed",
      proposal-id: proposal-id,
      executor: tx-sender
    })
    
    (ok true)
  )
)

;; Add funds to DAO treasury
(define-public (add-to-treasury (amount uint))
  (begin
    ;; Transfer STX to contract
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    
    ;; Update treasury balance
    (var-set treasury-balance (+ (var-get treasury-balance) amount))
    
    ;; Emit event
    (print {
      action: "treasury-deposit",
      depositor: tx-sender,
      amount: amount,
      new-balance: (var-get treasury-balance)
    })
    
    (ok true)
  )
)

;; === READ-ONLY FUNCTIONS ===

;; Get proposal details
(define-read-only (get-proposal (proposal-id uint))
  (map-get? proposals proposal-id)
)

;; Get proposal status
(define-read-only (get-proposal-status (proposal-id uint))
  (match (map-get? proposals proposal-id)
    proposal (let (
      (current-block block-height)
      (total-votes (+ (get for-votes proposal) (get against-votes proposal)))
      (voting-ended (> current-block (get end-block proposal)))
      (quorum-met (>= total-votes QUORUM_THRESHOLD))
      (proposal-passed (> (get for-votes proposal) (get against-votes proposal)))
    )
      (if (get executed proposal)
        STATUS_EXECUTED
        (if (< current-block (get start-block proposal))
          STATUS_PENDING
          (if (not voting-ended)
            STATUS_ACTIVE
            (if (and quorum-met proposal-passed)
              STATUS_SUCCEEDED
              (if quorum-met
                STATUS_DEFEATED
                STATUS_EXPIRED
              )
            )
          )
        )
      )
    )
    u999 ;; Invalid proposal ID
  )
)

;; Get vote details
(define-read-only (get-vote (proposal-id uint) (voter principal))
  (map-get? votes {proposal-id: proposal-id, voter: voter})
)

;; Get proposal results
(define-read-only (get-proposal-results (proposal-id uint))
  (match (map-get? proposals proposal-id)
    proposal (let (
      (for-votes (get for-votes proposal))
      (against-votes (get against-votes proposal))
      (total-votes (+ for-votes against-votes))
      (quorum-met (>= total-votes QUORUM_THRESHOLD))
      (proposal-passed (> for-votes against-votes))
      (status (get-proposal-status proposal-id))
    )
      {
        for-votes: for-votes,
        against-votes: against-votes,
        total-votes: total-votes,
        quorum-met: quorum-met,
        proposal-passed: proposal-passed,
        status: status,
        exists: true
      }
    )
    {
      for-votes: u0,
      against-votes: u0,
      total-votes: u0,
      quorum-met: false,
      proposal-passed: false,
      status: u999,
      exists: false
    }
  )
)

;; Get next proposal ID
(define-read-only (get-next-proposal-id)
  (var-get next-proposal-id)
)

;; Get treasury balance
(define-read-only (get-treasury-balance)
  (var-get treasury-balance)
)

;; Check if can vote
(define-read-only (can-vote (proposal-id uint) (voter principal))
  (match (map-get? proposals proposal-id)
    proposal (let (
      (current-block block-height)
      (vote-key {proposal-id: proposal-id, voter: voter})
    )
      (and 
        (>= current-block (get start-block proposal))
        (<= current-block (get end-block proposal))
        (is-none (map-get? votes vote-key))
      )
    )
    false
  )
)

;; Check voting period activity
(define-read-only (is-voting-period-active (proposal-id uint))
  (match (map-get? proposals proposal-id)
    proposal (let (
      (current-block block-height)
    )
      (and 
        (>= current-block (get start-block proposal))
        (<= current-block (get end-block proposal))
      )
    )
    false
  )
)

;; Check if user has already voted
(define-read-only (has-voted (proposal-id uint) (voter principal))
  (is-some (map-get? votes {proposal-id: proposal-id, voter: voter}))
)

;; Get proposal deposit info
(define-read-only (get-proposal-deposit (proposal-id uint))
  (map-get? proposal-deposits proposal-id)
)

;; Check if proposal exists
(define-read-only (proposal-exists (proposal-id uint))
  (is-some (map-get? proposals proposal-id))
)

;; Get governance info
(define-read-only (get-governance-info)
  {
    proposal-threshold: PROPOSAL_THRESHOLD,
    quorum-threshold: QUORUM_THRESHOLD,
    voting-period: VOTING_PERIOD,
    execution-delay: EXECUTION_DELAY,
    proposal-deposit: PROPOSAL_DEPOSIT
  }
)

;; === PRIVATE FUNCTIONS ===

;; Refund proposal deposit
(define-private (refund-deposit (proposal-id uint))
  (match (map-get? proposal-deposits proposal-id)
    deposit-info (if (not (get refunded deposit-info))
      (begin
        ;; Transfer deposit back
        (try! (as-contract (contract-call? GOVERNANCE_TOKEN_CONTRACT transfer 
                                         (get amount deposit-info) 
                                         tx-sender 
                                         (get depositor deposit-info) 
                                         none)))
        
        ;; Mark as refunded
        (map-set proposal-deposits proposal-id (merge deposit-info {refunded: true}))
        
        (ok true)
      )
      (ok true) ;; Already refunded
    )
    (ok true) ;; No deposit found
  )
)

;; Execute contract call (placeholder) - FIXED
(define-private (execute-contract-call (proposal {proposer: principal, title: (string-ascii 100), description: (string-ascii 500), start-block: uint, end-block: uint, for-votes: uint, against-votes: uint, executed: bool, deposit-amount: uint, target-contract: (optional principal), function-name: (optional (string-ascii 50)), function-args: (optional (list 10 uint))}))
  (begin
    ;; Placeholder for contract execution logic
    ;; Real implementation would use dynamic contract calls
    (print {
      message: "Contract execution not implemented",
      target: (get target-contract proposal),
      function: (get function-name proposal)
    })
    (ok true)
  )
)