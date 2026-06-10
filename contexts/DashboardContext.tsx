'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface DashboardContextType {
  selectedCollege: string | null
  selectedDepartment: string | null
  setSelectedCollege: (college: string | null) => void
  setSelectedDepartment: (department: string | null) => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)

  const handleSetSelectedCollege = (college: string | null) => {
    setSelectedCollege(college)
    setSelectedDepartment(null) // Reset department when college changes
  }

  return (
    <DashboardContext.Provider
      value={{
        selectedCollege,
        selectedDepartment,
        setSelectedCollege: handleSetSelectedCollege,
        setSelectedDepartment,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
