## Frontend (vltc-widget)

### Environment Variables
- [ ] **Update VITE_BACKEND_URL** - Set to production backend URL
- [ ] **Update VITE_API_KEY** - Must match backend WIDGET_API_KEY
- [ ] **Update VITE_WALLET_CONNECT_PROJECT_ID** - Production WalletConnect project

```env
#https://dashboard.reown.com/
VITE_WALLET_CONNECT_PROJECT_ID="your-production-project-id"
VITE_WALLET_CONNECT_URL="https://presale.vaultcoin.network"
#https://www.ankr.com/
VITE_ANKR_KEY="your-api-key" 
VITE_BACKEND_URL="https://api.yourdomain.com"
VITE_API_KEY="same-as-backend-widget-api-key"
```

### Smart Contract Configuration
- [ ] Update contract addresses in `src/config.ts`
- [ ] Verify supported chains are correct
- [ ] Update presale contract ABI if needed
- [ ] Test all contract interactions on production chain

### Build & Deploy
- [ ] Install: `npm install`
- [ ] Build: `npm run build`
- [ ] Test build locally: `npm run preview`
- [ ] Optimize assets (images, fonts)
- [ ] Enable production optimizations
- [ ] Configure CDN for static assets
