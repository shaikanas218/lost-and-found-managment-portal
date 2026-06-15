/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'student' | 'admin';

export interface User {
  id: string; // matches studentId
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  password?: string;
}

export type ItemType = 'lost' | 'found';
export type ItemStatus = 'lost' | 'found' | 'pending' | 'resolved';

export interface LostItem {
  id: string;
  type: ItemType;
  name: string;
  category: string;
  location: string;
  date: string;
  description: string;
  image: string;
  reporterId: string;
  reporterName: string;
  contactNo?: string;
  status: ItemStatus;
  claimedByUserId?: string;
  createdAt: string;
}

export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export interface VerificationClaim {
  id: string;
  itemId: string;
  itemName: string;
  itemImage: string;
  claimantId: string;
  claimantName: string;
  claimantStudentId: string;
  description: string; // The proof provided
  timestamp: string;
  status: ClaimStatus;
  locationMatch?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'alert';
  isRead: boolean;
  timestamp: string;
}
