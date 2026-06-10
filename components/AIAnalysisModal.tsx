'use client'

import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'

interface AIAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  college: string | null
  department: string | null
}

export default function AIAnalysisModal({
  isOpen,
  onClose,
  college,
  department,
}: AIAnalysisModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisText, setAnalysisText] = useState<string>('')

  const targetName = department || college || '대학 전체'

  useEffect(() => {
    if (isOpen) {
      const runAnalysis = async () => {
        setLoading(true)
        setError(null)
        setAnalysisText('')

        try {
          const res = await fetch('/api/ai-analysis', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ college, department }),
          })

          const data = await res.json()
          if (!res.ok) {
            throw new Error(data.error || '분석 요청에 실패했습니다.')
          }

          setAnalysisText(data.analysis)
        } catch (err: any) {
          console.error(err)
          setError(err.message || '서버 오류가 발생했습니다.')
        } finally {
          setLoading(false)
        }
      }

      runAnalysis()
    }
  }, [isOpen, college, department])

  const handleDownload = () => {
    if (!analysisText) return

    const blob = new Blob([analysisText], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `AI_분석_${targetName.replace(/\s+/g, '_')}_2026-1학기.md`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Custom regex-based Markdown renderer for high-quality report layout
  const renderMarkdown = (text: string) => {
    if (!text) return <p className="text-sm text-slate-400">데이터가 없습니다.</p>

    // Clean up markdown code block wrappers if present
    let cleanText = text.trim()
    if (cleanText.startsWith('```markdown')) {
      cleanText = cleanText.substring(11).trim()
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.substring(3).trim()
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.substring(0, cleanText.length - 3).trim()
    }

    const lines = cleanText.split('\n')
    const renderedElements: React.ReactNode[] = []

    // Helper to parse inline bolding **text**
    const parseInline = (inlineText: string) => {
      const parts = inlineText.split(/(\*\*.*?\*\*)/g)
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-extrabold text-[#003087]">{part.slice(2, -2)}</strong>
        }
        return part
      })
    }

    lines.forEach((line, index) => {
      const trimmed = line.trim()

      // Horizontal Rule
      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        renderedElements.push(<hr key={`hr-${index}`} className="my-6 border-slate-200" />)
        return
      }

      // Document Title: === Title ===
      if (trimmed.startsWith('===') && trimmed.endsWith('===')) {
        const titleContent = trimmed.replace(/===/g, '').trim()
        renderedElements.push(
          <div key={`title-${index}`} className="text-center py-4 border-b border-slate-100 mb-6">
            <h1 className="text-2xl font-black text-[#003087] tracking-tight">{titleContent}</h1>
          </div>
        )
        return
      }

      // Metadata details
      if (trimmed.startsWith('분석 대상:') || trimmed.startsWith('일자:') || trimmed.startsWith('작성 모델:')) {
        renderedElements.push(
          <div key={`meta-${index}`} className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffa600]"></span>
            <span>{trimmed}</span>
          </div>
        )
        return
      }

      // Headings
      if (trimmed.startsWith('# ')) {
        renderedElements.push(
          <h1 key={`h1-${index}`} className="text-xl font-bold text-[#003087] mt-8 mb-4 pb-2 border-b border-slate-100">
            {parseInline(trimmed.substring(2))}
          </h1>
        )
        return
      }
      if (trimmed.startsWith('## ')) {
        renderedElements.push(
          <h2 key={`h2-${index}`} className="text-lg font-bold text-[#003087] mt-6 mb-3">
            {parseInline(trimmed.substring(3))}
          </h2>
        )
        return
      }
      if (trimmed.startsWith('### ')) {
        renderedElements.push(
          <h3 key={`h3-${index}`} className="text-base font-semibold text-[#003087] mt-4 mb-2">
            {parseInline(trimmed.substring(4))}
          </h3>
        )
        return
      }

      // Bullet lists
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const content = trimmed.substring(2)
        renderedElements.push(
          <li key={`li-${index}`} className="ml-5 list-disc text-sm text-slate-600 mb-2 leading-relaxed">
            {parseInline(content)}
          </li>
        )
        return
      }

      // Empty Lines
      if (trimmed === '') {
        renderedElements.push(<div key={`empty-${index}`} className="h-3" />)
        return
      }

      // Plain paragraphs
      renderedElements.push(
        <p key={`p-${index}`} className="text-sm text-slate-600 leading-relaxed mb-2">
          {parseInline(line)}
        </p>
      )
    })

    return <div className="space-y-1">{renderedElements}</div>
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-5xl w-[95vw] h-[85vh] flex flex-col bg-white border border-slate-200 shadow-2xl rounded-xl">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-extrabold text-[#003087]">
            AI 강의 데이터 종합 분석 ({targetName})
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 my-2 rounded-lg bg-slate-50 border border-slate-100 shadow-inner">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-3">
              <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
              <p className="text-sm font-medium text-slate-500 animate-pulse">
                Gemini 3.1 Flash-Lite 모델이 데이터를 분석 중입니다...
              </p>
            </div>
          ) : error ? (
            <div className="text-center text-rose-500 py-12">
              <p className="font-semibold">오류 발생</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : (
            <div className="font-sans text-slate-800">
              {renderMarkdown(analysisText)}
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4 flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleDownload}
            disabled={loading || !!error || !analysisText}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            분석 결과 다운로드
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
