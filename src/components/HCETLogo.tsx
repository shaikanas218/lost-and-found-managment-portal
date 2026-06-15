/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface HCETLogoProps {
  variant?: 'large' | 'medium' | 'small';
}

export default function HCETLogo({ variant = 'large' }: HCETLogoProps) {
  if (variant === 'small') {
    return (
      <div className="inline-flex flex-col border border-neutral-800 rounded overflow-hidden shadow-xs w-36 select-none bg-white">
        {/* Top Header - Charcoal Background */}
        <div className="bg-[#262626] text-white flex items-center justify-center py-0.5 border-b border-neutral-800">
          <span className="font-sans font-extrabold tracking-[0.25em] text-sm pl-[0.25em]">
            HCET
          </span>
        </div>
        {/* Bottom Banner - Light Gray Background */}
        <div className="bg-[#f0f2f5] text-[#262626] flex flex-col items-center justify-center py-0.5 px-1 text-[8px] leading-tight text-center font-bold">
          <div>Hindu College of</div>
          <div>Engineering & Tech</div>
        </div>
      </div>
    );
  }

  if (variant === 'medium') {
    return (
      <div className="inline-flex flex-col border border-neutral-800 rounded-md overflow-hidden shadow-sm w-52 select-none bg-white">
        {/* Top Header - Charcoal Background */}
        <div className="bg-[#262626] text-white flex items-center justify-center py-1.5 border-b border-neutral-800">
          <span className="font-sans font-black tracking-[0.3em] text-xl pl-[0.3em]">
            HCET
          </span>
        </div>
        {/* Bottom Banner - Light Gray Background */}
        <div className="bg-[#f2f4f6] text-[#262626] flex flex-col items-center justify-center py-1.5 px-2 text-[10px] leading-snug text-center">
          <div className="font-sans font-extrabold text-[#191c1e]">
            Hindu College of
          </div>
          <div className="font-sans font-extrabold text-[#191c1e] mt-0.5">
            Engineering & Technology
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col border-2 border-neutral-800 rounded-lg overflow-hidden shadow-md w-72 select-none bg-white">
      {/* Top Header - Charcoal Background */}
      <div className="bg-[#262626] text-white flex items-center justify-center py-3.5 border-b-2 border-neutral-800">
        <span className="font-sans font-black tracking-[0.4em] text-4xl pl-[0.4em]">
          HCET
        </span>
      </div>
      {/* Bottom Banner - Light Gray Background */}
      <div className="bg-[#f2f4f6] text-[#262626] flex flex-col items-center justify-center py-3 px-2 leading-tight text-center">
        <div className="font-sans font-extrabold text-[#191c1e] text-base tracking-wide">
          Hindu College of
        </div>
        <div className="font-sans font-extrabold text-[#191c1e] text-[15px] tracking-wide mt-0.5">
          Engineering and Technology
        </div>
      </div>
    </div>
  );
}
