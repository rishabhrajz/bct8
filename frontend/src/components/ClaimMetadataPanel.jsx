import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function ClaimMetadataPanel({ claim, onClose }) {
    const [isJsonExpanded, setIsJsonExpanded] = useState(false);

    if (!claim) return null;

    const copyToClipboard = (text, label) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success(`Copied ${label}`);
    };

    const formatEth = (wei) => {
        try {
            return (parseInt(wei) / 1e18).toFixed(4) + ' ETH';
        } catch (e) {
            return '0.0000 ETH';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-25 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto border-l border-gray-200 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Claim Details</h2>
                        <p className="text-sm text-gray-500">Metadata & Submission Info</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors"
                        aria-label="Close panel"
                    >
                        <span className="text-2xl leading-none">&times;</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8 flex-1">
                    <Section title="Status & ID">
                        <div className="grid grid-cols-2 gap-4">
                            <Row label="Claim ID" value={`#${claim.id}`} />
                            <Row label="On-chain ID" value={claim.onchainClaimId ? `#${claim.onchainClaimId}` : 'Pending'} />
                        </div>
                        <div className="mt-4">
                            <Row label="Status" value={<StatusBadge status={claim.status} />} />
                        </div>
                        <div className="mt-4">
                            <Row label="Submitted At" value={formatDate(claim.createdAt)} />
                        </div>
                    </Section>

                    <Section title="Financials">
                        <div className="grid grid-cols-2 gap-4">
                            <Row label="Amount Requested" value={formatEth(claim.amount)} highlight />
                            <Row label="Payout Amount" value={claim.payoutAmount ? formatEth(claim.payoutAmount) : 'N/A'} />
                        </div>
                    </Section>

                    <Section title="Patient Info">
                        <div className="space-y-4">
                            <CopyRow label="Patient DID" value={claim.patientDid} onCopy={() => copyToClipboard(claim.patientDid, 'Patient DID')} />
                            <CopyRow label="Patient Address" value={claim.patientAddress} onCopy={() => copyToClipboard(claim.patientAddress, 'Patient Address')} />
                        </div>
                    </Section>

                    <Section title="Provider Info">
                        <div className="space-y-4">
                            <CopyRow label="Provider Address" value={claim.providerAddress} onCopy={() => copyToClipboard(claim.providerAddress, 'Provider Address')} />
                            <CopyRow label="Provider Wallet" value={claim.providerWallet} onCopy={() => copyToClipboard(claim.providerWallet, 'Provider Wallet')} />

                            {claim.providerVcCid && (
                                <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-100">
                                    <span className="text-xs font-bold text-blue-800 uppercase tracking-wide block mb-1">Provider Credential</span>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-blue-600 font-mono truncate mr-2">{claim.providerVcCid}</span>
                                        <a
                                            href={`https://gateway.pinata.cloud/ipfs/${claim.providerVcCid}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-700 hover:text-blue-900 text-xs font-bold flex items-center gap-1 whitespace-nowrap"
                                        >
                                            View VC ↗
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Section>

                    <Section title="Documents">
                        {(claim.fileCid || claim.medicalReportCid) ? (
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors group">
                                <div className="flex items-start gap-4">
                                    <div className="bg-white p-2 rounded border border-gray-200 text-2xl shadow-sm">
                                        📄
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">Medical Report</p>
                                        <p className="text-xs text-gray-500 mt-1 font-mono break-all">
                                            CID: {claim.fileCid || claim.medicalReportCid}
                                        </p>
                                        <a
                                            href={`https://gateway.pinata.cloud/ipfs/${claim.fileCid || claim.medicalReportCid}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 group-hover:underline"
                                        >
                                            Open Document ↗
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <span className="text-gray-400 text-2xl block mb-2">📂</span>
                                <p className="text-gray-500 text-sm">No documents attached</p>
                            </div>
                        )}
                    </Section>

                    {/* Raw JSON */}
                    <div className="border-t border-gray-200 pt-6">
                        <button
                            onClick={() => setIsJsonExpanded(!isJsonExpanded)}
                            className="flex items-center justify-between w-full text-left text-gray-700 font-semibold hover:bg-gray-50 p-2 rounded transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <span className="text-gray-400">{isJsonExpanded ? '▼' : '▶'}</span>
                                Raw Metadata (JSON)
                            </span>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Debug</span>
                        </button>
                        {isJsonExpanded && (
                            <div className="mt-2 relative">
                                <button
                                    onClick={() => copyToClipboard(JSON.stringify(claim, null, 2), 'JSON')}
                                    className="absolute top-2 right-2 text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded hover:bg-gray-600"
                                >
                                    Copy
                                </button>
                                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed shadow-inner max-h-96 overflow-y-auto">
                                    {JSON.stringify(claim, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function Section({ title, children }) {
    return (
        <div className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                {title}
            </h3>
            <div>
                {children}
            </div>
        </div>
    );
}

function Row({ label, value, highlight }) {
    return (
        <div>
            <span className="text-xs text-gray-500 block mb-1">{label}</span>
            <div className={`text-sm font-medium break-words ${highlight ? 'text-gray-900 font-bold text-lg' : 'text-gray-800'}`}>
                {value}
            </div>
        </div>
    );
}

function CopyRow({ label, value, onCopy }) {
    return (
        <div>
            <span className="text-xs text-gray-500 block mb-1">{label}</span>
            <div className="flex items-center gap-2 group">
                <div className="text-sm font-medium text-gray-700 truncate flex-1 font-mono bg-gray-50 px-3 py-2 rounded border border-gray-200">
                    {value || 'N/A'}
                </div>
                {value && (
                    <button
                        onClick={onCopy}
                        className="text-gray-400 hover:text-blue-600 p-2 rounded hover:bg-blue-50 transition-colors"
                        title="Copy to clipboard"
                    >
                        📋
                    </button>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        Submitted: 'bg-blue-100 text-blue-800',
        UnderReview: 'bg-purple-100 text-purple-800',
        UNDER_REVIEW: 'bg-purple-100 text-purple-800',
        Approved: 'bg-green-100 text-green-800',
        APPROVED: 'bg-green-100 text-green-800',
        Rejected: 'bg-red-100 text-red-800',
        REJECTED: 'bg-red-100 text-red-800',
        Paid: 'bg-green-100 text-green-800',
        PAID: 'bg-green-100 text-green-800',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
}
