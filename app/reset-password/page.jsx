'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');
    const searchParams = useSearchParams();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        const token = searchParams.get('token');
        if (!token) {
            setError('Invalid reset link');
            return;
        }

        setStatus('loading');

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
            } else {
                setError(data.error || 'Failed to reset password');
                setStatus('error');
            }
        } catch (error) {
            setError('An unexpected error occurred');
            setStatus('error');
        }
    };

    if (!searchParams.get('token')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 text-center">
                    <h1 className="text-4xl font-tvi text-amber-500">INVALID RESET LINK</h1>
                    <p className="text-red-500">The password reset link is invalid or has expired.</p>
                    <Link
                        href="/forgot-password"
                        className="inline-block bg-amber-600 text-black px-6 py-2 rounded hover:bg-amber-700"
                    >
                        Request New Reset Link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h1 className="text-4xl font-tvi text-center text-amber-500">RESET PASSWORD</h1>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Enter your new password
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="text-center space-y-4">
                        <p className="text-green-500">
                            Your password has been successfully reset!
                        </p>
                        <Link
                            href="/login"
                            className="inline-block bg-amber-600 text-black px-6 py-2 rounded hover:bg-amber-700"
                        >
                            Proceed to Login
                        </Link>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm space-y-4">
                            <div>
                                <label htmlFor="password" className="block text-sm text-amber-500 mb-1">
                                    NEW PASSWORD
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="appearance-none relative block w-full px-4 py-3 bg-black border border-amber-600/30 placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={status === 'loading'}
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm text-amber-500 mb-1">
                                    CONFIRM PASSWORD
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="appearance-none relative block w-full px-4 py-3 bg-black border border-amber-600/30 placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={status === 'loading'}
                                />
                            </div>
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
                                {status === 'loading' ? 'RESETTING...' : 'RESET PASSWORD'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
} 