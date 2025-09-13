import React, { useState, useEffect } from 'react'

const Toast = ({ message, type = 'success', isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-blue-500 text-white'
  }

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`
        ${typeStyles[type]}
        px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3
        min-w-[300px] max-w-[500px]
        transform transition-all duration-300 ease-in-out
      `}>
        <span className="text-xl">{icons[type]}</span>
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-current hover:opacity-70 transition-opacity ml-4"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default Toast
