export const AgentRole = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  AGENT: 'AGENT',
} as const;
export type AgentRole = typeof AgentRole[keyof typeof AgentRole];

export const PropertyType = {
  APARTMENT: 'APARTMENT',
  HOUSE: 'HOUSE',
  STUDIO: 'STUDIO',
  LOFT: 'LOFT',
  OTHER: 'OTHER',
} as const;
export type PropertyType = typeof PropertyType[keyof typeof PropertyType];

export const PropertyStatus = {
  AVAILABLE: 'AVAILABLE',
  RENTED: 'RENTED',
  MAINTENANCE: 'MAINTENANCE',
  RESERVED: 'RESERVED',
  OFF_MARKET: 'OFF_MARKET',
} as const;
export type PropertyStatus = typeof PropertyStatus[keyof typeof PropertyStatus];

export const PayCycle = {
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  HALF_YEARLY: 'HALF_YEARLY',
  YEARLY: 'YEARLY',
} as const;
export type PayCycle = typeof PayCycle[keyof typeof PayCycle];

export const LeaseStatus = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  TERMINATED: 'TERMINATED',
  PENDING: 'PENDING',
} as const;
export type LeaseStatus = typeof LeaseStatus[keyof typeof LeaseStatus];

export const PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  PARTIAL: 'PARTIAL',
  WAIVED: 'WAIVED',
} as const;
export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export const MaintenanceType = {
  PLUMBING: 'PLUMBING',
  ELECTRICAL: 'ELECTRICAL',
  HVAC: 'HVAC',
  APPLIANCE: 'APPLIANCE',
  STRUCTURAL: 'STRUCTURAL',
  PEST_CONTROL: 'PEST_CONTROL',
  CLEANING: 'CLEANING',
  OTHER: 'OTHER',
} as const;
export type MaintenanceType = typeof MaintenanceType[keyof typeof MaintenanceType];

export const MaintenanceStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type MaintenanceStatus = typeof MaintenanceStatus[keyof typeof MaintenanceStatus];

export const ServiceType = {
  CONSULTATION: 'CONSULTATION',
  COMPLAINT: 'COMPLAINT',
  WORK_ORDER: 'WORK_ORDER',
  FEEDBACK: 'FEEDBACK',
  VISIT_RECORD: 'VISIT_RECORD',
  CALL_RECORD: 'CALL_RECORD',
  CHAT_RECORD: 'CHAT_RECORD',
  FORM_SUBMISSION: 'FORM_SUBMISSION',
} as const;
export type ServiceType = typeof ServiceType[keyof typeof ServiceType];

export const ServiceChannel = {
  PHONE: 'PHONE',
  ONLINE_CHAT: 'ONLINE_CHAT',
  WEBSITE: 'WEBSITE',
  APP: 'APP',
  WECHAT: 'WECHAT',
  EMAIL: 'EMAIL',
  WALK_IN: 'WALK_IN',
  OTHER: 'OTHER',
} as const;
export type ServiceChannel = typeof ServiceChannel[keyof typeof ServiceChannel];

export const ConsultCategory = {
  RENTAL_INFO: 'RENTAL_INFO',
  PROPERTY_VIEWING: 'PROPERTY_VIEWING',
  LEASE_TERMS: 'LEASE_TERMS',
  PAYMENT: 'PAYMENT',
  MAINTENANCE: 'MAINTENANCE',
  MOVE_IN_OUT: 'MOVE_IN_OUT',
  POLICY: 'POLICY',
  OTHER: 'OTHER',
} as const;
export type ConsultCategory = typeof ConsultCategory[keyof typeof ConsultCategory];

export const ConsultStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;
export type ConsultStatus = typeof ConsultStatus[keyof typeof ConsultStatus];

export const Priority = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;
export type Priority = typeof Priority[keyof typeof Priority];

export const ComplaintCategory = {
  RENT_ISSUE: 'RENT_ISSUE',
  MAINTENANCE_ISSUE: 'MAINTENANCE_ISSUE',
  NOISE_COMPLAINT: 'NOISE_COMPLAINT',
  SAFETY_CONCERN: 'SAFETY_CONCERN',
  SERVICE_QUALITY: 'SERVICE_QUALITY',
  BILLING_ERROR: 'BILLING_ERROR',
  LEASE_DISPUTE: 'LEASE_DISPUTE',
  OTHER: 'OTHER',
} as const;
export type ComplaintCategory = typeof ComplaintCategory[keyof typeof ComplaintCategory];

export const ComplaintType = {
  FORMAL: 'FORMAL',
  INFORMAL: 'INFORMAL',
} as const;
export type ComplaintType = typeof ComplaintType[keyof typeof ComplaintType];

export const ComplaintStatus = {
  RECEIVED: 'RECEIVED',
  UNDER_INVESTIGATION: 'UNDER_INVESTIGATION',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  ESCALATED: 'ESCALATED',
} as const;
export type ComplaintStatus = typeof ComplaintStatus[keyof typeof ComplaintStatus];

export const ResponsibleParty = {
  LANDLORD: 'LANDLORD',
  TENANT: 'TENANT',
  MANAGEMENT: 'MANAGEMENT',
  MAINTENANCE_TEAM: 'MAINTENANCE_TEAM',
  THIRD_PARTY: 'THIRD_PARTY',
  UNCLEAR: 'UNCLEAR',
} as const;
export type ResponsibleParty = typeof ResponsibleParty[keyof typeof ResponsibleParty];

export const WorkOrderType = {
  MAINTENANCE: 'MAINTENANCE',
  COMPLAINT_FOLLOWUP: 'COMPLAINT_FOLLOWUP',
  INSPECTION: 'INSPECTION',
  MOVE_IN: 'MOVE_IN',
  MOVE_OUT: 'MOVE_OUT',
  COLLECTION: 'COLLECTION',
  OTHER: 'OTHER',
} as const;
export type WorkOrderType = typeof WorkOrderType[keyof typeof WorkOrderType];

export const WorkOrderCategory = {
  PLUMBING: 'PLUMBING',
  ELECTRICAL: 'ELECTRICAL',
  HVAC: 'HVAC',
  APPLIANCE: 'APPLIANCE',
  STRUCTURAL: 'STRUCTURAL',
  PEST_CONTROL: 'PEST_CONTROL',
  CLEANING: 'CLEANING',
  PAINTING: 'PAINTING',
  KEY_MANAGEMENT: 'KEY_MANAGEMENT',
  DOCUMENTATION: 'DOCUMENTATION',
  OTHER: 'OTHER',
} as const;
export type WorkOrderCategory = typeof WorkOrderCategory[keyof typeof WorkOrderCategory];

export const WorkOrderStatus = {
  CREATED: 'CREATED',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  PENDING_PARTS: 'PENDING_PARTS',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  RESOLVED: 'RESOLVED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  ESCALATED: 'ESCALATED',
} as const;
export type WorkOrderStatus = typeof WorkOrderStatus[keyof typeof WorkOrderStatus];

export const FeedbackResult = {
  SATISFIED: 'SATISFIED',
  NEUTRAL: 'NEUTRAL',
  DISSATISFIED: 'DISSATISFIED',
  NO_RESPONSE: 'NO_RESPONSE',
} as const;
export type FeedbackResult = typeof FeedbackResult[keyof typeof FeedbackResult];

import { z } from 'zod';

export function zEnum(values: Record<string, string>) {
  return z.enum(Object.values(values) as [string, ...string[]]);
}
