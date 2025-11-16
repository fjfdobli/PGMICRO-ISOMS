import React from 'react'

export default function ChatBubble({ icon, label, color = 'bg-gray-600 hover:bg-gray-700', onClick, badge = null }) {
  return (
    <button
      onClick={onClick}
      className={`${color} text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 relative group`}
      title={label}
    >
      {icon}
      {badge && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
      <span className="absolute right-full mr-2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {label}
      </span>
    </button>
  )
}
