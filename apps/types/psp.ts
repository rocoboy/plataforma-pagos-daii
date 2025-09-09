import { ID } from "./common";
import { PaymentProvider } from "./providers";

export type PSPApproveDecline = {
  payment_id: ID;             
  provider: PaymentProvider;  
  action: "approve" | "decline";
  reason?: string;            
};


export type PSPProcessRefund = {
  refund_id: ID;
  provider: PaymentProvider;
  action: "process" | "fail";
  reason?: string;            
};

export type PSPActionResult = {
  ok: boolean;
  message?: string;
};
