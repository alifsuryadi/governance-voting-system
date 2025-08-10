;; Governance Token Contract (SPT - Stacks Proposal Token)
;; SIP-010 compliant fungible token dengan voting capabilities

;; === CONSTANTS ===
(define-constant TOKEN_NAME "Stacks Proposal Token")
(define-constant TOKEN_SYMBOL "SPT")
(define-constant TOKEN_DECIMALS u6)
(define-constant TOKEN_TOTAL_SUPPLY u1000000000000) ;; 1M tokens dengan 6 decimals

;; Contract owner (untuk initial distribution)
(define-constant CONTRACT_OWNER tx-sender)

;; Error codes
(define-constant ERR_UNAUTHORIZED (err u1000))
(define-constant ERR_INSUFFICIENT_BALANCE (err u1001))
(define-constant ERR_INVALID_AMOUNT (err u1002))
(define-constant ERR_ALREADY_INITIALIZED (err u1003))

;; === DATA STORAGE ===

;; Token balances map
(define-map balances principal uint)

;; Total supply tracking
(define-data-var total-supply uint u0)

;; Contract initialization flag
(define-data-var is-initialized bool false)

;; === SIP-010 IMPLEMENTATION ===

;; Get token name
(define-read-only (get-name)
  (ok TOKEN_NAME)
)

;; Get token symbol  
(define-read-only (get-symbol)
  (ok TOKEN_SYMBOL)
)

;; Get token decimals
(define-read-only (get-decimals)
  (ok TOKEN_DECIMALS)
)

;; Get total supply
(define-read-only (get-total-supply)
  (ok (var-get total-supply))
)

;; Get token URI (not implemented)
(define-read-only (get-token-uri)
  (ok none)
)

;; Get balance of specific address
(define-read-only (get-balance (account principal))
  (ok (default-to u0 (map-get? balances account)))
)

;; Transfer tokens - FIXED VERSION
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    ;; Verify sender authorization
    (asserts! (or (is-eq tx-sender sender) (is-eq contract-caller sender)) ERR_UNAUTHORIZED)
    
    ;; Get sender balance
    (let (
      (sender-balance (get-balance-of sender))
    )
      ;; Verify sufficient balance
      (asserts! (>= sender-balance amount) ERR_INSUFFICIENT_BALANCE)
      
      ;; Verify valid amount
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)
      
      ;; Execute transfer
      (try! (transfer-tokens amount sender recipient))
      
      ;; Emit transfer event
      (print {
        action: "transfer",
        sender: sender,
        recipient: recipient,
        amount: amount,
        memo: memo
      })
      
      (ok true)
    )
  )
)

;; === GOVERNANCE FUNCTIONS ===

;; Initialize contract dengan initial token distribution
(define-public (initialize)
  (begin
    ;; Ensure not already initialized
    (asserts! (not (var-get is-initialized)) ERR_ALREADY_INITIALIZED)
    
    ;; Set total supply
    (var-set total-supply TOKEN_TOTAL_SUPPLY)
    
    ;; Mint initial supply to contract owner
    (map-set balances CONTRACT_OWNER TOKEN_TOTAL_SUPPLY)
    
    ;; Mark as initialized
    (var-set is-initialized true)
    
    ;; Emit initialization event
    (print {
      action: "initialize",
      total-supply: TOKEN_TOTAL_SUPPLY,
      owner: CONTRACT_OWNER
    })
    
    (ok true)
  )
)

;; Mint new tokens (only contract owner)
(define-public (mint (amount uint) (recipient principal))
  (begin
    ;; Only contract owner can mint
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    
    ;; Verify valid amount
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    
    ;; Update total supply
    (var-set total-supply (+ (var-get total-supply) amount))
    
    ;; Add tokens to recipient
    (map-set balances recipient (+ (get-balance-of recipient) amount))
    
    ;; Emit mint event
    (print {
      action: "mint",
      recipient: recipient,
      amount: amount
    })
    
    (ok true)
  )
)

;; Distribute tokens ke multiple addresses (untuk initial distribution)
(define-public (distribute-tokens (recipients (list 100 {address: principal, amount: uint})))
  (begin
    ;; Only contract owner can distribute
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    
    ;; Process all distributions
    (ok (map process-distribution recipients))
  )
)

;; === HELPER FUNCTIONS ===

;; Get balance internal function
(define-read-only (get-balance-of (account principal))
  (default-to u0 (map-get? balances account))
)

;; Internal transfer function - FIXED VERSION
(define-private (transfer-tokens (amount uint) (sender principal) (recipient principal))
  (let (
    (sender-balance (get-balance-of sender))
    (recipient-balance (get-balance-of recipient))
  )
    ;; Verify sufficient balance again (safety check)
    (asserts! (>= sender-balance amount) ERR_INSUFFICIENT_BALANCE)
    
    ;; Update sender balance
    (map-set balances sender (- sender-balance amount))
    
    ;; Update recipient balance
    (map-set balances recipient (+ recipient-balance amount))
    
    (ok true)
  )
)

;; Process individual distribution - FIXED VERSION
(define-private (process-distribution (dist {address: principal, amount: uint}))
  (let (
    (address (get address dist))
    (amount (get amount dist))
    (transfer-result (transfer-tokens amount CONTRACT_OWNER address))
  )
    ;; Handle transfer result properly
    (match transfer-result
      success {address: address, amount: amount, success: true}
      error {address: address, amount: amount, success: false}
    )
  )
)

;; Check if address has minimum voting power
(define-read-only (has-voting-power (account principal) (minimum uint))
  (>= (get-balance-of account) minimum)
)

;; Get voting power (sama dengan token balance)
(define-read-only (get-voting-power (account principal))
  (get-balance-of account)
)

;; Check if contract is initialized
(define-read-only (is-contract-initialized)
  (var-get is-initialized)
)

;; Get contract owner
(define-read-only (get-contract-owner)
  CONTRACT_OWNER
)