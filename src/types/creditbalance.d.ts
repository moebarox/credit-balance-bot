type Billing = {
  _id?: string | MongoObjectID;
  key: string;
  billingDate: number;
  billingAmount: number;
  adminId: number;
  groupId: number | MongoNumberLong;
  members?: BillingMember[];
};

type BillingMember = {
  billingId?: string | MongoObjectID;
  username: string;
  balance: number;
};

type BillingUpdateFailed = {
  username: string;
  code: string;
};

type BillingUpdateResult = {
  success: BillingMember[];
  failed: BillingUpdateFailed[];
};
