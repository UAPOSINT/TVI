'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
    const [status, setStatus] = useState('verifying');
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token');
            if (!token) {
                setStatus('error');
                return;
            }

            try {
                const response = await fetch(`/api/auth/verify-email/${token}`);
                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                } else {
                    setStatus('error');
                }
            } catch (error) {
                setStatus('error');
            }
        };

        verifyEmail();
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
                <h1 className="text-4xl font-tvi text-amber-500">EMAIL VERIFICATION</h1>

                {status === 'verifying' && (
                    <div className="text-gray-400">
                        <p>Verifying your email address...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4">
                        <p className="text-green-500">Your email has been successfully verified!</p>
                        <Link 
                            href="/login" 
                            className="inline-block bg-amber-600 text-black px-6 py-2 rounded hover:bg-amber-700"
                        >
                            Proceed to Login
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4">
                        <p className="text-red-500">
                            Verification failed. The link may be invalid or expired.
                        </p>
                        <Link 
                            href="/login" 
                            className="inline-block bg-amber-600 text-black px-6 py-2 rounded hover:bg-amber-700"
                        >
                            Return to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
} 