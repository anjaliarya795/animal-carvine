import React from "react";
import { FaTelegram, FaDiscord, FaInstagram, FaXTwitter } from "react-icons/fa6";

interface SocialIconProps {
  icon: React.ReactNode;
  label: string;
}

const SocialIcon: React.FC<SocialIconProps> = ({ icon, label }) => (
  <div
    className="w-12 h-12 bg-[#1a1a1a] hover:bg-orange-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 text-xl"
    aria-hidden="true"
    title={label}
  >
    {icon}
  </div>
);

const Footer2: React.FC = () => {
  return (
    <footer className="py-12 bg-black border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
        <div className="flex gap-6 mb-8">
          <a
            href="https://t.me/VaultCoinHQ"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
          >
            <SocialIcon icon={<FaTelegram />} label="Telegram" />
          </a>

          <a
            href="https://www.instagram.com/vaultcoinhq"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <SocialIcon icon={<FaInstagram />} label="Instagram" />
          </a>

          <a
            href="https://x.com/VaultCoinHQ"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X"
          >
            <SocialIcon icon={<FaXTwitter />} label="X" />
          </a>

          <a
            href="https://vaultcoin.network/go/discord"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Discord"
          >
            <SocialIcon icon={<FaDiscord />} label="Discord" />
          </a>
        </div>

        <p className="text-gray-500 text-sm text-center">&copy; 2025 VaultCoin. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer2;