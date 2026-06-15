/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Tag, MapPin, Calendar, Clock, BadgeCheck, Loader2, ArrowUpRight, Ban, Building } from 'lucide-react';
import { LostItem, VerificationClaim, User } from '../types';

interface HistoryScreenProps {
  currentUser: User;
  items: LostItem[];
  claims: VerificationClaim[];
}

export default function HistoryScreen({ currentUser, items, claims }: HistoryScreenProps) {
  const [historyTab, setHistoryTab] = useState<'reports' | 'claims'>('reports');

  // Filter items reported by this user
  const myReports = items.filter(item => item.reporterId === currentUser.id);

  // Filter claims filed by this user
  const myClaims = claims.filter(claim => claim.claimantId === currentUser.id);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'resolved':
        return { text: 'Resolved', css: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'pending':
        return { text: 'Admin Reviewing', css: 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse' };
      case 'found':
        return { text: 'Found Post', css: 'bg-[#CCFBF1] text-[#115E59] border-[#CCFBF1]' };
      case 'lost':
      default:
        return { text: 'Lost Alert', css: 'bg-[#FFEDD5] text-[#9A3412] border-[#FFEDD5]' };
    }
  };

  const getClaimStatusDisplay = (status: string) => {
    switch (status) {
      case 'approved':
        return { text: 'Approved Release', css: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'rejected':
        return { text: 'Declined', css: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'pending':
      default:
        return { text: 'Pending Verification', css: 'bg-blue-100 text-blue-800 border-blue-300' };
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-3xl font-extrabold text-[#00236f] tracking-tight mb-1">My History</h2>
        <p className="text-sm text-[#444651]">Track the status of your reported items and ownership claims in real-time.</p>
      </div>

      {/* Selector Sub headers */}
      <div className="flex border-b border-[#c5c5d3]/40">
        <button
          onClick={() => setHistoryTab('reports')}
          className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-all outline-none ${
            historyTab === 'reports' ? 'text-[#00236f] border-[#00236f]' : 'text-gray-400 border-transparent hover:text-gray-600'
          }`}
        >
          My Reported Items ({myReports.length})
        </button>
        <button
          onClick={() => setHistoryTab('claims')}
          className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-all outline-none ${
            historyTab === 'claims' ? 'text-[#00236f] border-[#00236f]' : 'text-gray-400 border-transparent hover:text-gray-600'
          }`}
        >
          My Filed Claims ({myClaims.length})
        </button>
      </div>

      {historyTab === 'reports' ? (
        <div className="space-y-4">
          {myReports.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-8">
              <Tag className="w-12 h-12 text-[#90a8ff] mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#191c1e] mb-1 font-sans">No Reported Items</p>
              <p className="text-xs text-gray-500">You haven't reported any lost or found items yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myReports.map((report) => {
                const stat = getStatusDisplay(report.status);
                return (
                  <div
                    key={report.id}
                    className="bg-white rounded-2xl border border-[#c5c5d3]/30 p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-xs hover:border-[#00236f]/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        className="w-16 h-16 rounded-xl object-cover shrink-0 bg-gray-100"
                        src={report.image}
                        alt={report.name}
                      />
                      <div>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full ${stat.css}`}>
                          {stat.text}
                        </span>
                        <h4 className="font-bold text-base text-[#00236f] mt-1">{report.name}</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500 font-medium">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-red-500" />
                            {report.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {report.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex flex-row md:flex-col gap-2 items-center md:items-end w-full md:w-auto shrink-0 border-t md:border-t-0 pt-3 md:pt-0 mt-2 md:mt-0">
                      <span className="text-[11px] font-semibold text-[#444651]/80 bg-[#eceef0] px-2.5 py-1 rounded-lg">
                        Case: {report.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {myClaims.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-8">
              <BadgeCheck className="w-12 h-12 text-[#90a8ff] mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#191c1e] mb-1">No Claims Filed</p>
              <p className="text-xs text-gray-500">Found something in listings that resides in your pocket? Submit a Claim on Dashboard!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myClaims.map((claim) => {
                const badge = getClaimStatusDisplay(claim.status);
                return (
                  <div
                    key={claim.id}
                    className="bg-white rounded-2xl border border-[#c5c5d3]/30 p-5 space-y-4 shadow-2xs hover:border-[#00236f]/30 transition-all"
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap border-b border-gray-50 pb-3">
                      <div className="flex items-center gap-3">
                        <img
                          className="w-12 h-12 rounded-lg object-cover shrink-0 bg-gray-100"
                          src={claim.itemImage}
                          alt={claim.itemName}
                        />
                        <div>
                          <h4 className="font-bold text-base text-[#00236f]">{claim.itemName}</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Claim submitted {claim.timestamp}</p>
                        </div>
                      </div>
                      
                      <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 border rounded-lg ${badge.css}`}>
                        {badge.text}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block mb-1">Your Submitted Proof of Ownership:</span>
                      <p className="italic">"{claim.description}"</p>
                    </div>

                    {/* Conditional details on where/how to claim */}
                    {claim.status === 'approved' && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs space-y-1.5">
                        <p className="font-bold flex items-center gap-1 text-emerald-900">
                          <BadgeCheck className="w-4 h-4 shrink-0 text-[#006a61]" />
                          Ready for Release pickup!
                        </p>
                        <p className="flex items-center gap-1.5 font-medium">
                          <Building className="w-3.5 h-3.5 shrink-0" />
                          Please visit the **Campus Security Main Office (Room 102, Administrative Block)** between 9 AM and 5 PM with your physical student ID card to officially retrieve your item.
                        </p>
                      </div>
                    )}

                    {claim.status === 'rejected' && (
                      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs flex items-start gap-1.5">
                        <Ban className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-rose-900">Validation Unsuccessful</p>
                          <p className="font-medium">The provided identifiers did not securely map key item factors. Please visit the student office or submit an updated verification dispute with serial counts.</p>
                        </div>
                      </div>
                    )}

                    {claim.status === 'pending' && (
                      <p className="text-[11px] text-[#444651]/80 flex items-center gap-1.5 font-semibold">
                        <Loader2 className="w-3.5 h-3.5 text-[#00236f] animate-spin shrink-0" />
                        Administrator is actively verifying matching points. Watch notifications stream!
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
