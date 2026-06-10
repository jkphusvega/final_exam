'use client'

import React, { useState } from 'react'
import { useDashboard } from '@/contexts/DashboardContext'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import AIAnalysisModal from '@/components/AIAnalysisModal'

export default function Header() {
  const { selectedCollege, selectedDepartment, setSelectedCollege, setSelectedDepartment } = useDashboard()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex flex-col shrink-0 sticky top-0 z-40 w-full select-none">
      {/* Tier 1: Portal Top Utility Bar */}
      <div className="bg-[#00256b] h-8 px-6 flex items-center justify-between text-white text-[11px] font-semibold border-b border-[#001c54]">
        {/* Left Side: Navigation Tabs */}
        <div className="flex items-center h-full">
          <a
            href="https://portal.inu.ac.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#ffa600] text-[#00256b] px-3.5 h-full flex items-center font-extrabold hover:bg-[#ffb933] transition-colors"
          >
            PORTAL
          </a>
          <a
            href="https://www.inu.ac.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#103a7d] text-white/95 px-3.5 h-full flex items-center font-extrabold hover:bg-[#194c9c] transition-colors"
          >
            HOMEPAGE
          </a>
        </div>
      </div>

      {/* Tier 2: Main Header Bar (White background matching portal style) */}
      <header className="h-16 bg-white px-6 flex items-center justify-between shadow-sm border-b border-slate-200">
        <div className="flex items-center gap-6">
          {/* Main Title '교과목 대시보드' */}
          <div className="flex items-center">
            <span className="font-extrabold text-[#003087] tracking-wider text-base md:text-lg">
              26-1 교과목 대시보드
            </span>
          </div>

          {/* Vertical Separator */}
          <div className="h-4 w-px bg-slate-200 hidden md:block" />

          {/* Breadcrumbs (adjusted contrast for white background) */}
          <Breadcrumb className="hidden md:block">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="#"
                  onClick={(e) => { e.preventDefault(); setSelectedCollege(null); setSelectedDepartment(null) }}
                  className="text-slate-500 hover:text-[#003087] transition-colors cursor-pointer"
                >
                  전체
                </BreadcrumbLink>
              </BreadcrumbItem>

              {selectedCollege && (
                <>
                  <BreadcrumbSeparator className="text-slate-300" />
                  <BreadcrumbItem>
                    {selectedDepartment ? (
                      <BreadcrumbLink
                        href="#"
                        onClick={(e) => { e.preventDefault(); setSelectedDepartment(null) }}
                        className="text-slate-500 hover:text-[#003087] transition-colors cursor-pointer"
                      >
                        {selectedCollege}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="text-[#003087] font-semibold">
                        {selectedCollege}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </>
              )}

              {selectedDepartment && (
                <>
                  <BreadcrumbSeparator className="text-slate-300" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-[#003087] font-semibold">{selectedDepartment}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div>
          {/* AI Analysis Button (INU Yellow styled) */}
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-[#ffa600] hover:bg-[#ffb933] text-[#003087] font-bold flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 active:scale-95 active:translate-y-0 border-none"
          >
            <Sparkles className="w-4 h-4 text-[#003087]" />
            <span>AI 강의 분석</span>
          </Button>
        </div>

        {/* AI Analysis Modal */}
        <AIAnalysisModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          college={selectedCollege}
          department={selectedDepartment}
        />
      </header>
    </div>
  )
}
