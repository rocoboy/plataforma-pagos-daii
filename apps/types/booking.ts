import type { ID, WithTimestamps } from "./common";

export type BookingStatus =
  | "CREATED"          
  | "PENDING_PAYMENT"  
  | "CONFIRMED"        
  | "CANCELLED";       

export type Booking = WithTimestamps & {
  id: ID;        
  user_id: ID;
  status: BookingStatus;
  
};
