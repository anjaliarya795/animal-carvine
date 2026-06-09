import { useAppKit, useAppKitState } from '@reown/appkit/react'
import { useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'

type Props = {
  closeModal: Function;
};

export function ConnectWalletModal({ closeModal }: Props) {
  const { open, close } = useAppKit()
  const { open: isModalOpen } = useAppKitState()
  const { isConnected } = useAccount()
  const hasOpenedRef = useRef(false)

  useEffect(() => {
    // Open the AppKit modal only once
    if (!hasOpenedRef.current) {
      hasOpenedRef.current = true
      open()
    }
  }, [])

  useEffect(() => {
    // Close both modals immediately when wallet connects
    if (isConnected) {
      close()
      closeModal()
    }
  }, [isConnected])

  useEffect(() => {
    // When AppKit modal is closed by user, also close our wrapper
    if (hasOpenedRef.current && !isModalOpen && !isConnected) {
      closeModal()
    }
  }, [isModalOpen, isConnected, closeModal])

  // Return null as AppKit handles its own modal
  return null
}