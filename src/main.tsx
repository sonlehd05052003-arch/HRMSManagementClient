import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Routers from './layouts/Routers'
import { Provider } from 'react-redux'
import { store } from './store'
import { BrowserRouter } from 'react-router-dom'
import SessionGate from './layouts/SessionGate'
import "./styles/index.css"

import { ConfigProvider, App } from 'antd'
import { StyleProvider } from '@ant-design/cssinjs'

import viVN from 'antd/locale/vi_VN'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'

import theme from './constants/theme'

// Every antd text (empty tables, date pickers, pagination, confirmations) and day/month names in Vietnamese
dayjs.locale('vi')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      {/* layer: antd's CSS goes in @layer antd, ordered below Tailwind's utilities in index.css */}
      <StyleProvider layer>
      <ConfigProvider theme={theme} locale={viVN}>
        <SessionGate>
          <BrowserRouter>
            <App>
              <Routers />
            </App>
          </BrowserRouter>
        </SessionGate>
      </ConfigProvider>
      </StyleProvider>
    </Provider>
  </StrictMode>
)
