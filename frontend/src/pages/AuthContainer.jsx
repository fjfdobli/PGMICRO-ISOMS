import React from 'react'
import { useState } from 'react'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'

export default function AuthContainer({ onLogin }) { 
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10">
        <div className={`transition-all duration-300 ease-in-out ${isLogin ? 'fade-in' : 'fade-in'}`}>
          {isLogin ? (
            <LoginPage 
              onSwitchToRegister={() => setIsLogin(false)} 
              onLogin={onLogin} 
            />
          ) : (
            <RegisterPage onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  )
}