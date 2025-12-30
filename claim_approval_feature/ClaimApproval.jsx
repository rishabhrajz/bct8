import React, { useState } from 'react';

const ClaimApproval = ({ claimId, initialCoverage = 0 }) => {
    const [coverageAmount, setCoverageAmount] = useState(initialCoverage);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

    const handleApprove = async () => {
        if (isLoading || isSuccess) return;

        setIsLoading(true);
        setToast(null);

        try {
            const response = await fetch(`/api/claims/${claimId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ coverageAmount: Number(coverageAmount) }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setIsSuccess(true);
                setToast({
                    type: 'success',
                    message: data.message || '✅ Transaction successful — coverage approved',
                });

                // Log transaction ID if available
                if (data.transactionId) {
                    console.info(`Transaction ID: ${data.transactionId}`);
                }

                // Hide toast after 3 seconds
                setTimeout(() => {
                    setToast(null);
                }, 3000);
            } else {
                throw new Error(data.message || 'Unknown error occurred');
            }
        } catch (error) {
            setToast({
                type: 'error',
                message: `❌ Transaction failed — ${error.message}`,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded-lg shadow-sm bg-white max-w-md">
            <h3 className="text-lg font-semibold mb-4">Claim Approval</h3>

            {/* Input Section - Hidden on Success */}
            {!isSuccess && (
                <div className="mb-4">
                    <label htmlFor={`coverage-${claimId}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Coverage Amount
                    </label>
                    <input
                        id={`coverage-${claimId}`}
                        type="number"
                        value={coverageAmount}
                        onChange={(e) => setCoverageAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter amount"
                        disabled={isLoading}
                    />
                </div>
            )}

            {/* Action Button - Hidden on Success */}
            {!isSuccess && (
                <button
                    onClick={handleApprove}
                    disabled={isLoading}
                    className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </>
                    ) : (
                        'Approve and Pay'
                    )}
                </button>
            )}

            {/* Toast Notification */}
            {toast && (
                <div
                    role="status"
                    aria-live="polite"
                    className={`mt-4 p-4 rounded-md ${toast.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                        }`}
                >
                    <div className="flex">
                        <div className="flex-shrink-0">
                            {toast.type === 'success' ? (
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium">{toast.message}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClaimApproval;
