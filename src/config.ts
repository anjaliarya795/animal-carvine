import {
  mainnet,
  bsc,
  polygon,
  base,
  arbitrum,
  avalanche,
  optimism,
  Chain,
  sepolia,
  bscTestnet,
  polygonAmoy
} from "viem/chains";

export const presaleStartTime = 1693432800;

// Ankr RPC helper - appends API key if available
const ankrApiKey = import.meta.env.VITE_ANKR_KEY || import.meta.env.VITE_ANKR_API_KEY || 'd88f72d0f4f8f6b1bb7f1a86a70e8cdeef27ee274b7607cfe2858cc68666c2d9';
const ankrRpc = (network: string) =>
  `https://rpc.ankr.com/${network}${ankrApiKey ? `/${ankrApiKey}` : ''}`;

// VaultCoin - Check - #TODO
const config = {
  chains: [mainnet, bsc, polygon] as [Chain, ...Chain[]],
  whitepaper: "https://vaultcoin.network/go/whitepaper",
  telegram: "https://t.me/VaultCoinHQ",
  twitter: "https://x.com/VaultCoinHQ",

  chainDetails: {
    [mainnet.id]: {
      name: "Ethereum",
      img: "/img/tokens/eth.svg",
      explorer: "https://etherscan.io",
      rpc: ankrRpc("eth"),
    },
    [sepolia.id]: {
      name: "Ethereum",
      img: "/img/tokens/eth.svg",
      explorer: "https://sepolia.etherscan.io",
      rpc: ankrRpc("eth_sepolia"),
    },
    [bsc.id]: {
      name: "BSC",
      img: "/img/tokens/bnb.svg",
      explorer: "https://bscscan.com",
      rpc: ankrRpc("bsc"),
    },
    [bscTestnet.id]: {
      name: "BSC Testnet",
      img: "/img/tokens/bnb.svg",
      explorer: "https://testnet.bscscan.com",
      rpc: ankrRpc("bsc_testnet_chapel"),
    },
    [polygon.id]: {
      name: "Polygon",
      img: "/img/tokens/polygon.svg",
      explorer: "https://polygonscan.com",
      rpc: ankrRpc("polygon"),
    },
    [polygonAmoy.id]: {
      name: "polygonAmoy",
      img: "/img/tokens/polygon.svg",
      explorer: "https://amoy.polygonscan.com",
      rpc: ankrRpc("polygon_amoy"),
    },
    [arbitrum.id]: {
      name: "Arbitrum",
      img: "/img/tokens/arbitrum.svg",
      explorer: "https://arbiscan.io",
      rpc: ankrRpc("arbitrum"),
    },
    [avalanche.id]: {
      name: "Avalanche",
      img: "/img/tokens/avalanche.svg",
      explorer: "https://snowtrace.io",
      rpc: ankrRpc("avalanche"),
    },
    [base.id]: {
      name: "Base",
      img: "/img/tokens/base.svg",
      explorer: "https://basescan.org",
      rpc: ankrRpc("base"),
    },
    [optimism.id]: {
      name: "Optimism",
      img: "/img/tokens/optimism.svg",
      explorer: "https://optimistic.etherscan.io",
      rpc: ankrRpc("optimism"),
    },
  } as {
    [key: number]: {
      name: string;
      img: string;
      explorer: string;
      rpc: string;
    };
  },

  stage: {
    name: "Stage 1",
    total: 1_000_000, // total sale amount
    endTime: 1788420751, // sale end time in unix timestamp
  },
  // VaultCoin - Check and Modify - TODO
  presaleContract: {
    [mainnet.id]: "0x6C17563189Cb4BDa3eBC8C3aaA92CFCEbB7D6aC4",    
    [bsc.id]: "0xDe094D601f45c07386305aD1293b0f7113A078Eb",
    [polygon.id]: "0x2741e556E5bf9C5d33FaeFF223b7699AE345c9ff",
    //not used
    [base.id]: "0x876A87A48c91E054ad9656709784Ae13FA265FEB",    
    [arbitrum.id]: "0x876A87A48c91E054ad9656709784Ae13FA265FEB",
    [avalanche.id]: "0x876A87A48c91E054ad9656709784Ae13FA265FEB",    
    [optimism.id]: "0x876A87A48c91E054ad9656709784Ae13FA265FEB",
    //testnets
    [sepolia.id]: "0x297d23d10649bb222f4fa603fa255c29fc916a04",
    [bscTestnet.id]: "0x4c4a8122494d09df395b924da313d3a81522b551",
    [polygonAmoy.id]: "0xeeb859f0ea5abb93acb727d5e2015321bd5fff24"
  } as { [key: number]: Address }, // presale contract address

  saleToken: {
    [mainnet.id]: {
      symbol: "VLTC", // token symbol
      name: "VaultCoin", // token name
      image: "/img/tokens/tokenvltc.svg", // token image
      decimals: 18, // token decimals
    },
    [bsc.id]: {
      symbol: "VLTC", // token symbol
      name: "VaultCoin", // token name
      image: "/img/tokens/tokenvltc.svg", // token image
      decimals: 18, // token decimals
    },
    [bscTestnet.id]: {
      symbol: "VLTC", // token symbol
      name: "VaultCoin", // token name
      image: "/img/tokens/tokenvltc.svg", // token image
      decimals: 18, // token decimals
    },
    [polygon.id]: {
      symbol: "VLTC", // token symbol
      name: "VaultCoin", // token name
      image: "/img/tokens/tokenvltc.svg", // token image
      decimals: 18, // token decimals
    },
    [polygonAmoy.id]: {
      symbol: "VLTC", // token symbol
      name: "VaultCoin", // token name
      image: "/img/tokens/tokenvltc.svg", // token image
      decimals: 18, // token decimals
    },
    [arbitrum.id]: {
      symbol: "VLTC", // token symbol
      name: "VaultCoin", // token name
      image: "/img/tokens/tokenvltc.svg", // token image
      decimals: 18, // token decimals
    },
    [avalanche.id]: {
      symbol: "VLTC", // token symbol
      name: "VaultCoin", // token name
      image: "/img/tokens/tokenvltc.svg", // token image
      decimals: 18, // token decimals
    },
    [base.id]: {
      symbol: "VLTC", // token symbol
      name: "VaultCoin", // token name
      image: "/img/tokens/tokenvltc.svg", // token image
      decimals: 18, // token decimals
    },
    [optimism.id]: {
      symbol: "VLTC", // token symbol
      name: "VaultCoin", // token name
      image: "/img/tokens/tokenvltc.svg", // token image
      decimals: 18, // token decimals
    },
    [sepolia.id]: {
      symbol: "VLTC", // token symbol
      name: "VaultCoin", // token name
      image: "/img/tokens/tokenvltc.svg", // token image
      decimals: 18, // token decimals
    },
  } as { [key: number]: Token },

  displayPrice: {
    [mainnet.id]: "USDT",
    [bsc.id]: "USDT",
    [polygon.id]: "USDT",
    [arbitrum.id]: "USDT",
    [avalanche.id]: "USDT",
    [base.id]: "USDT",
    [optimism.id]: "USDT",
    [bscTestnet.id]: "USDT",
    [sepolia.id]: "USDT",
  } as { [key: number]: string },

  // VaultCoin - Check - TODO
  whitelistedTokens: {
    //Ethereum
    [mainnet.id]: [
      {
        address: null,
        symbol: "ETH",
        name: "Ethereum",
        image:
          "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/eth.svg",
        decimals: 18,
      },
      {
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", //checked
        symbol: "USDT",
        name: "USDT",
        image:
          "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdt.svg",
        decimals: 6,
      },
      {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", //checked
        symbol: "USDC",
        name: "USDC",
        image: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdc.svg",
        decimals: 6,
      },
    ],
    //BSC
    [bsc.id]: [
      {
        address: null,
        symbol: "BNB",
        name: "Binance Coin",
        image: "/img/tokens/bnb.svg",
        decimals: 18,
      },
      {
        address: "0x55d398326f99059fF775485246999027B3197955", //checked
        symbol: "USDT",
        name: "USDT",
        image: "/img/tokens/usdt.svg",
        decimals: 18,
      },
      {
        address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", //checked
        symbol: "USDC",
        name: "USDC",
        image: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdc.svg",
        decimals: 18,
      },
    ],
    //Polygon
    [polygon.id]: [
      {
        address: null,
        symbol: "POL",
        name: "POL",
        image: "/img/tokens/polygon.svg",
        decimals: 18,
      },
      {
        address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", //checked
        symbol: "USDT",
        name: "USDT",
        image: "/img/tokens/usdt.svg",
        decimals: 6,
      },
      {
        address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", //checked
        symbol: "USDC",
        name: "USDC",
        image: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdc.svg",
        decimals: 6,
      },
    ],
    //Base
    [base.id]: [
      {
        address: null,
        symbol: "ETH",
        name: "BASE",
        image: "/img/tokens/base.svg",
        decimals: 18,
      },
      {
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", //checked
        symbol: "USDC",
        name: "USDC",
        image:
          "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdc.svg",
        decimals: 6,
      },
    ],
    //unused
    [arbitrum.id]: [
      {
        address: null,
        symbol: "ETH",
        name: "Arbitrum One",
        image: "/img/tokens/arbitrum.svg",
        decimals: 18,
      },
      {
        address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
        symbol: "USDT",
        name: "Tether USD",
        image: "/img/tokens/usdt.svg",
        decimals: 6,
      },
    ],
    [avalanche.id]: [
      {
        address: null,
        symbol: "AVAX",
        name: "Avalanche",
        image: "/img/tokens/avalanche.svg",
        decimals: 18,
      },
      {
        address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
        symbol: "USDT",
        name: "Tether USD",
        image: "/img/tokens/usdt.svg",
        decimals: 6,
      },
    ],    
    [optimism.id]: [
      {
        address: null,
        symbol: "ETH",
        name: "OP Mainnet",
        image: "/img/tokens/optimism.svg",
        decimals: 18,
      },
      {
        address: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
        symbol: "USDT",
        name: "Tether USD",
        image: "/img/tokens/usdt.svg",
        decimals: 6,
      },
    ],
    // Testnets
    [sepolia.id]: [
      {
        address: null,
        symbol: "ETH",
        name: "Ethereum",
        image:
          "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/eth.svg",
        decimals: 18,
      },
      {
        address: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0",
        symbol: "USDT",
        name: "Tether USD",
        image:
          "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdt.svg",
        decimals: 6,
      },
      {
        address: "0xf08A50178dfcDe18524640EA6618a1f965821715",
        symbol: "USDC",
        name: "USDC",
        image: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdc.svg",
        decimals: 6,
      },
    ],
    [bscTestnet.id]: [
      {
        address: null,
        symbol: "TBNB",
        name: "Test Binance Coin",
        image: "/img/tokens/bnb.svg",
        decimals: 18,
      },
      {
        address: "0x221c5B1a293aAc1187ED3a7D7d2d9aD7fE1F3FB0",
        symbol: "USDT",
        name: "Tether USD",
        image: "/img/tokens/usdt.svg",
        decimals: 18,
      },
    ],
     [polygonAmoy.id]: [
      {
        address: null,
        symbol: "MATIC",
        name: "MATIC",
        image: "/img/tokens/polygon.svg",
        decimals: 18,
      },
      {
        address: "0x8B0180f2101c8260d49339abfEe87927412494B4",
        symbol: "USDC",
        name: "USDC",
        image: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdc.svg",
        decimals: 6,
      },
    ],

  } as { [key: number]: Token[] },
};

export default config;
