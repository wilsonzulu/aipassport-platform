"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import {
  AMOY_CHAIN_ID,
  DIAMOND,
  MOCK_USDT,
  MOCK_USDT_SYMBOL,
  PASSPORT_NAME,
  TIER,
  ERC20_ABI,
  PRICE_VIEW_ABI,
  CORE_ABI,
  REWARDS_ABI,
  LOAN_ABI,
  AUTO_EXTEND_ABI,
  REPUTATION_LOCK_ABI,
  RENTALS_ABI,
  ERC721_ABI,
  PASSPORT_VIEW_ABI,
} from "../lib/contracts";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.06)",
        fontSize: 12,
        color: "rgba(255,255,255,0.85)",
        gap: 8,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.06)",
        boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
        padding: 16,
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 14, color: "white" }}>{title}</div>
          {subtitle ? (
            <div style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{subtitle}</div>
          ) : null}
        </div>
      </div>
      <div style={{ marginTop: 14 }}>{children}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontWeight: 800, fontSize: 12, color: "rgba(255,255,255,0.80)" }}>{children}</div>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(0,0,0,0.35)",
        color: "white",
        outline: "none",
        ...(props.style || {}),
      }}
    />
  );
}

function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}) {
  const isPrimary = variant === "primary";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: 14,
        border: isPrimary ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(255,255,255,0.12)",
        background: disabled
          ? "rgba(255,255,255,0.08)"
          : isPrimary
          ? "linear-gradient(135deg, rgba(255,255,255,0.20), rgba(255,255,255,0.08))"
          : "rgba(0,0,0,0.35)",
        color: disabled ? "rgba(255,255,255,0.55)" : "white",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: 900,
      }}
    >
      {children}
    </button>
  );
}

