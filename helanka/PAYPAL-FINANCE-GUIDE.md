# Helanka Vacations — PayPal Payment Workflow & Finance Guide

**Audience:** Finance team  
**Last updated:** June 2026  
**Currency:** All client charges are in **USD**

---

## 1. Overview: How Client Payments Work

Helanka uses a **two-stage payment model**:

| Stage | What happens | Method |
|-------|-------------|--------|
| **Stage 1 — Deposit** | Client pays a deposit to confirm their booking | PayPal (online, instant) |
| **Stage 2 — Balance** | Client pays remaining balance before travel | Bank transfer (client contacts us) |

The deposit is the only stage handled automatically through the website. The balance is collected separately via bank transfer or other arrangement.

---

## 2. Step-by-Step Payment Flow

### From the client's perspective

```
Client receives quote email
       ↓
Client opens quote review page on website
       ↓
Client clicks "Accept Quote"
       ↓
PayPal payment panel appears showing the deposit amount
       ↓
Client pays via PayPal (using their PayPal account or credit/debit card)
       ↓
Payment confirmed → booking status changes to CONFIRMED
       ↓
Client sees confirmation on screen
```

### What happens technically (behind the scenes)

```
1. Website calls PayPal API → creates a payment order (USD amount)
2. PayPal processes the client's payment
3. Funds land in Helanka's PayPal account (minus PayPal fees)
4. Website records the payment in the database (amount, currency, PayPal reference ID)
5. Booking status updates to CONFIRMED automatically
```

---

## 3. PayPal Fees — What You Actually Receive

### Fee structure for international online payments

When a client from outside Sri Lanka pays via PayPal, **two fees apply**:

| Fee | Rate |
|-----|------|
| Standard online payment fee | 3.49% of transaction |
| Fixed fee per transaction | $0.49 USD |
| Cross-border surcharge (international clients) | +1.50% |
| **Total effective fee (international client)** | **~4.99% + $0.49** |

> **Note:** Nearly all Helanka clients are international (foreign tourists), so the cross-border surcharge almost always applies.

### Example — Client pays a $500 deposit

| | |
|-|-|
| Client pays | $500.00 |
| PayPal fee (4.99%) | −$24.95 |
| Fixed fee | −$0.49 |
| **You receive in PayPal** | **$474.56** |

### Example — Client pays a $1,500 deposit

| | |
|-|-|
| Client pays | $1,500.00 |
| PayPal fee (4.99%) | −$74.85 |
| Fixed fee | −$0.49 |
| **You receive in PayPal** | **$1,424.66** |

### Quick formula for any amount

```
Net received = (Deposit amount × 0.9501) − $0.49
```

> **Important:** These rates are based on PayPal's standard business account fees as of 2025–2026. Confirm your exact rate by logging into your PayPal account → Settings → Pricing (fees may vary based on your account volume tier and country).

---

## 4. Currency — No Conversion Needed for USD Account

The website charges clients in **USD only**. The money lands in PayPal as USD.

When you transfer from PayPal to your **Sampath Bank USD (dollar) account**, **no currency conversion occurs** — it moves as USD → USD. This avoids the PayPal currency conversion fee (which adds another 3–4% if converting to LKR).

> **Recommendation:** Always withdraw to the Sampath USD account, not to an LKR account. Converting to LKR inside PayPal is expensive. Convert at Sampath if needed — bank exchange rates are better.

---

## 5. Transferring from PayPal to Sampath Bank Dollar Account

### Prerequisites (one-time setup)

1. **Sampath Bank Foreign Currency Account (USD)** — you need the account number and SWIFT details
2. **PayPal Business account** with verified bank account linked
3. Provide Sampath with these details for the incoming transfer:
   - SWIFT code: **BSAMLKLX**
   - Account number: your USD account number at Sampath
   - Account holder name (must match PayPal business name)
   - Branch name and address

### How to withdraw from PayPal to Sampath

