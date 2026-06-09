import { useEffect, useRef, useState } from "react";
import config from "../config";
import useCurrentChain from "../hooks/useCurrentChain";
import { useAccount, useSwitchChain } from "wagmi";
import { useDispatch } from "react-redux";
import { setCurrentChain } from "../store/presale";

export default function SwitchNetworkButton() {
  const chain = useCurrentChain();
  const { switchChainAsync } = useSwitchChain();
  const { isConnected } = useAccount();
  const dropDownRef = useRef<HTMLUListElement>(null);
  const dispatch = useDispatch();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const selectNetwork = (chainId: number) => {
    if (isConnected) {
      switchChainAsync?.({ chainId }).then(() =>
        dispatch(setCurrentChain(chainId))
      );
    } else {
      dispatch(setCurrentChain(chainId));
    }
    setDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropDownRef.current &&
        !dropDownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropDownRef]);

  return (
    <div className="relative flex-1 sm:flex-none">
      <button
        className="relative flex w-full sm:w-auto items-center justify-between gap-2 rounded-lg border border-border-gray bg-bgDark px-3 py-2 text-sm font-semibold text-text-light transition-all duration-200 hover:bg-bgCard hover:border-primary disabled:pointer-events-none disabled:opacity-40"
        type="button"
        onClick={() => toggleDropdown()}
      >
        <div className="flex items-center gap-2">
          {config.chainDetails[chain.id] && (
            <img
              src={config.chainDetails[chain.id].img}
              alt={chain.name}
              className="h-5 w-5 rounded-full"
            />
          )}
          <span className="text-white font-medium">{config.chainDetails[chain.id]?.name || chain?.name}</span>
        </div>
        <svg
          className={`w-4 h-4 text-text-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {dropdownOpen && (
        <ul
          ref={dropDownRef}
          className="absolute right-0 top-full mt-2 z-50 min-w-[220px] rounded-lg border border-border-gray bg-bgCard shadow-2xl py-2 backdrop-blur-sm"
        >
          {config.chains.map((c) => {
            const isActive = c.id === chain.id;
            return (
              <li
                key={c.id}
                className={`flex items-center justify-between gap-3 px-4 py-3 cursor-pointer font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary/20 to-transparent text-primary border-l-2 border-primary'
                    : 'text-text-light hover:bg-bgDark hover:text-white'
                }`}
                onClick={() => selectNetwork(c.id)}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={config.chainDetails[c.id].img}
                    alt={c.name}
                    className="h-6 w-6 rounded-full border border-border-gray object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{c.name}</span>
                    <span className="text-xs text-text-muted">{c.nativeCurrency.symbol}</span>
                  </div>
                </div>
                {isActive && (
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