function DaysPicker({
  value,
  setValue,
  presets = [1, 2, 3, 7, 14, 30],
}: {
  value: number;
  setValue: (v: number) => void;
  presets?: number[];
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {presets.map((d) => (
        <button
          key={d}
          onClick={() => setValue(d)}
          style={{
            padding: "9px 10px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.12)",
            background: value === d ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.25)",
            color: "white",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          {d}d
        </button>
      ))}
      <div style={{ minWidth: 140 }}>
        <Input
          type="number"
          min={1}
          value={value}
          onChange={(e) => setValue(Math.max(1, Number(e.target.value || 1)))}
          placeholder="Custom days"
        />
      </div>
    </div>
  );
}

function jsonSafe(v: any) {
  return JSON.stringify(v, (_k, val) => (typeof val === "bigint" ? val.toString() : val), 2);
}

function shortAddr(a?: string) {
  if (!a) return "";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function unixToLocal(ts: any) {
  try {
    const n = typeof ts === "bigint" ? Number(ts) : Number(ts);
    if (!n) return "-";
    return new Date(n * 1000).toLocaleString();
  } catch {
    return "-";
  }
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isAmoy = chainId === AMOY_CHAIN_ID;

  const publicClient = usePublicClient();
  const { writeContractAsync, isPending } = useWriteContract();
  const { switchChainAsync, isPending: switching } = useSwitchChain();

  const [tokenId, setTokenId] = useState<number>(1);
  const [tokenStatus, setTokenStatus] = useState<string>("");

  const [proDays, setProDays] = useState<number>(2);
  const [eliteDays, setEliteDays] = useState<number>(2);

  const [loanUsdt, setLoanUsdt] = useState<number>(10);
  const [loanDays, setLoanDays] = useState<number>(1);

  const [autoTier, setAutoTier] = useState<number>(TIER.ELITE);
  const [autoDays, setAutoDays] = useState<number>(2);

  const [lockDays, setLockDays] = useState<number>(1);
  const [lockMultiplier, setLockMultiplier] = useState<number>(120);

  // ✅ Rental marketplace states (minimal addition)
  const [rentLenderTokenId, setRentLenderTokenId] = useState<number>(1);
  const [rentDays, setRentDays] = useState<number>(2);
  const [rentPriceUsdt, setRentPriceUsdt] = useState<number>(5);

  const [actionStatus, setActionStatus] = useState<string>("");
  const [lastTx, setLastTx] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      if (!address || !isAmoy || !publicClient) return;

      setTokenStatus("Detecting your passport tokenId…");

      for (let i = 1; i <= 100; i++) {
        try {
          const owner = await (publicClient as any).readContract({
            address: DIAMOND,
            abi: ERC721_ABI,
            functionName: "ownerOf",
            args: [BigInt(i)],
          });

          if (!cancelled && typeof owner === "string" && owner.toLowerCase() === address.toLowerCase()) {
            setTokenId(i);
            setTokenStatus(`Detected tokenId: ${i}`);
            return;
          }
        } catch {}
      }

      if (!cancelled) setTokenStatus("No passport token found for this wallet yet.");
    }

    detect();
    return () => {
      cancelled = true;
    };
  }, [address, isAmoy, publicClient, lastTx]);

  const usdtDecimals = useReadContract({
    address: MOCK_USDT,
    abi: ERC20_ABI,
    functionName: "decimals",
    query: { enabled: true },
  });
  const dec = Number(usdtDecimals.data ?? 6);

  const prices = useReadContract({
    address: DIAMOND,
    abi: PRICE_VIEW_ABI,
    functionName: "getPrices",
    query: { enabled: true },
  });

  const pricesAny = prices.data as any;

  const basicPrice: bigint = (pricesAny?.basic ?? pricesAny?.[0] ?? 0n) as bigint;
  const proPerDay: bigint = (pricesAny?.proPerDay ?? pricesAny?.[1] ?? 0n) as bigint;
  const elitePerDay: bigint = (pricesAny?.elitePerDay ?? pricesAny?.[2] ?? 0n) as bigint;

  const proTotal = useMemo(() => proPerDay * BigInt(proDays), [proPerDay, proDays]);
  const eliteTotal = useMemo(() => elitePerDay * BigInt(eliteDays), [elitePerDay, eliteDays]);

  const allowance = useReadContract({
    address: MOCK_USDT,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, DIAMOND] : undefined,
    query: { enabled: !!address },
  });

  const pendingRewards = useReadContract({
    address: DIAMOND,
    abi: REWARDS_ABI,
    functionName: "pendingRewardsOf",
    args: [BigInt(tokenId)],
    query: { enabled: true },
  });

  const isValid = useReadContract({
    address: DIAMOND,
    abi: PASSPORT_VIEW_ABI,
    functionName: "isValid",
    args: [BigInt(tokenId)],
    query: { enabled: true },
  });

  const passportScore = useReadContract({
    address: DIAMOND,
    abi: PASSPORT_VIEW_ABI,
    functionName: "passportScore",
    args: [BigInt(tokenId)],
    query: { enabled: true },
  });

  const passportRaw = useReadContract({
    address: DIAMOND,
    abi: PASSPORT_VIEW_ABI,
    functionName: "getPassport",
    args: [BigInt(tokenId)],
    query: { enabled: true },
  });

  // ✅ FIXED: supports BOTH tuple-as-array and tuple-as-object
  const passportDecoded = useMemo(() => {
    const p: any = passportRaw.data as any;
    if (!p) return null;

    const now = Math.floor(Date.now() / 1000);
    const isArray = Array.isArray(p);

    const tokenIdVal = isArray ? p[0] : p.tokenId;
    const ownerVal = isArray ? p[1] : p.owner;

    const hasBasicRaw = isArray ? p[2] : p.hasBasic;
    const isSuspendedRaw = isArray ? p[5] : p.isSuspended;
    const isDefaultedRaw = isArray ? p[6] : p.isDefaulted;

    // In your live output, proExpiry is being shown under "proExpiry" (not "reserved0")
    // but we safely fallback if structure changes.
    const proExpiryRaw = (isArray ? p[7] : (p.proExpiry ?? p.reserved0)) ?? 0;
    const eliteExpiryRaw = (isArray ? p[8] : p.eliteExpiry) ?? 0;

    const proExpiry = Number(proExpiryRaw);
    const eliteExpiry = Number(eliteExpiryRaw);

    const hasPro = proExpiry > now;
    const hasElite = eliteExpiry > now;

    const basicIdVal = isArray ? p[17] : p.basicId;

    const renter1Val = isArray ? p[18] : p.renter1;
    const renter1UntilVal = isArray ? p[19] : p.renter1Until;

    const renter2Val = isArray ? p[20] : p.renter2;
    const renter2UntilVal = isArray ? p[21] : p.renter2Until;

    const renter3Val = isArray ? p[22] : p.renter3;
    const renter3UntilVal = isArray ? p[23] : p.renter3Until;

    return {
      tokenId: String(tokenIdVal),
      owner: String(ownerVal),
      hasBasic: Boolean(hasBasicRaw),
      hasPro,
      hasElite,
      isSuspended: Boolean(isSuspendedRaw),
      isDefaulted: Boolean(isDefaultedRaw),
      proExpiry: Number.isFinite(proExpiry) ? proExpiry : 0,
      eliteExpiry: Number.isFinite(eliteExpiry) ? eliteExpiry : 0,
      basicId: String(basicIdVal),
      renter1: String(renter1Val),
      renter1Until: Number(renter1UntilVal ?? 0),
      renter2: String(renter2Val),
      renter2Until: Number(renter2UntilVal ?? 0),
      renter3: String(renter3Val),
      renter3Until: Number(renter3UntilVal ?? 0),
    };
  }, [passportRaw.data]);

  const repLock = useReadContract({
    address: DIAMOND,
    abi: REPUTATION_LOCK_ABI,
    functionName: "getReputationLock",
    args: [BigInt(tokenId)],
    query: { enabled: true },
  });

  // ✅ Rental marketplace reads (minimal)
  const rentOffer = useReadContract({
    address: DIAMOND,
    abi: RENTALS_ABI,
    functionName: "getPassportRentOffer",
    args: [BigInt(rentLenderTokenId)],
    query: { enabled: true },
  });

  const rentCurrentUser = useReadContract({
    address: DIAMOND,
    abi: RENTALS_ABI,
    functionName: "currentPassportUser",
    args: [BigInt(rentLenderTokenId)],
    query: { enabled: true },
  });

  async function runTx(label: string, fn: () => Promise<`0x${string}`>) {
    try {
      setActionStatus(`${label}: sending…`);
      setLastTx("");
      const hash = await fn();
      setLastTx(hash);
      setActionStatus(`${label}: submitted. Waiting confirmation…`);
      if (publicClient) await publicClient.waitForTransactionReceipt({ hash });
      setActionStatus(`${label}: ✅ success`);
      return hash;
    } catch (e: any) {
      setActionStatus(`${label}: ❌ ${e?.shortMessage || e?.message || "failed"}`);
      throw e;
    }
  }

  async function approveIfNeeded(needAmount: bigint) {
    const allow = allowance.data ?? 0n;
    if (allow >= needAmount) return;
    const big = needAmount * 100n;
    await runTx(`Approve ${MOCK_USDT_SYMBOL}`, () =>
      writeContractAsync({
        address: MOCK_USDT,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [DIAMOND, big],
      })
    );
  }

  const canUse = isConnected && isAmoy && !isPending && !switching;

  async function mintBasic() {
    await approveIfNeeded(basicPrice);
    await runTx("Mint BASIC", () =>
      writeContractAsync({ address: DIAMOND, abi: CORE_ABI, functionName: "mintBasic", args: [] })
    );
  }

  async function buyPro() {
    await approveIfNeeded(proTotal);
    await runTx("Buy PRO", () =>
      writeContractAsync({ address: DIAMOND, abi: CORE_ABI, functionName: "buyPro", args: [BigInt(proDays)] })
    );
  }

  async function buyElite() {
    await approveIfNeeded(eliteTotal);
    await runTx("Buy ELITE", () =>
      writeContractAsync({ address: DIAMOND, abi: CORE_ABI, functionName: "buyElite", args: [BigInt(eliteDays)] })
    );
  }

  async function claimRewards() {
    await runTx("Claim rewards", () =>
      writeContractAsync({ address: DIAMOND, abi: REWARDS_ABI, functionName: "claimRewards", args: [BigInt(tokenId)] })
    );
  }

  async function requestLoan() {
    const amt = parseUnits(String(loanUsdt), dec);
    await approveIfNeeded(amt);
    await runTx("Request loan", () =>
      writeContractAsync({
        address: DIAMOND,
        abi: LOAN_ABI,
        functionName: "requestLoan",
        args: [BigInt(tokenId), amt, BigInt(loanDays)],
      })
    );
  }

  async function repayLoan() {
    await runTx("Repay loan", () =>
      writeContractAsync({ address: DIAMOND, abi: LOAN_ABI, functionName: "repayLoan", args: [BigInt(tokenId)] })
    );
  }

  async function autoExtend() {
    await runTx("AutoExtend", () =>
      writeContractAsync({
        address: DIAMOND,
        abi: AUTO_EXTEND_ABI,
        functionName: "autoExtendPrivilege",
        args: [BigInt(tokenId), autoTier, BigInt(autoDays)],
      })
    );
  }

  async function lockReputation() {
    const seconds = BigInt(lockDays) * 86400n;
    await runTx("Lock reputation", () =>
      writeContractAsync({
        address: DIAMOND,
        abi: REPUTATION_LOCK_ABI,
        functionName: "lockReputation",
        args: [BigInt(tokenId), seconds, BigInt(lockMultiplier)],
      })
    );
  }

  async function unlockReputation() {
    await runTx("Unlock reputation", () =>
      writeContractAsync({
        address: DIAMOND,
        abi: REPUTATION_LOCK_ABI,
        functionName: "unlockReputation",
        args: [BigInt(tokenId)],
      })
    );
  }

  // ✅ Rental marketplace actions
  async function createOffer() {
    const price = parseUnits(String(rentPriceUsdt), dec);
    await runTx("Create rent offer", () =>
      writeContractAsync({
        address: DIAMOND,
        abi: RENTALS_ABI,
        functionName: "createPassportRentOffer",
        args: [BigInt(rentLenderTokenId), BigInt(rentDays), price],
      })
    );
  }

  async function cancelOffer() {
    await runTx("Cancel rent offer", () =>
      writeContractAsync({
        address: DIAMOND,
        abi: RENTALS_ABI,
        functionName: "cancelPassportRentOffer",
        args: [BigInt(rentLenderTokenId)],
      })
    );
  }

  async function acceptOffer() {
    const o: any = rentOffer.data as any;
    const livePrice: bigint = (o?.price ?? o?.[2] ?? 0n) as bigint;
    await approveIfNeeded(livePrice);
    await runTx("Accept rent offer", () =>
      writeContractAsync({
        address: DIAMOND,
        abi: RENTALS_ABI,
        functionName: "acceptPassportRentOffer",
        args: [BigInt(rentLenderTokenId)],
      })
    );
  }

  async function clearExpiredOffer() {
    await runTx("Clear expired rent", () =>
      writeContractAsync({
        address: DIAMOND,
        abi: RENTALS_ABI,
        functionName: "clearExpiredPassportRent",
        args: [BigInt(rentLenderTokenId)],
      })
    );
  }

  async function revokeEarly() {
    await runTx("Revoke early", () =>
      writeContractAsync({
        address: DIAMOND,
        abi: RENTALS_ABI,
        functionName: "revokePassportRentEarly",
        args: [BigInt(rentLenderTokenId)],
      })
    );
  }

  async function switchToAmoy() {
    await switchChainAsync({ chainId: AMOY_CHAIN_ID });
  }

  // ✅ compute whether Elite button should be enabled
  const eliteBlocked = !!passportDecoded && !passportDecoded.hasPro;

  // ✅ pretty struct for UI
  const passportPretty = passportDecoded
    ? {
        tokenId: passportDecoded.tokenId,
        owner: passportDecoded.owner,
        hasBasic: passportDecoded.hasBasic,
        hasPro: passportDecoded.hasPro,
        hasElite: passportDecoded.hasElite,
        isSuspended: passportDecoded.isSuspended,
        isDefaulted: passportDecoded.isDefaulted,
        proExpiry: passportDecoded.proExpiry,
        eliteExpiry: passportDecoded.eliteExpiry,
        basicId: passportDecoded.basicId,
        renter1: passportDecoded.renter1,
        renter1Until: passportDecoded.renter1Until,
        renter2: passportDecoded.renter2,
        renter2Until: passportDecoded.renter2Until,
        renter3: passportDecoded.renter3,
        renter3Until: passportDecoded.renter3Until,
      }
    : null;

  // offer display (safe)
  const offerDisplay = useMemo(() => {
    const o: any = rentOffer.data as any;
    if (!o) return null;
    const owner = o.owner ?? o[0];
    const endTime = o.endTime ?? o[1];
    const price = o.price ?? o[2];
    const active = o.active ?? o[3];
    return { owner, endTime, price, active };
  }, [rentOffer.data]);

  const currentUserDisplay = useMemo(() => {
    const cu: any = rentCurrentUser.data as any;
    if (!cu) return null;
    const user = cu.user ?? cu[0];
    const until = cu.until ?? cu[1];
    return { user, until };
  }, [rentCurrentUser.data]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1000px 600px at 15% 15%, rgba(255,255,255,0.10), transparent 60%), radial-gradient(900px 500px at 80% 10%, rgba(255,255,255,0.08), transparent 55%), #07070b",
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 950, color: "white" }}>{PASSPORT_NAME} Platform</div>
            <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Pill>Network: {isAmoy ? "Polygon Amoy" : "Wrong network"}</Pill>
              <Pill>
                Diamond:{" "}
                <span style={{ fontFamily: "ui-monospace", opacity: 0.9 }}>
                  {DIAMOND.slice(0, 8)}…{DIAMOND.slice(-6)}
                </span>
              </Pill>
              <Pill>
                MockUSDT:{" "}
                <span style={{ fontFamily: "ui-monospace", opacity: 0.9 }}>
                  {MOCK_USDT.slice(0, 8)}…{MOCK_USDT.slice(-6)}
                </span>
              </Pill>
            </div>
          </div>
          <ConnectButton />
        </div>

        {isConnected && !isAmoy && (
          <div style={{ marginTop: 14, padding: 12, borderRadius: 14, border: "1px solid rgba(255, 204, 0, 0.25)", background: "rgba(255, 204, 0, 0.10)", color: "rgba(255, 230, 170, 0.95)", fontWeight: 800, display: "grid", gap: 10 }}>
            <div>
              You are on the wrong network. Switch to <b>Polygon Amoy</b>.
            </div>
            <div style={{ maxWidth: 260 }}>
              <Button onClick={switchToAmoy}>Switch to Polygon Amoy</Button>
            </div>
          </div>
        )}

        {actionStatus && (
          <div style={{ marginTop: 14, padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.90)", fontWeight: 800, display: "grid", gap: 8 }}>
            <div>{actionStatus}</div>
            {lastTx ? (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                Tx: <span style={{ fontFamily: "ui-monospace" }}>{lastTx}</span>
              </div>
            ) : null}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14, marginTop: 16 }}>
          <Card title="Passport Profile" subtitle="Detected token + score + struct">
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.70)" }}>{tokenStatus}</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <Label>tokenId</Label>
                  <div style={{ marginTop: 6, color: "white", fontWeight: 950 }}>{tokenId}</div>
                </div>
                <div>
                  <Label>isValid</Label>
                  <div style={{ marginTop: 6, color: "white", fontWeight: 950 }}>
                    {isValid.data === undefined ? "-" : isValid.data ? "true ✅" : "false ❌"}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <Label>passportScore</Label>
                  <div style={{ marginTop: 6, color: "white", fontWeight: 950 }}>
                    {passportScore.data === undefined ? "-" : passportScore.data.toString()}
                  </div>
                </div>
                <div>
                  <Label>Pending rewards</Label>
                  <div style={{ marginTop: 6, color: "white", fontWeight: 950 }}>
                    {pendingRewards.data !== undefined ? formatUnits(pendingRewards.data, dec) : "Loading…"} {MOCK_USDT_SYMBOL}
                  </div>
                </div>
              </div>

              <pre style={{ marginTop: 8, maxHeight: 220, overflow: "auto", padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.35)", color: "rgba(255,255,255,0.85)", fontSize: 12, lineHeight: 1.35 }}>
                {passportPretty ? jsonSafe(passportPretty) : (passportRaw.data ? jsonSafe(passportRaw.data) : "-")}
              </pre>
            </div>
          </Card>

          <Card title="Owner Sets Prices (Read Only)" subtitle="This must reflect on-chain values">
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <Label>BASIC price</Label>
                  <div style={{ marginTop: 6, color: "white", fontWeight: 950 }}>
                    {prices.data ? formatUnits(basicPrice, dec) : "Loading…"} {MOCK_USDT_SYMBOL}
                  </div>
                </div>
                <div>
                  <Label>PRO per day</Label>
                  <div style={{ marginTop: 6, color: "white", fontWeight: 950 }}>
                    {prices.data ? formatUnits(proPerDay, dec) : "Loading…"} {MOCK_USDT_SYMBOL}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <Label>ELITE per day</Label>
                  <div style={{ marginTop: 6, color: "white", fontWeight: 950 }}>
                    {prices.data ? formatUnits(elitePerDay, dec) : "Loading…"} {MOCK_USDT_SYMBOL}
                  </div>
                </div>
                <div>
                  <Label>Totals update by days</Label>
                  <div style={{ marginTop: 6, color: "rgba(255,255,255,0.8)", fontWeight: 900, fontSize: 12 }}>
                    PRO total: {formatUnits(proTotal, dec)} | ELITE total: {formatUnits(eliteTotal, dec)}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Mint & Privileges" subtitle="BASIC one-time; PRO/ELITE choose days (totals shown)">
            <div style={{ display: "grid", gap: 12 }}>
              <Button disabled={!canUse} onClick={mintBasic}>
                Mint BASIC ({formatUnits(basicPrice, dec)} {MOCK_USDT_SYMBOL})
              </Button>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.10)", paddingTop: 12 }}>
                <Label>PRO duration (days)</Label>
                <div style={{ marginTop: 8 }}><DaysPicker value={proDays} setValue={setProDays} /></div>
                <div style={{ marginTop: 10, color: "rgba(255,255,255,0.85)" }}>
                  Total: <b style={{ color: "white" }}>{formatUnits(proTotal, dec)} {MOCK_USDT_SYMBOL}</b>
                </div>
                <div style={{ marginTop: 10 }}>
                  <Button disabled={!canUse} onClick={buyPro} variant="secondary">Buy PRO</Button>
                </div>
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.10)", paddingTop: 12 }}>
                <Label>ELITE duration (days)</Label>
                <div style={{ marginTop: 8 }}><DaysPicker value={eliteDays} setValue={setEliteDays} /></div>
                <div style={{ marginTop: 10, color: "rgba(255,255,255,0.85)" }}>
                  Total: <b style={{ color: "white" }}>{formatUnits(eliteTotal, dec)} {MOCK_USDT_SYMBOL}</b>
                </div>

                {!passportDecoded ? null : (
                  <div style={{ marginTop: 8, fontSize: 12, color: eliteBlocked ? "rgba(255,200,120,0.95)" : "rgba(255,255,255,0.65)" }}>
                    {eliteBlocked ? "Elite requires Pro first." : "Pro detected ✅ Elite can be purchased."}
                  </div>
                )}

                <div style={{ marginTop: 10 }}>
                  <Button disabled={!canUse || eliteBlocked} onClick={buyElite} variant="secondary">
                    Buy ELITE{eliteBlocked ? " (Pro required)" : ""}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Loans" subtitle="Use real USDT amounts; app handles decimals">
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><Label>Duration (days)</Label><Input type="number" min={1} value={loanDays} onChange={(e) => setLoanDays(Math.max(1, Number(e.target.value || 1)))} /></div>
                <div><Label>Loan amount ({MOCK_USDT_SYMBOL})</Label><Input type="number" min={1} value={loanUsdt} onChange={(e) => setLoanUsdt(Math.max(1, Number(e.target.value || 1)))} /></div>
              </div>
              <Button disabled={!canUse} onClick={requestLoan}>Request Loan</Button>
              <Button disabled={!canUse} onClick={repayLoan} variant="secondary">Repay Loan</Button>
            </div>
          </Card>

          <Card title="Rewards" subtitle="Pending + claim">
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
                Pending: <b style={{ color: "white" }}>{pendingRewards.data !== undefined ? formatUnits(pendingRewards.data, dec) : "Loading…"} {MOCK_USDT_SYMBOL}</b>
              </div>
              <Button disabled={!canUse} onClick={claimRewards} variant="secondary">Claim Rewards</Button>
            </div>
          </Card>

          <Card title="AutoExtend" subtitle="Uses rewards balance to extend PRO/ELITE">
            <div style={{ display: "grid", gap: 10 }}>
              <div>
                <Label>Privilege</Label>
                <select value={autoTier} onChange={(e) => setAutoTier(Number(e.target.value))} style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.35)", color: "white" }}>
                  <option value={TIER.PRO}>PRO</option>
                  <option value={TIER.ELITE}>ELITE</option>
                </select>
              </div>

              <div><Label>Days</Label><DaysPicker value={autoDays} setValue={setAutoDays} /></div>
              <Button disabled={!canUse} onClick={autoExtend}>AutoExtend</Button>
            </div>
          </Card>

          <Card title="Reputation Lock" subtitle="Lock reputation for time + multiplier (e.g. 120 = 1.2x)">
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><Label>Lock days</Label><Input type="number" min={1} value={lockDays} onChange={(e) => setLockDays(Math.max(1, Number(e.target.value || 1)))} /></div>
                <div><Label>Multiplier</Label><Input type="number" min={1} value={lockMultiplier} onChange={(e) => setLockMultiplier(Math.max(1, Number(e.target.value || 1)))} /></div>
              </div>

              <Button disabled={!canUse} onClick={lockReputation}>Lock</Button>
              <Button disabled={!canUse} onClick={unlockReputation} variant="secondary">Unlock</Button>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.10)", paddingTop: 10, color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
                <div><b>Current lock:</b></div>
                <div style={{ marginTop: 6 }}>
                  {repLock.data
                    ? `unlockTime=${String((repLock.data as any).unlockTime ?? (repLock.data as any)[0])} | multiplier=${String((repLock.data as any).multiplier ?? (repLock.data as any)[1])} | active=${String((repLock.data as any).active ?? (repLock.data as any)[2])}`
                    : "-"}
                </div>
              </div>
            </div>
          </Card>

          <Card title="Rental Marketplace" subtitle="Passport rent offers (sealed: renter must already have BASIC)">
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <Label>Passport tokenId (lender)</Label>
                  <Input type="number" min={1} value={rentLenderTokenId} onChange={(e) => setRentLenderTokenId(Math.max(1, Number(e.target.value || 1)))} />
                </div>
                <div>
                  <Label>Days</Label>
                  <Input type="number" min={1} value={rentDays} onChange={(e) => setRentDays(Math.max(1, Number(e.target.value || 1)))} />
                </div>
              </div>

              <div>
                <Label>Price ({MOCK_USDT_SYMBOL})</Label>
                <Input type="number" min={0} value={rentPriceUsdt} onChange={(e) => setRentPriceUsdt(Math.max(0, Number(e.target.value || 0)))} />
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.10)", paddingTop: 10, color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
                <div><b>Offer:</b></div>
                <div style={{ marginTop: 6 }}>
                  {offerDisplay
                    ? `owner=${shortAddr(String(offerDisplay.owner))} | active=${String(offerDisplay.active)} | price=${formatUnits(BigInt(offerDisplay.price), dec)} ${MOCK_USDT_SYMBOL} | end=${unixToLocal(offerDisplay.endTime)}`
                    : "Loading…"}
                </div>
                <div style={{ marginTop: 8 }}><b>Current user:</b></div>
                <div style={{ marginTop: 6 }}>
                  {currentUserDisplay
                    ? `user=${shortAddr(String(currentUserDisplay.user))} | until=${unixToLocal(currentUserDisplay.until)}`
                    : "Loading…"}
                </div>
              </div>

              <Button disabled={!canUse} onClick={createOffer}>Create Offer (owner)</Button>
              <Button disabled={!canUse} onClick={cancelOffer} variant="secondary">Cancel Offer (owner)</Button>

              <Button disabled={!canUse || !isValid.data} onClick={acceptOffer}>
                Accept Offer (renter)
              </Button>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Button disabled={!canUse} onClick={clearExpiredOffer} variant="secondary">Clear Expired</Button>
                <Button disabled={!canUse} onClick={revokeEarly} variant="secondary">Revoke Early</Button>
              </div>
            </div>
          </Card>
        </div>

        <div style={{ marginTop: 18, color: "rgba(255,255,255,0.60)", fontSize: 12 }}>
          Note: Renting respects our sealed rule: renter must already have BASIC (one per wallet; soulbound).
        </div>
      </div>
    </div>
  );
}