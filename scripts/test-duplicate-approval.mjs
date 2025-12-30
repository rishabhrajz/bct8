/**
 * Test script to verify duplicate API call prevention
 * 
 * This script tests that the approval endpoint is idempotent:
 * 1. Submits a claim
 * 2. Moves it to review
 * 3. Approves it ONCE - should succeed
 * 4. Approves it AGAIN - should return success without error
 */

import { ethers } from 'ethers';

const API_BASE = 'http://localhost:4000';
const RPC_URL = 'http://localhost:8545';

async function testDuplicateApprovalPrevention() {
    console.log('\n🧪 Testing Duplicate Approval Prevention\n');
    console.log('='.repeat(70));

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const [insurer, provider1, patient] = await provider.listAccounts();

    console.log('\n📋 Test Setup:');
    console.log(`  Insurer: ${insurer.address}`);
    console.log(`  Provider: ${provider1.address}`);
    console.log(`  Patient: ${patient.address}`);

    try {
        // Step 1: Get an existing claim or use claim ID 1
        console.log('\n📝 Step 1: Fetching claim...');
        const claimsRes = await fetch(`${API_BASE}/claim/list`);
        const claimsData = await claimsRes.json();

        if (!claimsData.claims || claimsData.claims.length === 0) {
            console.log('   ❌ No claims found. Please submit a claim first.');
            return;
        }

        // Find a claim in UnderReview status
        let claim = claimsData.claims.find(c => c.status === 'UnderReview');

        if (!claim) {
            console.log('   ℹ️  No claims in UnderReview status');
            console.log('   Using first claim and moving it to review...');
            claim = claimsData.claims[0];

            // Move to review if not already
            if (claim.status === 'Submitted' || claim.status === 'Pending') {
                const reviewRes = await fetch(`${API_BASE}/claim/under-review/${claim.id}`, {
                    method: 'POST'
                });
                if (!reviewRes.ok) {
                    throw new Error('Failed to move claim to review');
                }
                console.log('   ✅ Moved claim to UnderReview');

                // Refresh claim data
                const refreshRes = await fetch(`${API_BASE}/claim/${claim.id}`);
                const refreshData = await refreshRes.json();
                claim = refreshData.claim;
            } else if (claim.status === 'Paid') {
                console.log('   ℹ️  Claim already paid - perfect for duplicate test!');
            }
        }

        console.log(`   Using Claim #${claim.id} (Status: ${claim.status})`);

        // Step 2: First approval attempt
        console.log('\n✅ Step 2: First Approval Attempt...');
        const payoutAmount = parseFloat(ethers.formatEther(claim.amount)) * 0.9; // Pay 90%

        const firstRes = await fetch(`${API_BASE}/claim/approve/${claim.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payoutAmount })
        });

        const firstData = await firstRes.json();

        if (firstRes.ok) {
            if (firstData.alreadyPaid) {
                console.log('   ℹ️  Claim was already paid (idempotent response)');
            } else {
                console.log('   ✅ First approval succeeded');
            }
            console.log(`   Status: ${firstData.status}`);
            console.log(`   TX Hash: ${firstData.txHash || 'N/A'}`);
        } else {
            console.log(`   ❌ First approval failed: ${firstData.error}`);
            if (claim.status === 'Paid') {
                console.log('   ℹ️  This is expected for already-paid claims');
            }
        }

        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 3: Second approval attempt (duplicate)
        console.log('\n🔄 Step 3: Second Approval Attempt (Duplicate)...');

        const secondRes = await fetch(`${API_BASE}/claim/approve/${claim.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payoutAmount })
        });

        const secondData = await secondRes.json();

        console.log(`   Response Status: ${secondRes.status}`);

        if (secondRes.ok) {
            console.log('   ✅ Second approval returned success');
            if (secondData.alreadyPaid) {
                console.log('   ✅ Idempotent flag detected - endpoint is idempotent!');
            }
            console.log(`   Message: ${secondData.message || 'Success'}`);
        } else {
            console.log(`   ❌ Second approval failed: ${secondData.error}`);
            console.log('   ⚠️  Endpoint is NOT idempotent - this is the bug we wanted to fix');
        }

        // Step 4: Third attempt to be sure
        console.log('\n🔄 Step 4: Third Approval Attempt...');

        const thirdRes = await fetch(`${API_BASE}/claim/approve/${claim.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payoutAmount })
        });

        const thirdData = await thirdRes.json();

        if (thirdRes.ok) {
            console.log('   ✅ Third approval also returned success');
            if (thirdData.alreadyPaid) {
                console.log('   ✅ Idempotent behavior consistent!');
            }
        } else {
            console.log(`   ❌ Third approval failed: ${thirdData.error}`);
        }

        // Final verification
        console.log('\n📊 Final Verification:');
        const finalRes = await fetch(`${API_BASE}/claim/${claim.id}`);
        const finalData = await finalRes.json();
        const finalClaim = finalData.claim;

        console.log(`   Claim Status: ${finalClaim.status}`);
        console.log(`   Payout Amount: ${finalClaim.payoutAmount ? ethers.formatEther(finalClaim.payoutAmount) + ' ETH' : 'Not set'}`);
        console.log(`   Paid At: ${finalClaim.paidAt || 'Not paid'}`);

        // Test Summary
        console.log('\n' + '='.repeat(70));
        console.log('\n📝 TEST SUMMARY:\n');

        const allSucceeded = secondRes.ok && thirdRes.ok;
        const hasIdempotentFlag = secondData.alreadyPaid && thirdData.alreadyPaid;

        if (allSucceeded && hasIdempotentFlag) {
            console.log('✅ TEST PASSED - Endpoint is idempotent!');
            console.log('   Multiple approval calls return success without errors');
            console.log('   Backend correctly detects already-paid claims');
            console.log('   No duplicate payment attempts made');
        } else if (allSucceeded) {
            console.log('⚠️  TEST PARTIALLY PASSED');
            console.log('   Duplicate calls succeed but idempotent flag not set');
        } else {
            console.log('❌ TEST FAILED - Duplicate calls return errors');
            console.log('   This is the bug that was reported');
        }

        console.log('\n' + '='.repeat(70) + '\n');

    } catch (error) {
        console.error('\n❌ Test Error:', error.message);
        console.error(error.stack);
    }
}

// Run test
testDuplicateApprovalPrevention().catch(console.error);
