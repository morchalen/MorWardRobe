import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [backendStatus, setBackendStatus] = useState<string>('检查中...')

  useEffect(() => {
    fetch('/healthz')
      .then(res => res.text())
      .then(() => setBackendStatus('✅ 后端连接成功 (8080)'))
      .catch(() => setBackendStatus('❌ 后端连接失败'))
  }, [])

  return (
    <div className="App">
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo