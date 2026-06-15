/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LogOut, GraduationCap, Building2, Mail, ShieldAlert, Award, Grid, Camera, RefreshCw, X, Check } from 'lucide-react';
import { User } from '../types';

interface ProfileScreenProps {
  currentUser: User;
  onLogout: () => void;
  onUpdateUser: (updatedUser: User) => void;
}

export default function ProfileScreen({ currentUser, onLogout, onUpdateUser }: ProfileScreenProps) {
  const [isCameraActive, setIsCameraActive] = React.useState(false);
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = React.useState<'user' | 'environment'>('user');
  
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const initCamera = async (currentMode: 'user' | 'environment' = facingMode) => {
    setCameraError(null);
    setCapturedImage(null);
    setIsCameraActive(true);
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentMode,
          width: { ideal: 400 },
          height: { ideal: 400 }
        },
        audio: false
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please confirm frame permissions in browser.');
      setIsCameraActive(false);
    }
  };

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    initCamera(nextMode);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      
      const size = Math.min(video.videoWidth, video.videoHeight) || 400;
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const sx = (video.videoWidth - size) / 2;
        const sy = (video.videoHeight - size) / 2;
        
        ctx.drawImage(
          video,
          sx, sy, size, size,
          0, 0, size, size
        );
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const savePhoto = () => {
    if (capturedImage && onUpdateUser) {
      onUpdateUser({
        ...currentUser,
        avatar: capturedImage
      });
      setCapturedImage(null);
    }
  };

  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="max-w-md mx-auto space-y-6 font-sans">
      <div>
        <h2 className="text-3xl font-extrabold text-[#00236f] tracking-tight mb-1">My Profile</h2>
        <p className="text-sm text-[#444651]">Personal identification, active session, and portal controls.</p>
      </div>

      {/* Collegiate Student ID Card */}
      <div className="bg-gradient-to-br from-[#00236f] to-[#1e3a8a] text-white rounded-2xl p-6 relative overflow-hidden shadow-xl border border-blue-400/40">
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#86f2e4]/10 rounded-full blur-2xl transform translate-x-12 -translate-y-12"></div>
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-[#006a61]/20 rounded-full blur-3xl"></div>
        
        {/* Card Header */}
        <div className="flex justify-between items-start mb-6 border-b border-white/20 pb-4 relative z-10">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-teal-300" />
            <span className="font-extrabold text-xs uppercase tracking-widest text-[#86f2e4] font-sans">
              CAMPUS CONNECT CARD
            </span>
          </div>
          <span className="text-[10px] bg-white/20 px-2.5 py-1 rounded-full uppercase font-bold tracking-wider">
            {currentUser.role === 'admin' ? 'STAFF' : 'STUDENT'}
          </span>
        </div>

        {/* Card Main Body */}
        <div className="flex gap-4 relative z-10">
          {/* Interactive Profile Pic Avatar Frame with corner camera trigger */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/10 border border-white/30 shadow-lg relative group">
              <img
                alt="Profile Pic"
                className="w-full h-full object-cover"
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
              />
            </div>
            <button
              onClick={() => {
                if (isCameraActive) {
                  stopCamera();
                } else {
                  initCamera();
                }
              }}
              className="absolute -bottom-1 -right-1 bg-teal-500 hover:bg-teal-600 border-2 border-white text-white p-1.5 rounded-lg shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center z-20"
              title="Capture photo using camera"
              id="capture-photo-trigger"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 flex-grow">
            <div>
              <p className="text-[10px] text-teal-200 uppercase tracking-wider font-extrabold">Registered Holder</p>
              <h3 className="text-xl font-bold tracking-tight">{currentUser.name}</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-200 font-semibold uppercase tracking-wider">
              <div>
                <p className="text-teal-200">ID NUMBER</p>
                <p className="text-white text-xs font-bold">{currentUser.id}</p>
              </div>
              <div>
                <p className="text-teal-200">DEPARTMENT</p>
                <p className="text-white text-xs truncate max-w-[140px] font-bold">
                  {currentUser.department || 'Academic Affairs'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Barcode representation */}
        <div className="mt-8 pt-4 border-t border-white/15 flex flex-col items-center justify-center relative z-10">
          <div className="bg-white/90 p-2.5 rounded-lg flex flex-col items-center justify-center w-full shadow-inner">
            {/* Barcode line sequence mimicking mockups */}
            <div className="flex gap-0.5 justify-center items-center h-8 w-full select-none">
              {[1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 1, 2, 3, 2, 1, 2, 4, 1, 3, 2, 1].map((width, idx) => (
                <div
                  key={idx}
                  className="bg-black h-7 shrink-0"
                  style={{ width: `${width * 2}px` }}
                ></div>
              ))}
            </div>
            <span className="text-[10px] text-gray-600 font-mono tracking-[0.25em] font-extrabold mt-1">
              *U-{currentUser.id}-CON*
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Identity Photo Capture Station */}
      {(isCameraActive || capturedImage || cameraError) && (
        <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-lg space-y-4 relative overflow-hidden" id="photo-terminal">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${capturedImage ? 'bg-teal-400' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${capturedImage ? 'bg-teal-500' : 'bg-red-500'}`}></span>
              </span>
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#86f2e4] font-sans">
                Identity Photo Terminal
              </h4>
            </div>
            <button
              onClick={() => {
                stopCamera();
                setCapturedImage(null);
                setCameraError(null);
              }}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close terminal"
              id="close-terminal-button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {cameraError ? (
            <div className="p-4 bg-red-950/40 border border-red-900/60 rounded-xl text-red-200 text-xs flex gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-semibold">{cameraError}</p>
                <button
                  onClick={() => initCamera()}
                  className="px-3 py-1 bg-red-900/60 hover:bg-red-900 border border-red-800 rounded-lg text-[10px] font-bold text-white transition-all cursor-pointer"
                  id="retry-camera-btn"
                >
                  Retry Access
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Aspect-stabilized Viewport container */}
              <div className="relative aspect-square w-full max-w-[240px] mx-auto rounded-xl overflow-hidden bg-slate-950 border-2 border-slate-800 flex items-center justify-center">
                {isCameraActive && (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    {/* Viewport Overlay framing guide */}
                    <div className="absolute inset-0 border-2 border-teal-500/20 pointer-events-none rounded-xl m-4 flex items-center justify-center">
                      <div className="w-full h-full border border-dashed border-teal-500/30 rounded-full flex items-center justify-center">
                        {/* Scanning HUD brackets */}
                        <div className="w-5 h-5 border-t-2 border-l-2 border-teal-400 absolute top-2 left-2"></div>
                        <div className="w-5 h-5 border-t-2 border-r-2 border-teal-400 absolute top-2 right-2"></div>
                        <div className="w-5 h-5 border-b-2 border-l-2 border-teal-400 absolute bottom-2 left-2"></div>
                        <div className="w-5 h-5 border-b-2 border-r-2 border-teal-400 absolute bottom-2 right-2"></div>
                      </div>
                    </div>
                  </>
                )}

                {capturedImage && (
                  <img
                    src={capturedImage}
                    alt="Captured Preview"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Action Trigger Row */}
              <div className="flex gap-2 justify-center pt-2">
                {isCameraActive && (
                  <>
                    <button
                      onClick={capturePhoto}
                      className="h-10 px-5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                      id="btn-capture-frame"
                    >
                      <Camera className="w-4 h-4" />
                      Capture Frame
                    </button>
                    <button
                      onClick={toggleCameraFacing}
                      className="h-10 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer border border-slate-700"
                      title="Switch camera lens"
                      id="btn-flip-lens"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Flip Lens
                    </button>
                  </>
                )}

                {capturedImage && (
                  <>
                    <button
                      onClick={savePhoto}
                      className="h-10 px-5 bg-[#86f2e4] hover:bg-[#5beadd] text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-teal-500/10 active:scale-[0.97] transition-all cursor-pointer"
                      id="btn-save-avatar"
                    >
                      <Check className="w-4 h-4 text-slate-950" />
                      Save Personal Avatar
                    </button>
                    <button
                      onClick={() => initCamera()}
                      className="h-10 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer border border-slate-750"
                      id="btn-retake-photo"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Retake
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Account Info Details */}
      <section className="bg-white border border-[#c5c5d3]/40 rounded-2xl p-6 shadow-sm space-y-4">
        <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#444651]">General Information</h4>
        
        <div className="space-y-3.5 text-xs font-semibold text-[#444651]">
          <div className="flex items-center gap-3">
            <Mail className="w-4.5 h-4.5 text-[#00236f]" />
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Institutional Email Address</p>
              <p className="text-gray-800 text-sm">{currentUser.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Building2 className="w-4.5 h-4.5 text-[#00236f]" />
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Associated Academic Annex</p>
              <p className="text-gray-800 text-sm">Main Campus Building Block B, Annex 1</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Award className="w-4.5 h-4.5 text-[#00236f]" />
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Verification Clearance Tier</p>
              <p className="text-gray-800 text-sm">
                {currentUser.role === 'admin' ? 'Security Level Admin - Direct Release Approve' : 'College Student - Identity Authenticated'}
              </p>
            </div>
          </div>
        </div>

        {/* Large Log Out actionable */}
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={onLogout}
            className="w-full h-11 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all outline-none"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            End Active Session / Log Out
          </button>
        </div>
      </section>

      {/* Helpful Campus connect tag */}
      <div className="bg-amber-50/50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs flex items-start gap-2">
        <ShieldAlert className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
        <p className="font-semibold leading-relaxed">
          Need details updated on your student card? Contact the registrar office directly at registrar@university.edu or visit administration counter in Admin Building.
        </p>
      </div>
    </div>
  );
}
