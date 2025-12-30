document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const CLAIM_ID = '123'; // Replace with dynamic ID
    const API_ENDPOINT = `/api/claims/${CLAIM_ID}/approve`;

    // DOM Elements
    const inputSection = document.getElementById('input-section');
    const coverageInput = document.getElementById('coverage-input');
    const approveBtn = document.getElementById('approve-btn');
    const toastContainer = document.getElementById('toast-container');

    approveBtn.addEventListener('click', handleApprove);

    async function handleApprove() {
        const amount = coverageInput.value;

        // 1. Disable UI and show spinner
        setLoading(true);
        hideToast();

        try {
            // 2. API Call
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ coverageAmount: Number(amount) })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // 3. Success Handling
                showToast(data.message || '✅ Transaction successful — coverage approved', 'success');

                if (data.transactionId) {
                    console.info(`Transaction ID: ${data.transactionId}`);
                }

                // Hide input section immediately
                inputSection.classList.add('hidden');

                // Hide toast after 3 seconds
                setTimeout(hideToast, 3000);
            } else {
                throw new Error(data.message || 'Unknown error occurred');
            }

        } catch (error) {
            // 4. Failure Handling
            showToast(`❌ Transaction failed — ${error.message}`, 'error');
            // Re-enable button is handled in finally block
        } finally {
            setLoading(false);
        }
    }

    function setLoading(isLoading) {
        if (isLoading) {
            approveBtn.disabled = true;
            approveBtn.innerHTML = '<div class="spinner"></div> Processing...';
            coverageInput.disabled = true;
        } else {
            // Only re-enable if the input section is still visible (i.e., not successful)
            if (!inputSection.classList.contains('hidden')) {
                approveBtn.disabled = false;
                approveBtn.textContent = 'Approve and Pay';
                coverageInput.disabled = false;
            }
        }
    }

    function showToast(message, type) {
        toastContainer.textContent = message;
        toastContainer.className = ''; // Reset classes
        toastContainer.classList.add(type === 'success' ? 'toast-success' : 'toast-error');
        toastContainer.style.display = 'block';
    }

    function hideToast() {
        toastContainer.style.display = 'none';
    }
});
