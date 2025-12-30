# Claim Approval Feature

This package contains the frontend implementation for the Claim Approval feature, including both a React component and a Vanilla JS version.

## Files

1.  `ClaimApproval.jsx`: React functional component.
2.  `ClaimApproval.test.jsx`: Unit tests for the React component.
3.  `claim-approval-vanilla.html`: HTML template for Vanilla JS implementation.
4.  `claim-approval-vanilla.js`: Logic for Vanilla JS implementation.

## Integration Instructions

### React Integration

1.  Copy `ClaimApproval.jsx` to your components directory (e.g., `src/components/ClaimApproval.jsx`).
2.  Import and use it in your page (e.g., `InsurerDashboard.jsx`):

```jsx
import ClaimApproval from '../components/ClaimApproval';

// Inside your component
<ClaimApproval claimId={selectedClaim.id} initialCoverage={selectedClaim.coverage} />
```

### API Configuration

Ensure your backend provides the following endpoint:

-   **URL**: `/api/claims/{claimId}/approve`
-   **Method**: `POST`
-   **Body**: `{ "coverageAmount": <number> }`
-   **Response**:
    -   Success: `{ "success": true, "message": "Optional success message", "transactionId": "Optional ID" }`
    -   Failure: `{ "success": false, "message": "Error description" }`

### Vanilla JS Integration

1.  Include the HTML structure from `claim-approval-vanilla.html` in your page.
2.  Include the script `claim-approval-vanilla.js`.
3.  Update the `CLAIM_ID` variable in the script or pass it dynamically.

## Testing

### React Tests

Run the tests using Jest:

```bash
npm test src/components/ClaimApproval.test.jsx
```

### Vanilla JS Testing (Cypress)

To test the Vanilla JS implementation with Cypress:

```javascript
describe('Claim Approval Vanilla', () => {
  it('approves claim successfully', () => {
    cy.visit('/path/to/claim-approval-vanilla.html');
    
    cy.intercept('POST', '/api/claims/*/approve', {
      statusCode: 200,
      body: { success: true, message: 'Approved' }
    }).as('approveClaim');

    cy.get('#coverage-input').type('5000');
    cy.get('#approve-btn').click();

    cy.wait('@approveClaim');
    
    cy.get('#toast-container').should('contain', 'Transaction successful');
    cy.get('#input-section').should('have.class', 'hidden');
  });
});
```