1. Log in to [paypal.com](https://www.paypal.com)
2. Go to **Wallet** → click your USD balance
3. Click **Transfer to Bank**
4. Select your linked Sampath USD bank account
5. Enter the amount to withdraw
6. Choose transfer speed:
   - **Standard transfer** — Free, arrives in **3–5 business days**
   - *(Instant transfer not available for international bank accounts)*

> **Minimum withdrawal:** PayPal typically requires a minimum of **$1.00 USD** to withdraw. There is no stated maximum, but large withdrawals (over $10,000) may trigger additional PayPal review.

### Fees for the bank withdrawal

| Fee | Amount |
|-----|--------|
| PayPal → bank transfer fee | **Free** (standard) |
| Sampath Bank incoming wire fee | ~LKR 500–1,500 (approx. $1.50–$5 USD) — confirm with Sampath |
| **Total withdrawal cost** | Essentially free from PayPal side |

---

## 6. Complete Fee Summary (End-to-End)

### Money flow for a $1,000 deposit

```
Client pays:        $1,000.00
PayPal fee:          −$49.90  (4.99%)
Fixed fee:            −$0.49
                    ─────────
In PayPal:           $949.61

PayPal → Sampath:      $0.00  (free)
Sampath incoming:      −$2.00  (estimated, verify with Sampath)
                    ─────────
Net in Sampath:      ~$947.61
```

**Effective loss to fees: ~5.2% of the charged amount**

### Per-transaction fee table

| Deposit Amount | PayPal Fee | Fixed | Net in PayPal | Net in Sampath (est.) |
|---------------|-----------|-------|---------------|----------------------|
| $200 | $9.98 | $0.49 | $189.53 | ~$187.53 |
| $500 | $24.95 | $0.49 | $474.56 | ~$472.56 |
| $1,000 | $49.90 | $0.49 | $949.61 | ~$947.61 |
| $2,000 | $99.80 | $0.49 | $1,899.71 | ~$1,897.71 |
| $5,000 | $249.50 | $0.49 | $4,750.01 | ~$4,748.01 |

---

## 7. Accounting & Record-Keeping

### What the website records automatically

Every successful PayPal payment is saved in the database with:
- Booking ID
- Amount paid (USD)
- Currency (USD)
- PayPal transaction/capture reference ID
- Payment date and time
- Status (SUCCESS)

### What to reconcile in your accounts

For each PayPal payment, you will see two amounts:
- **Amount charged to client** — what the quote shows (this is your revenue figure)
- **Amount received in PayPal** — slightly less due to PayPal fees (this is your bank receipt)

The difference is the **PayPal transaction cost** — record this as a "payment processing fee" expense.

### PayPal transaction reports

Download monthly statements from:  
PayPal → Activity → Statements → Monthly statements (CSV/PDF)

This gives you a full list of transactions, fees deducted, and transfer amounts for the month.

---

## 8. Refund Policy Consideration

If a booking is cancelled and a refund is issued via PayPal:
- **PayPal does NOT refund the transaction fee** — you lose the ~5% even on refunded payments
- The refunded amount to the client comes from your PayPal balance
- Plan cancellation/refund policies with this in mind

---

## 9. Sri Lanka-Specific Considerations

### PayPal account requirements for Sri Lanka

- You must have a **verified PayPal Business account** registered in Sri Lanka
- Link a local bank account or the Sampath USD account for withdrawals
- PayPal has expanded withdrawal support for Sri Lanka, but confirm your account has bank withdrawal enabled

### If bank withdrawal is not available

If PayPal does not allow direct withdrawal to Sampath USD account from your account region, the common alternative used by Sri Lankan businesses is:

1. **Payoneer** intermediary: Transfer PayPal balance → Payoneer → Sampath USD account
   - Payoneer charges: ~2% for PayPal withdrawal, free bank transfer
   - Adds 3–5 days and extra fees

2. **Contact PayPal support** to confirm bank withdrawal eligibility for your account

> **Action item:** Test a small withdrawal (e.g., $10) to Sampath before relying on this for real client payments. Confirm the process works end-to-end before going live.

---

## 10. Quick Reference Checklist

### Before going live with client payments

- [ ] PayPal Business account is verified and active
- [ ] Sampath USD account linked to PayPal (or tested as withdrawal destination)
- [ ] PAYPAL_MODE is set to `live` in environment variables (not sandbox)
- [ ] Test transaction completed and verified in database
- [ ] Monthly statement download process understood

### Monthly finance routine

- [ ] Download PayPal monthly statement (CSV)
- [ ] Reconcile PayPal charges against client invoices
- [ ] Record PayPal fees as "payment processing expense"
- [ ] Transfer accumulated balance to Sampath USD account
- [ ] Note Sampath incoming wire fees for the month

---

## 11. Contacts

| | |
|-|-|
| PayPal Business support | [paypal.com/us/smarthelp/contact-us](https://www.paypal.com/us/smarthelp/contact-us) |
| PayPal Sri Lanka help | 1-888-221-1161 (international) |
| Sampath Bank SWIFT | BSAMLKLX |
| Sampath trade finance (for USD accounts) | Contact your branch relationship manager |

---

*This document is based on PayPal's published fee structure as of 2025–2026. Fees are subject to change — always verify current rates in your PayPal account dashboard before quoting clients or doing annual finance planning.*
