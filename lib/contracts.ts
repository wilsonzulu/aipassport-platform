// lib/contracts.ts
export const AMOY_CHAIN_ID = 80002 as const;

// === Your deployed addresses (Amoy) ===
export const DIAMOND = "0x7Edf341b8E68Bd0D68008667056EE53c3843FD2D" as const;

export const MOCK_USDT = "0xC23E0c81f25403e35A54D6B6357e4336E35219Df" as const;
export const MOCK_USDT_SYMBOL = "USDT" as const;

export const PASSPORT_NAME = "AI Meta Passport" as const;
export const PASSPORT_SYMBOL = "AIP" as const;

// Tiers (match your solidity enum ordering)
export const TIER = {
  BASIC: 0,
  PRO: 1,
  ELITE: 2,
} as const;

// -------------------------
// Minimal + correct ABIs
// -------------------------

export const ERC20_ABI = [
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export const ERC721_ABI = [
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const PRICE_VIEW_ABI = [
  {
    type: "function",
    name: "getPrices",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "basic", type: "uint256" },
      { name: "proPerDay", type: "uint256" },
      { name: "elitePerDay", type: "uint256" },
    ],
  },
] as const;

// CoreFacet (mint + buy)
export const CORE_ABI = [
  {
    type: "function",
    name: "mintBasic",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "buyPro",
    stateMutability: "nonpayable",
    inputs: [{ name: "daysCount", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "buyElite",
    stateMutability: "nonpayable",
    inputs: [{ name: "daysCount", type: "uint256" }],
    outputs: [],
  },
] as const;

// RewardsFacet
export const REWARDS_ABI = [
  {
    type: "function",
    name: "pendingRewardsOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "claimRewards",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "fundRewardsPool",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
] as const;

// LoanFacet
export const LOAN_ABI = [
  {
    type: "function",
    name: "fundLoanPool",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "requestLoan",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "durationDays", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "repayLoan",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "markDefault",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "clearDefault",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
] as const;

// AutoExtendFacet
export const AUTO_EXTEND_ABI = [
  {
    type: "function",
    name: "autoExtendPrivilege",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "privilege", type: "uint8" },
      { name: "daysCount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

// ReputationLockFacet
export const REPUTATION_LOCK_ABI = [
  {
    type: "function",
    name: "lockReputation",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "lockSeconds", type: "uint256" },
      { name: "multiplier", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "unlockReputation",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "getReputationLock",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "unlockTime", type: "uint256" },
          { name: "multiplier", type: "uint256" },
          { name: "active", type: "bool" },
        ],
      },
    ],
  },
] as const;

/**
 * ✅ RentalsFacet (Offer -> Accept) ABIs
 * IMPORTANT: currentPassportUser returns ONLY address
 */
export const RENTALS_ABI = [
  {
    type: "function",
    name: "createPassportRentOffer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "daysCount", type: "uint256" },
      { name: "price", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "cancelPassportRentOffer",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "acceptPassportRentOffer",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "clearExpiredPassportRent",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "revokePassportRentEarly",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },

  // ✅ FIX: returns ONLY address user
  {
    type: "function",
    name: "currentPassportUser",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "user", type: "address" }],
  },

  {
    type: "function",
    name: "getPassportRentOffer",
    stateMutability: "view",
    inputs: [{ name: "lenderTokenId", type: "uint256" }],
    outputs: [
      { name: "owner", type: "address" },
      { name: "endTime", type: "uint64" },
      { name: "price", type: "uint256" },
      { name: "active", type: "bool" },
    ],
  },
] as const;

/**
 * PassportViewFacet
 */
export const PASSPORT_VIEW_ABI = [
  {
    type: "function",
    name: "isValid",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "passportScore",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getPassport",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "tokenId", type: "uint256" },
          { name: "owner", type: "address" },
          { name: "hasBasic", type: "bool" },
          { name: "hasPro", type: "bool" },
          { name: "hasElite", type: "bool" },
          { name: "isSuspended", type: "bool" },
          { name: "isDefaulted", type: "bool" },
          { name: "reserved0", type: "uint256" },
          { name: "eliteExpiry", type: "uint256" },
          { name: "reserved1", type: "uint16" },
          { name: "reserved2", type: "uint16" },
          { name: "proExpiry", type: "uint256" },
          { name: "reserved3", type: "uint16" },
          { name: "score", type: "uint32" },
          { name: "reserved4", type: "bool" },
          { name: "reserved5", type: "uint64" },
          { name: "reserved6", type: "uint256" },
          { name: "basicId", type: "uint256" },
          { name: "renter1", type: "address" },
          { name: "renter1Until", type: "uint64" },
          { name: "renter2", type: "address" },
          { name: "renter2Until", type: "uint64" },
          { name: "renter3", type: "address" },
          { name: "renter3Until", type: "uint64" },
        ],
      },
    ],
  },
] as const;