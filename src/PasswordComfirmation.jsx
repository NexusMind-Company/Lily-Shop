import React, { useState } from 'react'
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5'
import { TbLockPassword } from 'react-icons/tb'

const PasswordComfirmation = () => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    setError('')
    alert('Password accepted ')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">

        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Enter password to complete process
        </h2>

        <label className="block text-sm text-gray-600 mb-2">Password</label>

        <div className="relative mb-2">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <TbLockPassword />
          </div>

          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full pl-12 pr-12 py-3 bg-gray-100 rounded-lg text-base outline-none placeholder-gray-400"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            {showPassword ? <IoEyeOffOutline className='w-5' /> : <IoEyeOutline  className='w-5' />}
          </button>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          onClick={handleSubmit}
          className="w-full bg-[#4caf50] hover:bg-[#58ce5c] text-white py-3.5 rounded-full text-base font-semibold transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default PasswordComfirmation
