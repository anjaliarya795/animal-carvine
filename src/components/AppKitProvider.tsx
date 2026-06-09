import { createAppKit } from '@reown/appkit/react'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { http } from 'viem'
import config from '../config'

// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId from https://dashboard.reown.com
const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '02bd0c9cd174298abd79cad1ac583e40';

// 2. Create a metadata object - optional
const metadata = {
  name: 'AppKit',
  description: 'AppKit Example',
  url: import.meta.env.VITE_WALLET_CONNECT_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://presale.vaultcoin.network/'), // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// 3. Set the networks
const networks = config.chains

// 4. Create custom transports for each chain using Ankr RPCs
const transports = config.chains.reduce((acc, chain) => {
  const rpcUrl = config.chainDetails[chain.id]?.rpc;
  acc[chain.id] = http(rpcUrl);
  return acc;
}, {} as Record<number, ReturnType<typeof http>>);

// 5. Create Wagmi Adapter with custom transports
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
  transports,
})

// 5. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    socials: false,
  }
})

export function AppKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}