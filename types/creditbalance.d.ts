type Billing = {
  key: string;
  billingDate: number;
  billingAmount: number;
  adminId: number;
  groupId: number;
  members?: BillingMember[];
}

type BillingMember = {
  billingId?: string;
  username: string;
  balance: number;
}
