import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-[#00256b] border-t border-[#001a4d] text-slate-300 py-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-1 text-center md:text-left">
          <p className="font-semibold text-white">
            Incheon National University Course Dashboard
          </p>
          <p className="text-xs text-white/60">
            Designed & Developed by 김종경 | © 2026 Incheon National University. All rights reserved.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium">
          <a
            href="https://www.inu.ac.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#ffa600] text-slate-300 transition-colors duration-150"
          >
            인천대학교 홈페이지
          </a>
          <span className="text-white/20 hidden sm:inline">|</span>
          <a
            href="https://portal.inu.ac.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#ffa600] text-slate-300 transition-colors duration-150"
          >
            INU 포털
          </a>
          <span className="text-white/20 hidden sm:inline">|</span>
          <a
            href="https://cyber.inu.ac.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#ffa600] text-slate-300 transition-colors duration-150"
          >
            이러닝
          </a>
        </div>
      </div>
    </footer>
  )
}
