import config, { presaleStartTime } from "../config";
import { RootState } from "../store";
import { useSelector, useDispatch } from "react-redux";
import {
  setSaleStatus,
  setTokenPrice,
  setTotalTokensSold,
  setMinBuyLimit,
  setMaxBuyLimit,
} from "../store/presale";
import { useMemo, useState } from "react";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { setBalance, setAllMultiChainBalances } from "../store/wallet";
import { toast } from "sonner";

import {
  createPublicClient,
  erc20Abi,
  formatUnits,
  getContract,
  http,
  parseUnits,
  zeroAddress,
} from "viem";
import { presaleAbi } from "../contracts/presaleABI";
import dayjs from "dayjs";
import useCurrentChain from "./useCurrentChain";

const publicClients = config.chains.reduce((acc, chain) => {
  const rpcUrl = config.chainDetails[chain.id]?.rpc;
  acc[chain.id] = createPublicClient({
    chain,
    batch: { multicall: true },
    transport: http(rpcUrl),
  });
  return acc;
}, {} as { [key: number]: ReturnType<typeof createPublicClient> });

const useWeb3Functions = () => {
  const chainId = useChainId();
  const chain = useCurrentChain();
  const [loading, setLoading] = useState(false);
  const tokens = useSelector((state: RootState) => state.presale.tokens);
  const dispatch = useDispatch();
  const { data: signer } = useWalletClient();
  const { address } = useAccount();

  const publicClient = useMemo(() => publicClients[chain.id], [chain.id]);

  const presaleContract = useMemo(() => {
    return getContract({
      address: config.presaleContract[chain.id],
      abi: presaleAbi,
      client: {
        public: publicClient,
        wallet: signer || undefined,
      },
    });
  }, [chain, publicClient, signer]);

  const fetchIntialData = async () => {
    setLoading(true);

    const [saleStatus] = await Promise.all([
      presaleContract.read.saleStatus(),
      fetchTotalTokensSold(),
      fetchTokenPrices(),
      fetchMinMaxLimits(),
    ]);

    dispatch(setSaleStatus(saleStatus));

    setLoading(false);
  };

  const fetchMinMaxLimits = async () => {
    try {
      const [minBuyAmountUSD, maxBuyAmountUSD] = await Promise.all([
        presaleContract.read.minBuyAmountUSD(),
        presaleContract.read.maxBuyAmountUSD(),
      ]);

      console.log("Raw min from contract:", minBuyAmountUSD.toString());
      console.log("Raw max from contract:", maxBuyAmountUSD.toString());

      // Convert from wei (10^18) to regular USD
      const minUSD = +formatUnits(minBuyAmountUSD, 18);
      const maxUSD = +formatUnits(maxBuyAmountUSD, 18);

      console.log("Converted min USD:", minUSD);
      console.log("Converted max USD:", maxUSD);

      dispatch(setMinBuyLimit(minUSD));
      dispatch(setMaxBuyLimit(maxUSD));
    } catch (error) {
      console.error("Failed to fetch min/max limits:", error);
    }
  };

  const fetchTotalTokensSold = async () => {
    let extraAmount = 0;
    let incrase = 0;

    const totalTokensSold = await Promise.all(
      config.chains.map((chain) =>
        publicClients[chain.id].readContract({
          address: config.presaleContract[chain.id],
          abi: presaleAbi,
          functionName: "totalTokensSold",
        })
      )
    );

    const amount = +format(totalTokensSold.reduce((a, b) => a + b, 0n)) || 0;
    const m = dayjs().diff(dayjs.unix(presaleStartTime), "minute");

    const ext = amount + incrase * Math.floor(m / 10);
    let total = (amount < ext ? ext : amount) + extraAmount;
    total = total > config.stage.total ? config.stage.total : total;
    dispatch(setTotalTokensSold(total));
  };

  const fetchLockedBalance = async () => {
    if (!address) return;

    const { symbol, decimals } = config.saleToken[chain.id];
    const buyerAmount = await presaleContract.read.balanceOf([address]);
    const balance = +formatUnits(buyerAmount, decimals);

    dispatch(setBalance({ symbol: symbol, balance }));
  };

  const fetchAllChainBalances = async () => {
    if (!address) return;

    try {
      // Fetch balances from all configured chains in parallel
      const balancePromises = config.chains.map(async (chainConfig) => {
        try {
          const client = publicClients[chainConfig.id];
          const contractAddress = config.presaleContract[chainConfig.id];
          const { decimals } = config.saleToken[chainConfig.id];

          const buyerAmount = await client.readContract({
            address: contractAddress,
            abi: presaleAbi,
            functionName: "balanceOf",
            args: [address],
          });

          return {
            chainId: chainConfig.id,
            balance: +formatUnits(buyerAmount, decimals),
          };
        } catch (error) {
          console.warn(`Failed to fetch balance for chain ${chainConfig.id}:`, error);
          return {
            chainId: chainConfig.id,
            balance: 0,
          };
        }
      });

      const balances = await Promise.all(balancePromises);

      // Create a map of chainId -> balance
      const balanceMap = balances.reduce((acc, { chainId, balance }) => {
        acc[chainId] = balance;
        return acc;
      }, {} as { [chainId: number]: number });

      dispatch(setAllMultiChainBalances(balanceMap));

      // Also update the current chain's balance in the main balance store
      const currentChainBalance = balanceMap[chain.id] || 0;
      const { symbol } = config.saleToken[chain.id];
      dispatch(setBalance({ symbol: symbol, balance: currentChainBalance }));
    } catch (error) {
      console.error("Failed to fetch multi-chain balances:", error);
    }
  };

  const fetchTokenBalances = async () => {
    if (!address) return;

    const balancses = await Promise.all(
      tokens[chain.id].map((token) => {
        if (token.address) {
          return publicClient.readContract({
            address: token.address,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [address],
          });
        } else {
          return publicClient.getBalance({ address });
        }
      })
    );

    tokens[chain.id].forEach((token, index) => {
      dispatch(
        setBalance({
          symbol: token.symbol,
          balance: +formatUnits(balancses[index], token.decimals),
        })
      );
    });
  };

  const fetchTokenPrices = async () => {
    // For the new contract, we calculate prices based on getTokenAmount
    // Get 1 unit of each token and see how many sale tokens we get
    const pricePromises = tokens[chain.id].map(async (token) => {
      try {
        const oneUnit = parseUnits("1", token.decimals);
        const result = await presaleContract.read.getTokenAmount([
          token.address || zeroAddress,
          oneUnit
        ]);
        return result;
      } catch (error) {
        // Token might not be in allowedPaymentMethod or other error
        console.warn(`Failed to fetch price for ${token.symbol}:`, error);
        return 0n;
      }
    });

    const pricses = await Promise.all(pricePromises);

    tokens[chain.id].forEach((token, index) => {
      // The price is: how much of payment token gets you 1 sale token
      // If 1 payment token gets you X sale tokens, then price = 1/X
      const tokensReceived = +formatUnits(pricses[index], config.saleToken[chain.id].decimals);
      const price = tokensReceived > 0 ? 1 / tokensReceived : 0;

      dispatch(
        setTokenPrice({
          symbol: token.symbol,
          price: price,
        })
      );
    });
  };

  const checkAllowance = async (
    token: Token,
    owner: Address,
    spender: Address,
    amount: bigint
  ) => {
    if (!token.address || !signer || !address) return;

    const tokenContract = getContract({
      address: token.address,
      abi: erc20Abi,
      client: {
        public: publicClient,
        wallet: signer,
      },
    });
    const allowance = await tokenContract.read.allowance([owner, spender]);

    if (allowance < amount) {
      const hash = await tokenContract.write.approve([
        spender,
        amount,
      ]);
      await publicClient.waitForTransactionReceipt({ hash });
      toast.success("Token spend approved successfully");
    }
  };

  const buyToken = async (value: string | number, token: Token, bonusCode?: string, stageId?: number) => {
    let success = false;
    let hash;

    if (!signer || !address) return { success, txHash: hash };

    setLoading(true);
    const loadingToast = toast.loading("Preparing transaction...");

    try {
      const amount = parseUnits(`${value}`, token.decimals);

      if (token.address) {
        toast.loading("Approving token spend...", { id: loadingToast });
        await checkAllowance(
          token,
          address,
          config.presaleContract[chain.id],
          amount
        );
      }

      toast.loading("Confirm transaction in your wallet", { id: loadingToast });
      const { request } = await presaleContract.simulate.purchaseTokens(
        [token.address || zeroAddress, amount],
        { account: address, value: token.address ? 0n : amount }
      );

      hash = await signer.writeContract(request);
      toast.loading("Transaction submitted! Waiting for confirmation...", { id: loadingToast });

      // Wait for transaction with timeout (30 seconds)
      const TRANSACTION_TIMEOUT = 30_000;
      try {
        await Promise.race([
          publicClient.waitForTransactionReceipt({ hash }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('TRANSACTION_TIMEOUT')), TRANSACTION_TIMEOUT)
          )
        ]);
      } catch (timeoutError: any) {
        if (timeoutError?.message === 'TRANSACTION_TIMEOUT') {
          // Transaction submitted but taking too long to confirm
          toast.dismiss(loadingToast);
          toast.error(
            `Transaction Pending: Your transaction is taking longer than expected, likely due to network congestion. Your funds are safe. Transaction ID: ${hash} — If tokens don't appear after confirmation, contact support@vaultcoin.network with this ID.`,
            { duration: 30000 }
          );
          setLoading(false);
          return { success: false, txHash: hash, pending: true };
        }
        throw timeoutError;
      }

      // Get the token amount purchased
      const purchased_amount = await presaleContract.read.getTokenAmount([
        token.address || zeroAddress,
        amount
      ]);

      // Record transaction in backend
      toast.loading("Recording transaction...", { id: loadingToast });
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://psmanager.vaultcoin.network/';
        const apiKey = import.meta.env.VITE_API_KEY || 'r5vtiwM+cGphTvXffy2jFkyKjmEPLeXsOjvEiAQM54A=';

        // Fetch active stage if stageId not provided
        let activeStageId = stageId;
        if (!activeStageId) {
          try {
            const stageResponse = await fetch(`${backendUrl}/api/widget/active-stage`, {
              headers: { 'x-api-key': apiKey }
            });
            if (stageResponse.ok) {
              const stageData = await stageResponse.json();
              activeStageId = stageData.stage?.id;
            }
          } catch (err) {
            console.error('Failed to fetch active stage:', err);
          }
        }

        const response = await fetch(`${backendUrl}/api/widget/purchase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          },
          body: JSON.stringify({
            stageId: activeStageId || 1,
            txHash: hash,
            walletAddress: address,
            paymentToken: token.symbol,
            paymentAmount: value.toString(),
            tokenAmount: formatUnits(purchased_amount, config.saleToken[chain.id].decimals),
            bonusCode: bonusCode || null,
            chainId: chain.id,
            chainName: chain.name,
          }),
        });

        if (!response.ok) {
          console.error('Backend recording failed:', await response.text());
        }
      } catch (err) {
        console.error('Failed to record transaction:', err);
        // Don't fail the whole transaction if backend recording fails
      }

      // Refresh balances and stats
      toast.loading("Updating balances...", { id: loadingToast });
      await Promise.all([
        fetchTokenBalances(),
        fetchAllChainBalances(),
        fetchTotalTokensSold(),
      ]);

      toast.success(
        `Successfully purchased ${config.saleToken[chain.id].symbol} tokens${bonusCode ? ' with ' + bonusCode + ' bonus' : ''}!`,
        { id: loadingToast, duration: 5000 }
      );

      success = true;
    } catch (error: any) {
      const errorMessage = error?.walk?.().shortMessage ||
        error?.walk?.().message ||
        error?.message ||
        "Transaction failed. Please try again.";

      toast.error(errorMessage, { id: loadingToast, duration: 5000 });
    }

    setLoading(false);

    return { success, txHash: hash };
  };

  const addTokenAsset = async (token: Token) => {
    if (!token.address || !signer) return;
    try {
      await signer.watchAsset({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals ?? 18,
            image: token.image.includes("http")
              ? token.image
              : `${window.location.origin}${token.image}`,
          },
        },
      } as any);
      toast.success(`${token.symbol} token added to wallet successfully`);
    } catch (e) {
      toast.error("Failed to add token to wallet");
    }
  };

  const parse = (value: string | number) =>
    parseUnits(`${value}`, config.saleToken[chain.id].decimals);

  const format = (value: bigint) =>
    formatUnits(value, config.saleToken[chain.id].decimals);

  const getPriceInUSD = async () => {
    try {
      const priceInUSD = await presaleContract.read.priceInUSD();
      return priceInUSD;
    } catch (error) {
      console.error("Failed to fetch priceInUSD:", error);
      return 0n;
    }
  };

  return {
    loading,
    parse,
    format,
    buyToken,
    addTokenAsset,
    fetchIntialData,
    fetchLockedBalance,
    fetchAllChainBalances,
    fetchTokenBalances,
    getPriceInUSD,
    presaleContract,
  };
};

export default useWeb3Functions;
