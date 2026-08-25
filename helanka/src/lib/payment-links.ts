export interface PaymentCustomer {
  id: string;
  name: string;
  amount: number;
  currency: string;
  description: string;
  cybersourceUrl: string;
  notifyEmails: string[];
}

const customers: Record<string, PaymentCustomer> = {
  "HLK-TEST-001": {
    id: "HLK-TEST-001",
    name: "Sehan Ranasinghe",
    amount: 1.0,
    currency: "USD",
    description: "Test Payment",
    cybersourceUrl:
      "https://ebc2.cybersource.com/ebc2/invoicing/payInvoice/zdosuAWWshwQOFDgXAfPsMkLj6F0jwP14T48xOQGB3nLm8lSa9lQ55wxVJd6HKnr?version=v2.1",
    notifyEmails: ["fin3@mendisone.com", "financemgr@mendisone.com", "mgrtours@helanka.co"],
  },
  "HLVOJ2608009-00": {
    id: "HLVOJ2608009-00",
    name: "Jason Gelineau",
    amount: 160.0,
    currency: "USD",
    description: "Transfer from Kandy to Koggala — Invoice HLVOJ2608000715",
    cybersourceUrl:
      "https://ebc2.cybersource.com/ebc2/invoicing/payInvoice/lwWbIKLHZv8MFH72lN13cttgiZ3cbPB0ujq2vK8svyyw0aJBXk976tp3CWQqJdyw?version=v2.1",
    notifyEmails: ["fin3@mendisone.com", "financemgr@mendisone.com", "mgrtours@helanka.co"],
  },
};

export function getPaymentCustomer(
  customerId: string,
): PaymentCustomer | null {
  return customers[customerId] ?? null;
}
