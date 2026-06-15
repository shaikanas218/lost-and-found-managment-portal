/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { MapPin, Calendar, HelpCircle, Image as ImageIcon, Send, X, Camera, ShieldAlert, Sparkles, Phone, User } from 'lucide-react';
import { LostItem, ItemType } from '../types';

interface ReportScreenProps {
  currentUser: { id: string; name: string };
  onAddReport: (newItem: Omit<LostItem, 'id' | 'createdAt' | 'status'> & { status: 'lost' | 'found' | 'pending' }) => void;
  setActiveTab: (tab: string) => void;
  presetType?: 'lost' | 'found' | null;
  clearPresetType?: () => void;
}

export default function ReportScreen({ currentUser, onAddReport, setActiveTab, presetType, clearPresetType }: ReportScreenProps) {
  const [type, setType] = useState<ItemType>(presetType || 'lost');
  const [formStep, setFormStep] = useState(1);

  React.useEffect(() => {
    if (presetType) {
      setType(presetType);
      if (clearPresetType) {
        clearPresetType();
      }
    }
  }, [presetType, clearPresetType]);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [contactPerson, setContactPerson] = useState(currentUser.name || '');
  const [contactNo, setContactNo] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoriesList = [
    'Electronics',
    'Clothing',
    'ID/Documents',
    'Books & Stationery',
    'Keys',
    'Personal Items',
    'Others',
  ];

  // Stock library images so users can click a quick stock thumbnail! Extreme help in preview
  const STOCK_IMAGES = [
    { name: 'Devices', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=300' },
    { name: 'Water Bottle', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLPiVL9K2dNKpZvTFlnL68udWhACBTJ0CPl7u9JNQR6Ghb_5rwc_zLaqw8YZ5tNmQVScuGDOmf7buL50oiIW2K1tfyN0W1vKGvWx3EPoTonNMRM5iv2LRObZKKLD5NZ93jXzxHC7qW3wWWwrG3OvkwMIcB8o4tFwRddjGV_ofesG-l-ywyhr_Dzh2d98fIuOy2L8w3VG6bUeBE0gPumfJHCIxELikQpbfs8FLl0ug8zy8tyvWppjFS2Yi93CKNzCjKM0D5UdUauA' },
    { name: 'Keychain', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDX6rL4SoJiTZM2M5un_eYoXwrucFLNYWGIWt1fpLqeY3fBRkB4VdJGDFFQ5vj0J46Ybk00u1r2EkJR2PSWwSx-WFVOElz1XxiX9exnL5zJDDbWfWKTCCo5IVbFXC6yjUEWo0LsYEBq6gOa1DKIvAR4uBbe_k4E5DNSDBmBs74eZ1M28IWAJyuCKCgP4yEo3msJpML3P-PdqCGrlOxtsi005r5KKVRR3cJqAofkILon0L4z0_nejCqxqGqDzy3fey5Tff2qBX_bJg' },
    { name: 'Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=300' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter the Item Name.');
      return;
    }
    if (!category) {
      alert('Please select a Category.');
      return;
    }
    if (!location.trim()) {
      alert('Please enter the Location.');
      return;
    }
    if (!contactPerson.trim()) {
      alert('Please enter a Contact Name.');
      return;
    }
    if (!contactNo.trim()) {
      alert('Please enter a Contact Number.');
      return;
    }

    // Default stock image if user hasn't uploaded one
    const finalImage = image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=500';

    onAddReport({
      type,
      name: name.trim(),
      category,
      location: location.trim(),
      date,
      description: description.trim() || 'No description provided.',
      image: finalImage,
      reporterId: currentUser.id,
      reporterName: contactPerson.trim(),
      contactNo: contactNo.trim(),
      status: type === 'lost' ? 'lost' : 'found',
    });

    // Notify success and redirect back to Dashboard
    alert(`Your report has been submitted successfully to Campus Connect!`);
    setActiveTab('dashboard');
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      <section className="bg-white border border-[#c5c5d3]/30 rounded-2xl p-6 md:p-8 shadow-[0px_4px_12px_rgba(30,58,138,0.04)] overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Step Indicator Wizard Line */}
          <div className="mb-8 border-b border-gray-100 pb-5">
            <div className="flex items-center justify-between max-w-md mx-auto">
              <button 
                type="button"
                onClick={() => { if (formStep > 1) setFormStep(1); }}
                className="flex items-center gap-2 cursor-pointer group outline-none"
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  formStep === 1 
                    ? 'bg-[#00236f] text-white ring-4 ring-[#00236f]/10' 
                    : formStep > 1 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-gray-100 text-gray-500'
                }`}>
                  {formStep > 1 ? '✓' : '1'}
                </span>
                <span className={`text-[11px] md:text-xs font-extrabold tracking-tight transition-colors ${
                  formStep === 1 ? 'text-[#00236f]' : 'text-gray-400 group-hover:text-[#00236f]/70'
                }`}>Basics</span>
              </button>
              
              <div className={`h-0.5 flex-1 mx-2 md:mx-4 transition-all duration-500 ${formStep > 1 ? 'bg-[#00236f]' : 'bg-gray-200'}`}></div>
              
              <button 
                type="button"
                onClick={() => {
                  if (formStep > 2) {
                    setFormStep(2);
                  } else if (formStep === 1) {
                    if (!name.trim()) {
                      alert('Please enter the Item Name.');
                      return;
                    }
                    if (!category) {
                      alert('Please select a Category.');
                      return;
                    }
                    setFormStep(2);
                  }
                }}
                className="flex items-center gap-2 cursor-pointer group outline-none"
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  formStep === 2 
                    ? 'bg-[#00236f] text-white ring-4 ring-[#00236f]/10' 
                    : formStep > 2 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-gray-100 text-gray-500'
                }`}>
                  {formStep > 2 ? '✓' : '2'}
                </span>
                <span className={`text-[11px] md:text-xs font-extrabold tracking-tight transition-colors ${
                  formStep === 2 ? 'text-[#00236f]' : 'text-gray-400 group-hover:text-[#00236f]/70'
                }`}>Time & Spot</span>
              </button>
              
              <div className={`h-0.5 flex-1 mx-2 md:mx-4 transition-all duration-500 ${formStep > 2 ? 'bg-[#00236f]' : 'bg-gray-200'}`}></div>
              
              <div className="flex items-center gap-2 select-none">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  formStep === 3 
                    ? 'bg-[#00236f] text-white ring-4 ring-[#00236f]/10' 
                    : 'bg-gray-100 text-gray-400'
                }`}>3</span>
                <span className={`text-[11px] md:text-xs font-extrabold tracking-tight transition-colors ${
                  formStep === 3 ? 'text-[#00236f]' : 'text-gray-400'
                }`}>Reporting Info</span>
              </div>
            </div>
          </div>

          {/* Form Step 1: Basics */}
          {formStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Toggle lost vs found - Big and high attraction */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[#444651]">
                  Select Report Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Lost Selection Button Box */}
                  <button
                    type="button"
                    onClick={() => setType('lost')}
                    className={`group text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between pointer-events-auto cursor-pointer ${
                      type === 'lost'
                        ? 'border-amber-500 bg-amber-50/40 ring-4 ring-amber-500/10 shadow-md'
                        : 'border-gray-200 bg-white hover:bg-gray-50/60 hover:border-gray-300'
                    }`}
                    id="form-select-lost"
                  >
                    <div className="flex items-center gap-4">
                      <span className={`p-3 rounded-xl transition-colors ${
                        type === 'lost' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-400 group-hover:text-amber-600'
                      }`}>
                        <HelpCircle className="w-6 h-6 shrink-0" />
                      </span>
                      <div>
                        <span className="block text-sm font-extrabold text-gray-900">
                          I Lost This Item
                        </span>
                        <span className="block text-[11px] text-gray-500 mt-0.5">
                          Check logs & request item return
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        type === 'lost' ? 'border-amber-600 bg-amber-600' : 'border-gray-300'
                      }`}>
                        {type === 'lost' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                      </div>
                    </div>
                  </button>

                  {/* Found Selection Button Box */}
                  <button
                    type="button"
                    onClick={() => setType('found')}
                    className={`group text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between pointer-events-auto cursor-pointer ${
                      type === 'found'
                        ? 'border-teal-500 bg-teal-50/40 ring-4 ring-teal-500/10 shadow-md'
                        : 'border-gray-200 bg-white hover:bg-gray-50/60 hover:border-gray-300'
                    }`}
                    id="form-select-found"
                  >
                    <div className="flex items-center gap-4">
                      <span className={`p-3 rounded-xl transition-colors ${
                        type === 'found' ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-400 group-hover:text-teal-600'
                      }`}>
                        <Sparkles className="w-6 h-6 shrink-0" />
                      </span>
                      <div>
                        <span className="block text-sm font-extrabold text-gray-900">
                          I Found This Item
                        </span>
                        <span className="block text-[11px] text-gray-500 mt-0.5">
                          Notify other students & log discovery
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        type === 'found' ? 'border-teal-600 bg-teal-600' : 'border-gray-300'
                      }`}>
                        {type === 'found' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Item title */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#444651]" htmlFor="itemName">
                    Item Name
                  </label>
                  <input
                    id="itemName"
                    type="text"
                    placeholder="e.g. Silver Hydroflask"
                    className="w-full h-12 px-4 bg-white border border-[#c5c5d3] rounded-xl focus:ring-2 focus:ring-[#00236f]/20 focus:border-[#00236f] text-sm font-medium transition-all outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Category dropdown */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#444651]" htmlFor="category">
                    Category
                  </label>
                  <select
                    id="category"
                    className="w-full h-12 px-4 bg-white border border-[#c5c5d3] rounded-xl focus:ring-2 focus:ring-[#00236f]/20 focus:border-[#00236f] text-sm font-medium transition-all outline-none"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select a category</option>
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Form Step 2: Time & Spot */}
          {formStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#444651]" htmlFor="location">
                    Last Seen Location
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <MapPin className="w-5 h-5" />
                    </span>
                    <input
                      id="location"
                      type="text"
                      placeholder="e.g. Engineering Block B"
                      className="w-full h-12 pl-11 pr-4 bg-white border border-[#c5c5d3] rounded-xl focus:ring-2 focus:ring-[#00236f]/20 focus:border-[#00236f] text-sm font-medium transition-all outline-none"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Date Picker */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#444651]" htmlFor="date">
                    Date
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <Calendar className="w-5 h-5" />
                    </span>
                    <input
                      id="date"
                      type="date"
                      className="w-full h-12 pl-11 pr-4 bg-white border border-[#c5c5d3] rounded-xl focus:ring-2 focus:ring-[#00236f]/20 focus:border-[#00236f] text-sm font-medium transition-all outline-none"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Item Detailed Description */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#444651]" htmlFor="description">
                  Detailed Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Mention specific details like brand, color, scratches, contents, or sticker artwork..."
                  className="w-full p-4 bg-white border border-[#c5c5d3] rounded-xl focus:ring-2 focus:ring-[#00236f]/20 focus:border-[#00236f] text-sm font-medium transition-all outline-none resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
            </div>
          )}

          {/* Form Step 3: Reporting Info & Media */}
          {formStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Person Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#444651]" htmlFor="contactPerson">
                    Contact Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <User className="w-5 h-5" />
                    </span>
                    <input
                      id="contactPerson"
                      type="text"
                      placeholder="e.g. Alex Rivera"
                      className="w-full h-12 pl-11 pr-4 bg-white border border-[#c5c5d3] rounded-xl focus:ring-2 focus:ring-[#00236f]/20 focus:border-[#00236f] text-sm font-medium transition-all outline-none"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Contact Number */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#444651]" htmlFor="contactNo">
                    Contact Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Phone className="w-5 h-5" />
                    </span>
                    <input
                      id="contactNo"
                      type="tel"
                      placeholder="e.g. +1 (555) 019-2834"
                      className="w-full h-12 pl-11 pr-4 bg-white border border-[#c5c5d3] rounded-xl focus:ring-2 focus:ring-[#00236f]/20 focus:border-[#00236f] text-sm font-medium transition-all outline-none"
                      value={contactNo}
                      onChange={(e) => setContactNo(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Photo upload zone details */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#444651]">Photo Attachment</label>
                
                {image ? (
                  <div className="relative border border-[#c5c5d3]/60 rounded-xl overflow-hidden h-48 bg-gray-50 flex items-center justify-center shadow-xs">
                    <img src={image} alt="Report attachment" className="h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="absolute top-3 right-3 bg-red-650 hover:bg-red-750 text-white rounded-full p-1.5 transition-all shadow-sm cursor-pointer"
                      title="Clear Attachment"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 text-center ${
                      isDragging || image
                        ? 'border-[#00236f] bg-[#00236f]/5'
                        : 'border-[#c5c5d3] hover:bg-gray-50 bg-[#eceef0]/30'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    <div className="p-3 bg-white rounded-full shadow-sm text-[#00236f] mb-3">
                      <Camera className="w-7 h-7" />
                    </div>
                    
                    <h4 className="text-sm font-bold text-[#00236f] mb-1">Upload Photo</h4>
                    <p className="text-xs text-gray-500">
                      Drag and drop files from your browser or click to trigger local file dialog.
                    </p>
                    <p className="text-[10px] text-gray-400 mt-2 font-medium">Supports PNG, JPG, JPEG up to 5MB</p>
                  </div>
                )}

                {/* Quick stock library fillers right below upload */}
                {!image && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#444651] block mb-2">
                      💡 No real camera? Click a stock thumbnail template to auto-attach testing item graphic:
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      {STOCK_IMAGES.map((imgObj) => (
                        <button
                          key={imgObj.name}
                          type="button"
                          onClick={() => setImage(imgObj.url)}
                          className="text-[11px] font-bold px-2.5 py-1 bg-white hover:bg-indigo-50 border border-gray-200 text-gray-700 rounded-lg shadow-2xs cursor-pointer"
                        >
                          📷 {imgObj.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Step Back/Next and Submit Controls */}
          <div className="pt-6 border-t border-gray-200 flex items-center justify-between gap-4">
            {formStep > 1 ? (
              <button
                type="button"
                onClick={() => setFormStep(formStep - 1)}
                className="h-11 px-6 bg-white border border-[#c5c5d3] hover:bg-gray-50 text-[#444651] font-bold text-xs rounded-xl transition-all cursor-pointer outline-none flex items-center gap-1.5"
              >
                ← Back
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="h-11 px-6 bg-white border border-[#c5c5d3] hover:bg-gray-50 text-[#444651] font-bold text-xs rounded-xl transition-all cursor-pointer outline-none"
              >
                Cancel
              </button>
            )}

            {formStep < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (formStep === 1) {
                    if (!name.trim()) {
                      alert('Please enter the Item Name.');
                      return;
                    }
                    if (!category) {
                      alert('Please select a Category.');
                      return;
                    }
                    setFormStep(2);
                  } else if (formStep === 2) {
                    if (!location.trim()) {
                      alert('Please enter the Location.');
                      return;
                    }
                    if (!date) {
                      alert('Please select the Date.');
                      return;
                    }
                    setFormStep(3);
                  }
                }}
                className="h-11 px-8 bg-[#00236f] hover:bg-[#264191] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-900/10 active:scale-98 flex items-center gap-1.5"
              >
                Next Step →
              </button>
            ) : (
              <button
                type="submit"
                className="h-11 px-8 bg-[#00236f] hover:bg-[#264191] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-900/10 active:scale-98 flex items-center justify-center gap-2 outline-none"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Report
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Helpful Illustrative Tip Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="order-2 md:order-1">
          <h3 className="text-xl font-bold text-[#00236f] mb-2 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#006a61]" />
            Why accurate reporting matters?
          </h3>
          <p className="text-sm text-[#444651] leading-relaxed">
            Detailed reports with accurate photos raise overall campus item recovery probabilities by 65%. Clear details also allow college administrators to speed up verification queues and eliminate fraudulent or duplicate ownership releases.
          </p>
          <div className="mt-4 flex gap-2 items-center text-[#006a61]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006a61]"></span>
            <span className="text-xs font-bold">Secure University Cryptographic Validation Enabled</span>
          </div>
        </div>

        <div className="order-1 md:order-2 rounded-2xl overflow-hidden shadow-lg border border-gray-200">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWqWxGLlYTGgcRn1t0k_dX2JlG52_AtcrUwKpicH-rXyMjACeQBdg9hSsqMxXEu2Y8iLshz9v9yTunEVIP4ztQseSavw_qmqa5Uo4w1wyqGRMCuAHOEP0t-1p9NPDhxxEf6CdJPcpayYmJK12R2apRGIMEOL4BEMFABcF6XrLAOuQbpSw5dsNKmU19QzWrLhkKUih7bd9c42Z6YkWnw-0MZG9qQ2nOL8QgL2YVwPlCnatPBEeOKIHGS8DwxVXnqUNmAJXUIYkEjQ"
            alt="Campus courtyard illustrating safety"
            className="w-full h-full object-cover max-h-48"
          />
        </div>
      </section>
    </div>
  );
}
