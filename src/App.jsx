import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  RouterProvider,
  createBrowserRouter
} from 'react-router-dom'
import { RecoilRoot } from 'recoil'

import RootRoutes from './features/root/RootRoutes'

const router = createBrowserRouter([
  {
    path: '*',
    element: <RootRoutes />
  }
])

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <RecoilRoot>
      <RouterProvider router={router} />
    </RecoilRoot>
  </React.StrictMode>
)
