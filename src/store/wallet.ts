import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface Wallet {
  balances: { [symbol: string]: number };
  // Multi-chain balances for the sale token (VLTC)
  // Key: chainId, Value: balance on that chain
  multiChainSaleTokenBalances: { [chainId: number]: number };
  user?: User;
}

const initialState: Wallet = {
  balances: {},
  multiChainSaleTokenBalances: {},
  user: undefined,
};

export const walletSlice = createSlice({
  name: "walletSlice",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setBalance: (
      state,
      action: PayloadAction<{ symbol: string; balance: number }>
    ) => {
      state.balances[action.payload.symbol] = action.payload.balance;
    },
    setMultiChainSaleTokenBalance: (
      state,
      action: PayloadAction<{ chainId: number; balance: number }>
    ) => {
      state.multiChainSaleTokenBalances[action.payload.chainId] = action.payload.balance;
    },
    setAllMultiChainBalances: (
      state,
      action: PayloadAction<{ [chainId: number]: number }>
    ) => {
      state.multiChainSaleTokenBalances = action.payload;
    },
  },
});

export const { setBalance, setUser, setMultiChainSaleTokenBalance, setAllMultiChainBalances } = walletSlice.actions;

export default walletSlice.reducer;
