'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setStatus('loading');

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
            } else {
                setError(data.error || 'Failed to send reset email');
                setStatus('error');
            }
        } catch (error) {
            setError('An unexpected error occurred');
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h1 className="text-4xl font-tvi text-center text-amber-500">PASSWORD RESET</h1>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Enter your email to receive a password reset link
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="text-center space-y-4">
                        <p className="text-green-500">
                            If an account exists with this email, you will receive password reset instructions shortly.
                        </p>
                        <Link
                            href="/login"
                            className="inline-block bg-amber-600 text-black px-6 py-2 rounded hover:bg-amber-700"
                        >
                            Return to Login
                        </Link>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm text-amber-500 mb-1">
                                EMAIL
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="appearance-none relative block w-full px-4 py-3 bg-black border border-amber-600/30 placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={status === 'loading'}
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent font-medium rounded-md text-black bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${
                                    status === 'loading' ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {status === 'loading' ? 'SENDING...' : 'SEND RESET LINK'}
                            </button>
                        </div>

                        <div className="text-center">
                            <Link href="/login" className="text-amber-500 hover:text-amber-400 text-sm">
                                Return to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
} 