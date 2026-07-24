import React from 'react'
import { createRoot } from 'react-dom/client'
import DhawmapLive from './DhawmapLive.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DhawmapLive />
  </React.StrictMode>
)
