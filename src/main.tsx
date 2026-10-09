import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Routers from './layouts/Routers'
import { Provider } from 'react-redux'
import { store } from './store'
import { BrowserRouter } from 'react-router-dom'
import SessionGate from './layouts/SessionGate'
import "./styles/index.css"

import { ConfigProvider, App } from 'antd'

import theme from './constants/theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ConfigProvider theme={theme}>
        <SessionGate>
          <BrowserRouter>
            <App>
              <Routers />
            </App>
          </BrowserRouter>
        </SessionGate>
      </ConfigProvider>
    </Provider>
  </StrictMode>
)
