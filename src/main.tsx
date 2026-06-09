// src/main.tsx
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import { Provider } from 'react-redux'
import { store } from './store'
import 'sweetalert2/src/sweetalert2.scss'
import './i18n'
import { AppKitProvider } from './components/AppKitProvider'

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '02bd0c9cd174298abd79cad1ac583e40';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider store={store}>
    <AppKitProvider>
      <App />
    </AppKitProvider>
  </Provider>
)
