import React from 'react'

export default function Card({ 
  title, 
  subtitle,
  actions = null, 
  children, 
  className = '',
  padding = 'default',
  shadow = 'sm',
  hover = false,
  loading = false
}) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  }
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }
  
  const hoverClasses = hover ? 'hover:shadow-md transition-shadow duration-200' : ''
  
  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${shadowClasses[shadow]} ${hoverClasses} ${className}`}>
      {(title || actions) && (
        <div className={`${paddingClasses[padding]} ${title || actions ? 'border-b border-gray-200' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {title && (
                <h2 className="text-lg font-semibold text-gray-900 truncate">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-600 truncate">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="ml-4 flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className={paddingClasses[padding]}>
        {loading ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
