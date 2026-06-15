/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, MapPin, Tag, Clock, Calendar, Info, Plus, ChevronRight, User as UserIcon, Sparkles, HelpCircle, Phone } from 'lucide-react';
import { LostItem, User } from '../types';

interface DashboardScreenProps {
  items: LostItem[];
  currentUser: User;
  onClaimItem: (itemId: string, itemName: string, itemImage: string, proof: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  myClaims: string[]; // itemIds already claimed
  onNewReportWithType?: (type: 'lost' | 'found') => void;
}

export default function DashboardScreen({ items, currentUser, onClaimItem, activeTab, setActiveTab, myClaims, onNewReportWithType }: DashboardScreenProps) {

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'lost' | 'found' | 'pending'>('all');
  const [selectedItem, setSelectedItem] = useState<LostItem | null>(null);
  const [claimProof, setClaimProof] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSubmitted, setClaimSubmitted] = useState(false);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedFilter === 'all') return matchesSearch;
    return item.status === selectedFilter && matchesSearch;
  });

  const handleOpenItem = (item: LostItem) => {
    setSelectedItem(item);
    setClaimProof('');
    setIsClaiming(false);
    setClaimSubmitted(false);
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimProof.trim()) {
      alert('Please fill out details proving your ownership.');
      return;
    }
    if (selectedItem) {
      onClaimItem(selectedItem.id, selectedItem.name, selectedItem.image, claimProof);
      setClaimSubmitted(true);
      setTimeout(() => {
        setSelectedItem(null);
        setIsClaiming(false);
      }, 2000);
    }
  };

  // Get status badge styles
  const getBadgeStyles = (status: string) => {
    switch (status) {
      case 'found':
        return 'bg-[#CCFBF1] text-[#115E59]';
      case 'lost':
        return 'bg-[#FFEDD5] text-[#9A3412]';
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800';
      case 'pending':
      default:
        return 'bg-[#F1F5F9] text-[#475569]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Recovery Desk Action Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3" id="recovery-action-desk">
        {/* Lost Item Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 hover:from-amber-100/70 hover:to-orange-100/50 border-2 border-dashed border-amber-200 hover:border-amber-400 rounded-2xl p-4.5 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5 group flex flex-col justify-between relative overflow-hidden" id="quick-lost-card">
          <div className="absolute -right-6 -top-6 w-20 h-20 bg-amber-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/10 transition-all duration-300"></div>
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="p-2 bg-amber-500/10 text-amber-800 rounded-lg font-bold flex items-center justify-center group-hover:scale-105 group-hover:rotate-3 transition-transform">
                <HelpCircle className="w-5.5 h-5.5 text-amber-700" />
              </span>
              <span className="text-[9px] bg-amber-500/10 text-amber-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
                Active Lost Desk
              </span>
            </div>
            
            <h3 className="text-base font-extrabold text-[#191c1e] tracking-tight mb-1">
              I Lost Something
            </h3>
            <p className="text-[11px] text-[#444651] leading-relaxed mb-3 max-w-sm opacity-90">
              Lost keys, ID, companion device, or personal stationery? File an official bulletin to dispatch automated alerts.
            </p>

            {/* Visual Process Steps */}
            <div className="mb-4 p-2.5 bg-amber-500/5 rounded-xl border border-amber-500/10 select-none">
              <span className="text-[8px] font-extrabold uppercase tracking-widest text-amber-850 block mb-1.5">
                4-Step Bulletins Process Flow
              </span>
              <div className="grid grid-cols-4 gap-1 text-[8px] font-bold text-center">
                <div className="space-y-0.5">
                  <div className="h-0.5 bg-amber-500 rounded-full"></div>
                  <span className="text-amber-800 font-extrabold block">Step 1</span>
                  <p className="text-[7px] text-[#444651] leading-none font-medium">File Report</p>
                </div>
                <div className="space-y-0.5">
                  <div className="h-0.5 bg-amber-400 rounded-full opacity-60"></div>
                  <span className="text-amber-700 block">Step 2</span>
                  <p className="text-[7px] text-[#444651] leading-none font-medium">Verify Spot</p>
                </div>
                <div className="space-y-0.5">
                  <div className="h-0.5 bg-amber-350 rounded-full opacity-40"></div>
                  <span className="text-amber-650 block">Step 3</span>
                  <p className="text-[7px] text-[#444651] leading-none font-medium">Attach Info</p>
                </div>
                <div className="space-y-0.5">
                  <div className="h-0.5 bg-amber-300 rounded-full opacity-20"></div>
                  <span className="text-amber-600 block">Step 4</span>
                  <p className="text-[7px] text-[#444651] leading-none font-medium">Match Scan</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2.5 border-t border-amber-250/30">
            <button
              onClick={() => {
                if (onNewReportWithType) {
                  onNewReportWithType('lost');
                } else {
                  setActiveTab('report');
                }
              }}
              className="flex-1 h-9 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] rounded-lg shadow-sm active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              id="btn-report-lost-main"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              Report Lost Item
            </button>
            <button
              onClick={() => setSelectedFilter('lost')}
              className={`h-9 px-3 text-[11px] font-bold rounded-lg transition-all border shrink-0 cursor-pointer flex items-center justify-center gap-1 ${
                selectedFilter === 'lost'
                  ? 'bg-amber-700 text-white border-amber-700 shadow-sm'
                  : 'bg-white text-amber-700 border-amber-250 hover:bg-amber-100/20'
              }`}
              id="btn-filter-lost-only"
            >
              Filter Lost ({items.filter(i => i.status === 'lost').length})
            </button>
          </div>
        </div>

        {/* Found Item Card */}
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50/60 hover:from-teal-100/70 hover:to-emerald-100/50 border-2 border-dashed border-teal-200 hover:border-teal-400 rounded-2xl p-4.5 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/5 group flex flex-col justify-between relative overflow-hidden" id="quick-found-card">
          <div className="absolute -right-6 -top-6 w-20 h-20 bg-teal-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-teal-500/10 transition-all duration-300"></div>
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="p-2 bg-teal-500/10 text-teal-800 rounded-lg font-bold flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                <Sparkles className="w-5.5 h-5.5 text-teal-700" />
              </span>
              <span className="text-[9px] bg-teal-500/10 text-teal-850 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
                Samaritan Desk
              </span>
            </div>
            
            <h3 className="text-base font-extrabold text-[#191c1e] tracking-tight mb-1">
              I Found Something
            </h3>
            <p className="text-[11px] text-[#444651] leading-relaxed mb-3 max-w-sm opacity-90">
              Spotted a wallet, earbud, textbook, or keys left in an amphitheater? Log it here for verification!
            </p>

            {/* Visual Process Steps */}
            <div className="mb-4 p-2.5 bg-teal-500/5 rounded-xl border border-teal-500/10 select-none">
              <span className="text-[8px] font-extrabold uppercase tracking-widest text-teal-850 block mb-1.5">
                4-Step Samaritan Process Flow
              </span>
              <div className="grid grid-cols-4 gap-1 text-[8px] font-bold text-center">
                <div className="space-y-0.5">
                  <div className="h-0.5 bg-teal-600 rounded-full"></div>
                  <span className="text-teal-800 font-extrabold block">Step 1</span>
                  <p className="text-[7px] text-[#444651] leading-none font-medium">Log Finding</p>
                </div>
                <div className="space-y-0.5">
                  <div className="h-0.5 bg-teal-500 rounded-full opacity-60"></div>
                  <span className="text-teal-700 block">Step 2</span>
                  <p className="text-[7px] text-[#444651] leading-none font-medium">Safe Deposit</p>
                </div>
                <div className="space-y-0.5">
                  <div className="h-0.5 bg-teal-400 rounded-full opacity-40"></div>
                  <span className="text-teal-600 block">Step 3</span>
                  <p className="text-[7px] text-[#444651] leading-none font-medium">Claim Check</p>
                </div>
                <div className="space-y-0.5">
                  <div className="h-0.5 bg-teal-300 rounded-full opacity-20"></div>
                  <span className="text-teal-500/70 block">Step 4</span>
                  <p className="text-[7px] text-[#444651] leading-none font-medium">Award Points</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2.5 border-t border-teal-250/30">
            <button
              onClick={() => {
                if (onNewReportWithType) {
                  onNewReportWithType('found');
                } else {
                  setActiveTab('report');
                }
              }}
              className="flex-1 h-9 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-[11px] rounded-lg shadow-sm active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              id="btn-report-found-main"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              Report Found Item
            </button>
            <button
              onClick={() => setSelectedFilter('found')}
              className={`h-9 px-3 text-[11px] font-bold rounded-lg transition-all border shrink-0 cursor-pointer flex items-center justify-center gap-1 ${
                selectedFilter === 'found'
                  ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                  : 'bg-white text-teal-700 border-teal-250 hover:bg-teal-100/20'
              }`}
              id="btn-filter-found-only"
            >
              Filter Found ({items.filter(i => i.status === 'found').length})
            </button>
          </div>
        </div>
      </section>

      {/* Search and filter action deck */}
      <section className="flex flex-col gap-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400 group-focus-within:text-[#00236f] transition-all" />
          </div>
          <input
            type="text"
            className="w-full bg-[#ffffff] border border-[#c5c5d3] rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-[#00236f]/20 focus:border-[#00236f] transition-all text-sm font-medium shadow-sm outline-none"
            placeholder="Search for lost items (e.g. 'Blue Wallet', 'iPad', 'Keys')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Categories / State Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          {(['all', 'lost', 'found', 'pending'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all capitalize whitespace-nowrap ${
                selectedFilter === filter
                  ? 'bg-[#00236f] text-white shadow-md'
                  : 'bg-[#eceef0] text-[#444651] hover:bg-[#e0e3e5]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      {/* Grid of college lost items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-8 shadow-xs">
          <Info className="w-12 h-12 text-[#90a8ff] mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#191c1e] mb-1">No reported items found</p>
          <p className="text-xs text-gray-500">Try modifying search tags or change your active filters.</p>
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const alreadyClaimed = myClaims.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => handleOpenItem(item)}
                className="bg-white rounded-2xl border border-[#c5c5d3]/40 overflow-hidden shadow-[0px_4px_12px_rgba(30,58,138,0.03)] hover:shadow-[0px_8px_24px_rgba(30,58,138,0.08)] transition-all duration-300 group cursor-pointer flex flex-col h-full"
              >
                <div className="h-44 overflow-hidden relative bg-gray-50">
                  <img
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-550"
                    src={item.image}
                  />
                  {alreadyClaimed && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      Claim Filed
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-grow gap-2 justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getBadgeStyles(item.status)}`}>
                        {item.status}
                      </span>
                      <span className="text-[11px] text-[#444651]/70 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {item.createdAt}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-[#00236f] tracking-tight mt-1 line-clamp-1 group-hover:text-[#264191] transition-colors">{item.name}</h3>

                    <div className="space-y-1 mt-2">
                      <p className="text-xs text-[#444651] font-medium flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 shrink-0" />
                        {item.category}
                      </p>
                      <p className="text-xs text-[#444651] font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-red-500" />
                        <span className="truncate">{item.location}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#00236f]">
                    <span>View details</span>
                    <ChevronRight className="w-4 h-4 text-[#00236f] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Floating Action FAB button to open Report Tab */}
      <div className="fixed bottom-20 right-6 md:right-12 z-40 md:bottom-10">
        <button
          onClick={() => setActiveTab('report')}
          className="bg-[#00236f] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all outline-none"
          title="Report Lost or Found Item"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {/* Item Detail / Claim Drawer Modal popup */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setSelectedItem(null)}></div>
          
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="h-56 bg-gray-100 relative">
              <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-3 right-3 bg-white/80 p-1.5 rounded-full text-gray-800 hover:bg-white transition-all shadow-sm outline-none"
              >
                ✕
              </button>
            </div>

            <div className="p-6 max-h-[450px] overflow-y-auto">
              {/* Header and badge */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getBadgeStyles(selectedItem.status)}`}>
                    {selectedItem.status}
                  </span>
                  <h3 className="text-2xl font-bold text-[#00236f] tracking-tight mt-1">{selectedItem.name}</h3>
                </div>
              </div>

              {/* Informative Grid */}
              <div className="grid grid-cols-2 gap-4 bg-[#f2f4f6] p-4 rounded-xl border border-[#c5c5d3]/30 mb-4 text-xs font-medium text-[#444651]">
                <div className="space-y-1">
                  <p className="text-gray-500 uppercase text-[10px] tracking-wider font-bold">Category</p>
                  <p className="text-[#191c1e] text-sm font-semibold">{selectedItem.category}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500 uppercase text-[10px] tracking-wider font-bold">Date Registered</p>
                  <p className="text-[#191c1e] text-sm font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedItem.date}
                  </p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-gray-500 uppercase text-[10px] tracking-wider font-bold">Reported Residence / Area</p>
                  <p className="text-[#191c1e] text-sm font-semibold flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                    {selectedItem.location}
                  </p>
                </div>
                
                {/* Contact Name & Number Rows */}
                <div className="space-y-1 pt-1 border-t border-[#c5c5d3]/30">
                  <p className="text-gray-500 uppercase text-[10px] tracking-wider font-bold">Contact Name</p>
                  <p className="text-[#191c1e] text-sm font-semibold flex items-center gap-1">
                    <UserIcon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    {selectedItem.reporterName}
                  </p>
                </div>
                <div className="space-y-1 pt-1 border-t border-[#c5c5d3]/30">
                  <p className="text-gray-500 uppercase text-[10px] tracking-wider font-bold">Contact Number</p>
                  {selectedItem.contactNo ? (
                    <a
                      href={`tel:${selectedItem.contactNo}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-semibold flex items-center gap-1.5 outline-none"
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0 text-emerald-600 animate-pulse" />
                      {selectedItem.contactNo}
                    </a>
                  ) : (
                    <p className="text-gray-400 text-xs italic">No contact number provided</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1 mb-6 text-sm">
                <p className="text-gray-500 uppercase text-[10px] tracking-wider font-bold">Item Description</p>
                <p className="text-gray-800 leading-relaxed bg-amber-50/40 p-3 rounded-lg border border-amber-100 text-xs">
                  "{selectedItem.description}"
                </p>
                <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                  <UserIcon className="w-3 h-3 text-[#00236f]" />
                  Uploaded by: {selectedItem.reporterName}
                </p>
              </div>

              {/* Action buttons or claim flow */}
              {selectedItem.status === 'resolved' ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 text-xs rounded-xl font-medium text-center">
                  Case Resolved! This item has been successfully reclaimed by its verified owner.
                </div>
              ) : myClaims.includes(selectedItem.id) ? (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl text-center">
                  <p className="font-bold text-sm mb-1">Your claim is actively processing</p>
                  <p className="text-xs">Security admins will cross-examine your submitted proof file shortly.</p>
                </div>
              ) : !isClaiming ? (
                <button
                  onClick={() => setIsClaiming(true)}
                  className="w-full h-12 bg-[#00236f] hover:bg-[#264191] text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  Claim Ownership
                </button>
              ) : (
                <form onSubmit={handleClaimSubmit} className="space-y-3 pt-3 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-[#191c1e] uppercase tracking-wider">
                    Provide proof of ownership:
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Mention specific identifiers not stated in public post (e.g., custom stickers, phone lock screen wallpapers, card numbers inside wallet, brand engraving, contents inside):
                  </p>
                  <textarea
                    rows={3}
                    className="w-full p-3 text-xs bg-white border border-[#c5c5d3] focus:ring-2 focus:ring-[#00236f]/20 focus:border-[#00236f] rounded-xl outline-none"
                    placeholder="e.g. My wallet contains a library card ending in *839, exactly 12 dollars in change, and some receipt of grocery purchase..."
                    value={claimProof}
                    onChange={(e) => setClaimProof(e.target.value)}
                    required
                  ></textarea>

                  {claimSubmitted ? (
                    <div className="p-2 text-center bg-indigo-50 border border-indigo-200 text-[#00236f] rounded-lg text-xs font-bold animate-pulse">
                      Claim Logged Successfully! Redirecting...
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsClaiming(false)}
                        className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-50 text-xs font-bold rounded-lg text-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-[#006a61] hover:bg-[#005049] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                      >
                        Submit Proof
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
