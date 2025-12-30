import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClaimApproval from './ClaimApproval';

// Mock fetch
global.fetch = jest.fn();

describe('ClaimApproval Component', () => {
    const mockClaimId = '123';
    const mockInitialCoverage = 1000;

    beforeEach(() => {
        fetch.mockClear();
    });

    test('renders correctly with initial state', () => {
        render(<ClaimApproval claimId={mockClaimId} initialCoverage={mockInitialCoverage} />);

        expect(screen.getByLabelText(/Coverage Amount/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockInitialCoverage)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Approve and Pay/i })).toBeInTheDocument();
    });

    test('handles successful approval correctly', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, message: 'Success', transactionId: 'tx123' }),
        });

        render(<ClaimApproval claimId={mockClaimId} initialCoverage={mockInitialCoverage} />);

        const button = screen.getByRole('button', { name: /Approve and Pay/i });
        fireEvent.click(button);

        // Check loading state
        expect(screen.getByText(/Processing/i)).toBeInTheDocument();
        expect(button).toBeDisabled();

        // Wait for success state
        await waitFor(() => {
            expect(screen.getByText(/✅ Transaction successful/i)).toBeInTheDocument();
        });

        // Check input and button are hidden
        expect(screen.queryByLabelText(/Coverage Amount/i)).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Approve and Pay/i })).not.toBeInTheDocument();
    });

    test('handles failure correctly', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ success: false, message: 'Insufficient funds' }),
        });

        render(<ClaimApproval claimId={mockClaimId} initialCoverage={mockInitialCoverage} />);

        const button = screen.getByRole('button', { name: /Approve and Pay/i });
        fireEvent.click(button);

        // Wait for error toast
        await waitFor(() => {
            expect(screen.getByText(/❌ Transaction failed — Insufficient funds/i)).toBeInTheDocument();
        });

        // Check input and button are still visible and enabled
        expect(screen.getByLabelText(/Coverage Amount/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Approve and Pay/i })).toBeEnabled();
    });
});
