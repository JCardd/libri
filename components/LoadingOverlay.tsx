import React from 'react'
import { Loader2 } from 'lucide-react'

const LoadingOverlay = () => {
  return (
    <div className="loading-wrapper" role="status" aria-live="polite" aria-busy="true">
      <div className="loading-shadow-wrapper">
        <div className="loading-shadow">
          <Loader2 className="loading-animation text-[`#663820`]" size={64} aria-hidden="true"/>
          <div className="text-center">
            <h2 className="loading-title">Synthesizing Your Book</h2>
            <p className="text-[#8B7355] mt-2">Crafting a literary experience...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingOverlay
