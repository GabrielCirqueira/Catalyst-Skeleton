import ReactDOM from 'react-dom/client'
import React from 'react'
import App from './App.tsx'

const element = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(element)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
