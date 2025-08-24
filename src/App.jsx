import { useState, useEffect } from 'react'
import chalehLogo from './assets/chaleh-logo.png'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { CheckCircle, Target, MinusCircle, Plus, Trash2, Calendar, AlertTriangle } from 'lucide-react'
import './App.css'

// Priority levels configuration
const PRIORITY_LEVELS = {
  1: { name: 'بسیار پایین', color: 'bg-gray-100 text-gray-800', percentage: 5 },
  2: { name: 'پایین', color: 'bg-blue-100 text-blue-800', percentage: 10 },
  3: { name: 'متوسط', color: 'bg-yellow-100 text-yellow-800', percentage: 15 },
  4: { name: 'بالا', color: 'bg-orange-100 text-orange-800', percentage: 30 },
  5: { name: 'بسیار بالا', color: 'bg-red-100 text-red-800', percentage: 40 }
}

// Dimple Icon Component
const Dimple = ({ progress }) => {
  const fillHeight = `${progress * 100}%`
  return (
    <div className="relative w-6 h-6 rounded-full border-2 border-gray-400 overflow-hidden">
      <div
        className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-500 ease-out"
        style={{ height: fillHeight }}
      ></div>
      <MinusCircle className="absolute inset-0 w-full h-full text-gray-600 opacity-50" />
    </div>
  )
}

// ====== Global "Tepe" summary (single global savings pile) ======
const DEFAULT_TEPE_START = 1000

const TepeSummary = ({ plan, tepeStart = DEFAULT_TEPE_START }) => {
  if (!plan) return null

  const totalContrib = plan.months.reduce((s, m) => s + (m.tepe || 0), 0)
  const finalBalance = tepeStart + totalContrib

  return (
    <Card className="mb-4 border-indigo-200 bg-indigo-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-indigo-900">تپه (پس‌انداز کل)</CardTitle>
          <div className="text-right text-sm">
            <div className="text-gray-700">شروع: {tepeStart.toLocaleString()} €</div>
            <div className="font-bold text-indigo-700">افزوده‌شده تا پایان برنامه: +{totalContrib.toLocaleString()} €</div>
            <div className="font-bold text-green-700">موجودی نهایی: {finalBalance.toLocaleString()} €</div>
          </div>
        </div>
        {plan.completionMonth && (
          <CardDescription className="text-[13px] mt-2">
            پس از اتمام همهٔ چاله‌ها، از ماه‌های بعدی هر ماه {plan.postCompletionTepePerMonth.toLocaleString()} € به تپه افزوده می‌شود.
          </CardDescription>
        )}
      </CardHeader>
    </Card>
  )
}

// ====== Global monthly Tepe progress (per-month view until goals finish) ======
const TepeProgress = ({ plan, tepeStart = DEFAULT_TEPE_START }) => {
  if (!plan) return null
  const months = plan.months || []

  // Persian month names and 2-digit year formatting
  const persianMonths = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند']
  const now = new Date()
  const year2Fmt = new Intl.DateTimeFormat('fa-IR', { year: '2-digit' })
  const baseYear2 = year2Fmt.format(now)
  const addMonths = (d, m) => { const dt = new Date(d); dt.setMonth(dt.getMonth() + m); return dt }
  const getMonthName = (monthIndex) => {
    // monthIndex starts at 1 in plan.months
    if (monthIndex === 0) return 'امروز'
    const target = addMonths(now, monthIndex)
    const name = persianMonths[target.getMonth()]
    const y2 = year2Fmt.format(target)
    return y2 === baseYear2 ? name : `${name} ${y2}`
  }

  const cumulativeAt = (i) => months.slice(0, i).reduce((s, m) => s + (m.tepe || 0), 0)
  const totalContrib = cumulativeAt(months.length)
  const finalBalance = tepeStart + totalContrib

  const widthPx = Math.max(400, Math.max(1, months.length) * 80)

  return (
    <Card className="mb-4 border-indigo-200 bg-indigo-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-indigo-900">تپه (پس‌انداز کل تا پایان چاله‌ها)</CardTitle>
          <div className="text-right text-sm">
            <div className="text-gray-700">شروع: {tepeStart.toLocaleString()} €</div>
            <div className="font-bold text-indigo-700">افزوده‌شده: +{totalContrib.toLocaleString()} €</div>
            <div className="font-bold text-green-700">موجودی نهایی: {finalBalance.toLocaleString()} €</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto pb-2">
          {/* Line */}
          <div className="absolute top-8 h-1 bg-gray-200 rounded-full" style={{ left: '24px', right: '24px', width: `${widthPx}px` }}>
            <div className="h-full bg-gradient-to-r from-indigo-500 to-green-500 rounded-full" style={{ width: '100%' }} />
          </div>

          {/* Months */}
          <div className="flex items-start relative" style={{ width: `${Math.max(500, (months.length + 1) * 80)}px` }}>
            {months.map((m, idx) => {
              const monthIndex = idx + 1
              const monthlyAdd = Math.round(Number(m.tepe || 0))
              const cumulative = tepeStart + cumulativeAt(monthIndex)
              return (
                <div key={monthIndex} className="flex flex-col items-center space-y-1 relative w-20 flex-shrink-0">
                  <div className="text-xs font-medium text-gray-800 text-center min-h-[12px]">{getMonthName(monthIndex)}</div>
                  <div className="relative z-10 rounded-full p-1 border bg-white border-gray-200">
                    <div className="w-4 h-4 rounded-full bg-indigo-400" />
                  </div>
                  <div className="text-xs text-indigo-700 text-center font-medium">+{monthlyAdd.toLocaleString()}€</div>
                  <div className="text-[11px] leading-tight text-center text-gray-700">کل: {cumulative.toLocaleString()} €</div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ====== REPLACE simulateGlobalPlan (adds baseMonthlySavings each month) ======
const simulateGlobalPlan = (allChalehs, baseAllocations, availableFunds, baseMonthlySavings) => {
  const months = []
  let remaining = [...allChalehs]
  let curAlloc = { ...baseAllocations }
  const saved = {}
  allChalehs.forEach(ch => (saved[ch.id] = 0))

  for (let month = 1; month <= 240; month++) {
    let paySum = 0
    let allocSum = 0
    const completedThisMonth = []

    // پرداخت سقف‌دار + جمع سهم‌ها
    remaining.forEach(ch => {
      const alloc = curAlloc[ch.id] || 0
      const need  = Math.max(0, ch.targetAmount - saved[ch.id])
      const pay   = Math.min(alloc, need)

      allocSum += alloc
      paySum   += pay

      saved[ch.id] += pay
      if (need > 0 && saved[ch.id] >= ch.targetAmount) completedThisMonth.push(ch.id)
    })

    // تپه‌ی این ماه = پس‌انداز پایه + (سهم‌ها − پرداخت واقعی)
    const tepeThisMonth = Math.max(0, Math.round(baseMonthlySavings + (allocSum - paySum)))
    months.push({ month, tepe: tepeThisMonth })

    // حذف چاله‌های تکمیل‌شده
    if (completedThisMonth.length) {
      remaining = remaining.filter(ch => !completedThisMonth.includes(ch.id))
    }

    // اگر همه تمام شدند: از ماه‌های بعد «پس‌انداز پایه + بودجه‌ی اهداف» به تپه می‌رود
    if (remaining.length === 0) {
      return {
        months,
        completionMonth: months.length,
        postCompletionTepePerMonth: Math.round(baseMonthlySavings + availableFunds)
      }
    }

    // بازتوزیع سهم آزادشده برای ماه‌های بعد
    if (completedThisMonth.length) {
      const freed = completedThisMonth.reduce((s, id) => s + (curAlloc[id] || 0), 0)

      const sorted = [...remaining].sort((a, b) => {
        const aTime = a.dueDate && new Date(a.dueDate) > new Date()
        const bTime = b.dueDate && new Date(b.dueDate) > new Date()
        if (aTime && !bTime) return -1
        if (!aTime && bTime) return 1
        return b.priority - a.priority
      })

      let totalWeight = 0
      sorted.forEach(ch => { totalWeight += PRIORITY_LEVELS[ch.priority].percentage })

      sorted.forEach(ch => {
        const ratio = PRIORITY_LEVELS[ch.priority].percentage / totalWeight
        const add = Math.round(freed * ratio)
        curAlloc[ch.id] = (curAlloc[ch.id] || 0) + add
      })
    }
  }

  return {
    months,
    completionMonth: months.length,
    postCompletionTepePerMonth: Math.round(baseMonthlySavings + availableFunds)
  }
}
// ====== END REPLACE ======


// ====== Individual Chaleh Progress Component ======
const ChalehProgress = ({ chaleh, initialAllocation, allChalehs, allAllocations }) => {
  // Month-by-month simulation with capped payments to avoid overfill
  const calculateDynamicAllocations = () => {
    const monthlyData = []
    let remainingChalehs = [...allChalehs]
    let currentAllocations = { ...allAllocations }

    const saved = {}
    allChalehs.forEach(ch => (saved[ch.id] = 0))

    // month 0 snapshot
    monthlyData.push({
      month: 0,
      allocations: { ...currentAllocations },
      remainingChalehs: [...remainingChalehs],
      completedChalehs: [],
      savedSnapshot: { ...saved },
    })

    for (let month = 1; month <= 240; month++) {
      const completedThisMonth = []

      // pay capped amounts this month
      remainingChalehs.forEach(ch => {
        const alloc = currentAllocations[ch.id] || 0
        const need = Math.max(0, ch.targetAmount - saved[ch.id])
        const pay = Math.min(alloc, need)
        saved[ch.id] += pay
        if (need > 0 && saved[ch.id] >= ch.targetAmount) completedThisMonth.push(ch.id)
      })

      monthlyData.push({
        month,
        allocations: { ...currentAllocations },
        remainingChalehs: [...remainingChalehs],
        completedChalehs: [...completedThisMonth],
        savedSnapshot: { ...saved },
      })

      // remove completed
      remainingChalehs = remainingChalehs.filter(ch => !completedThisMonth.includes(ch.id))

      // stop if finished all goals
      if (remainingChalehs.length === 0) break

      // reallocate freed funds for next months
      if (completedThisMonth.length) {
        const totalFreed = completedThisMonth.reduce((s, id) => s + (currentAllocations[id] || 0), 0)
        const sortedRemaining = [...remainingChalehs].sort((a, b) => {
          const aIsTimeBound = a.dueDate && new Date(a.dueDate) > new Date()
          const bIsTimeBound = b.dueDate && new Date(b.dueDate) > new Date()
          if (aIsTimeBound && !bIsTimeBound) return -1
          if (!aIsTimeBound && bIsTimeBound) return 1
          return b.priority - a.priority
        })
        let totalPriorityWeight = 0
        sortedRemaining.forEach(ch => { totalPriorityWeight += PRIORITY_LEVELS[ch.priority].percentage })
        sortedRemaining.forEach(ch => {
          const ratio = PRIORITY_LEVELS[ch.priority].percentage / totalPriorityWeight
          const add = Math.round(totalFreed * ratio)
          currentAllocations[ch.id] = (currentAllocations[ch.id] || 0) + add
        })
      }
    }

    return monthlyData
  }

  const monthlyData = calculateDynamicAllocations()

  // Keep completion month in series
  const chalehMonthlyData = monthlyData.filter(d =>
    d.month === 0 ||
    d.remainingChalehs.some(ch => ch.id === chaleh.id) ||
    d.completedChalehs.includes(chaleh.id)
  )

  // completion index
  const completionIndex = chalehMonthlyData.findIndex(d => d.completedChalehs.includes(chaleh.id))
  const totalMonths = completionIndex > -1 ? completionIndex : (chalehMonthlyData.length - 1)

  // due date helpers
  const getDueDateMonth = () => {
    if (!chaleh.dueDate) return null
    const dueDate = new Date(chaleh.dueDate)
    const now = new Date()
    const yearDiff = dueDate.getFullYear() - now.getFullYear()
    const monthDiff = dueDate.getMonth() - now.getMonth()
    return yearDiff * 12 + monthDiff
  }

  const dueDateMonth = getDueDateMonth()
  const isDueDateBeforeCompletion = dueDateMonth !== null && dueDateMonth < totalMonths

  // extend to show due date if after completion
  const maxDisplayMonths = dueDateMonth !== null ? Math.max(totalMonths, dueDateMonth) : totalMonths
  const extendedMonths = Array.from({ length: maxDisplayMonths + 1 }, (_, i) => i)

  // Persian months + 2-digit year
  const persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ]
  const now = new Date()
  const year2Fmt = new Intl.DateTimeFormat('fa-IR', { year: '2-digit' })
  const baseYear2 = year2Fmt.format(now)
  const addMonths = (d, m) => { const dt = new Date(d); dt.setMonth(dt.getMonth() + m); return dt }
  const getMonthName = (monthIndex) => {
    if (monthIndex === 0) return 'امروز'
    const target = addMonths(now, monthIndex)
    const targetMonth = target.getMonth()
    const monthName = persianMonths[targetMonth]
    const y2 = year2Fmt.format(target)
    return y2 === baseYear2 ? monthName : `${monthName} ${y2}`
  }

  const getSavedRaw = (monthIndex) => (
    chalehMonthlyData[monthIndex]?.savedSnapshot?.[chaleh.id] ?? 0
  )

  const getSavedAmount = (monthIndex) => (
    Math.min(Math.round(getSavedRaw(monthIndex)), chaleh.targetAmount)
  )

  const getAccumulatedAmount = (monthIndex) => {
    if (monthIndex === 0) return -chaleh.targetAmount
    return Math.round(getSavedRaw(monthIndex) - chaleh.targetAmount)
  }

  const getCurrentAllocation = (monthIndex) => (
    chalehMonthlyData[monthIndex]?.allocations?.[chaleh.id] || 0
  )

  const getBoostInfo = (monthIndex) => {
    if (monthIndex === 0) return null
    const currentAllocation = getCurrentAllocation(monthIndex)
    const previousAllocation = getCurrentAllocation(monthIndex - 1)
    if (currentAllocation > previousAllocation) {
      const boost = currentAllocation - previousAllocation
      return { boost, newTotal: currentAllocation }
    }
    return null
  }

  const getShortfallAtDueDate = () => {
    if (!dueDateMonth || dueDateMonth > totalMonths) return 0
    const savedAtDueDate = getSavedAmount(dueDateMonth)
    return Math.max(0, chaleh.targetAmount - savedAtDueDate)
  }

  const shortfallAtDueDate = getShortfallAtDueDate()

  const isUrgent = chaleh.dueDate && new Date(chaleh.dueDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  const getMonthIcon = (monthIndex) => {
    if (monthIndex === 0) return <CheckCircle className="w-4 h-4 text-blue-600" />
    if (monthIndex === totalMonths) return <Target className="w-4 h-4 text-green-600" />
    const accumulated = getAccumulatedAmount(monthIndex)
    const progress = Math.min(1, Math.max(0, (chaleh.targetAmount + accumulated) / chaleh.targetAmount))
    return <Dimple progress={progress} />
  }

  return (
    <Card className={`mb-4 ${isUrgent ? 'border-red-300 bg-red-50' : 'bg-gradient-to-r from-blue-50 to-green-50 border-blue-200'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">{chaleh.name}</CardTitle>
            <Badge className={PRIORITY_LEVELS[chaleh.priority].color}>
              {PRIORITY_LEVELS[chaleh.priority].name}
            </Badge>
            {chaleh.dueDate && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(chaleh.dueDate).toLocaleDateString('fa-IR')}
              </Badge>
            )}
            {isUrgent && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                فوری
              </Badge>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-600">هدف: {chaleh.targetAmount.toLocaleString()} €</div>
            <div className="text-xs font-bold text-green-700">
              {totalMonths} ماه • شروع: {initialAllocation}€ ماهانه
            </div>
            {isDueDateBeforeCompletion && shortfallAtDueDate > 0 && (
              <div className="text-xs font-bold text-red-600 mt-1">
                ⚠️ کمبود در سررسید: {shortfallAtDueDate.toLocaleString()}€
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto pb-2">
          {/* Progress Line */}
          <div 
            className="absolute top-8 h-1 bg-gray-200 rounded-full"
            style={{ 
              left: '24px', 
              right: '24px',
              width: `${Math.max(400, maxDisplayMonths * 80)}px`
            }}
          >
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000"
              style={{ width: `100%` }}
            />
          </div>
          {/* Month Markers */}
          <div className="flex items-start relative" style={{ width: `${Math.max(500, (maxDisplayMonths + 1) * 80)}px` }}>
            {extendedMonths.map((monthIndex) => {
              const boostInfo = getBoostInfo(monthIndex)
              const currentAllocation = getCurrentAllocation(monthIndex)
              const isDueDateMonth = dueDateMonth === monthIndex
              const isAfterCompletion = monthIndex > totalMonths
              return (
                <div key={monthIndex} className="flex flex-col items-center space-y-1 relative w-20 flex-shrink-0">
                  {/* Month label */}
                  <div className="text-xs font-medium text-gray-800 text-center min-h-[12px]">
                    {monthIndex <= maxDisplayMonths ? getMonthName(monthIndex) : ''}
                  </div>
                  {/* Icon */}
                  {monthIndex <= maxDisplayMonths && (
                    <div className={`relative z-10 rounded-full p-1 border ${isDueDateMonth && isAfterCompletion ? 'bg-red-100 border-red-300' : 'bg-white border-gray-200'}`}>
                      {isAfterCompletion ? (
                        isDueDateMonth ? (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                        )
                      ) : (
                        getMonthIcon(monthIndex)
                      )}
                    </div>
                  )}
                  {/* Allocation for the month */}
                  {monthIndex <= totalMonths && monthIndex > 0 && (
                    <div className="text-xs text-blue-600 text-center font-medium">
                      {currentAllocation}€
                    </div>
                  )}
                  {/* Numbers */}
                  {monthIndex <= maxDisplayMonths && (
                    <div className="text-[11px] leading-tight text-center">
                      {!isAfterCompletion ? (
                        <>
                          <div className="text-gray-500">{getAccumulatedAmount(monthIndex).toLocaleString()} €</div>
                          <div className="text-green-600 font-medium">+{getSavedAmount(monthIndex).toLocaleString()} €</div>
                        </>
                      ) : isDueDateMonth && shortfallAtDueDate > 0 ? (
                        <div className="text-red-600 font-bold">کمبود: {shortfallAtDueDate.toLocaleString()}€</div>
                      ) : null}
                    </div>
                  )}
                  {/* Boost indicator */}
                  {boostInfo && (
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                      <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-bold border border-orange-300 whitespace-nowrap">
                        🚀 +{boostInfo.boost}€
                      </div>
                    </div>
                  )}
                  {/* Due date warning */}
                  {isDueDateMonth && isAfterCompletion && shortfallAtDueDate > 0 && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                      <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold border border-red-300 whitespace-nowrap">
                        ⚠️ سررسید!
                      </div>
                    </div>
                  )}
                  {/* Goal marker */}
                  {monthIndex === totalMonths && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold border border-green-300">
                        پر شد! 🎉
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function App() {
  // Financial inputs
  const [monthlyIncome, setMonthlyIncome] = useState('3000')
  const [fixedMonthlyChaleh, setFixedMonthlyChaleh] = useState('800')
  const [otherMonthlyExpenses, setOtherMonthlyExpenses] = useState('500')
  const [desiredMonthlySavings, setDesiredMonthlySavings] = useState('1000')

  // Chalehs management
  const [chalehs, setChalehs] = useState([])
  const [newChaleh, setNewChaleh] = useState({ name: '', targetAmount: '', priority: 3, dueDate: '' })
  const [editingChaleh, setEditingChaleh] = useState(null)

  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // Pre-fill example chalehs on component mount
  useEffect(() => {
    const exampleChalehs = [
      { id: 1, name: 'وام مسکن', targetAmount: 50000, priority: 5, dueDate: '2025-12-31' },
      { id: 2, name: 'صندوق اضطراری', targetAmount: 10000, priority: 5, dueDate: '' },
      { id: 3, name: 'خرید خودرو', targetAmount: 20000, priority: 4, dueDate: '2026-06-30' },
      { id: 4, name: 'آموزش فرزند', targetAmount: 8000, priority: 4, dueDate: '' },
      { id: 5, name: 'تعمیرات منزل', targetAmount: 5000, priority: 3, dueDate: '' },
      { id: 6, name: 'سفر خارجی', targetAmount: 4000, priority: 3, dueDate: '' },
      { id: 7, name: 'خرید لپ‌تاپ جدید', targetAmount: 1500, priority: 2, dueDate: '' },
      { id: 8, name: 'سرمایه‌گذاری در بورس', targetAmount: 3000, priority: 2, dueDate: '' },
      { id: 9, name: 'خرید دوچرخه', targetAmount: 800, priority: 1, dueDate: '' },
      { id: 10, name: 'خرید کنسول بازی', targetAmount: 700, priority: 1, dueDate: '' }
    ]
    setChalehs(exampleChalehs)
  }, [])

  const addChaleh = () => {
    if (!newChaleh.name || !newChaleh.targetAmount) {
      setError('لطفاً نام چاله و مبلغ هدف را وارد کنید.')
      return
    }
    const chaleh = {
      id: Date.now(),
      name: newChaleh.name,
      targetAmount: parseFloat(newChaleh.targetAmount),
      priority: parseInt(newChaleh.priority),
      dueDate: newChaleh.dueDate
    }
    setChalehs([...chalehs, chaleh])
    setNewChaleh({ name: '', targetAmount: '', priority: 3, dueDate: '' })
    setError('')
  }

  const removeChaleh = (id) => setChalehs(chalehs.filter(ch => ch.id !== id))

  const startEditChaleh = (chaleh) => setEditingChaleh({ ...chaleh, targetAmount: chaleh.targetAmount.toString() })

  const saveEditChaleh = () => {
    if (!editingChaleh.name || !editingChaleh.targetAmount) {
      setError('لطفاً نام چاله و مبلغ هدف را وارد کنید.')
      return
    }
    const updated = chalehs.map(ch => ch.id === editingChaleh.id
      ? { ...editingChaleh, targetAmount: parseFloat(editingChaleh.targetAmount), priority: parseInt(editingChaleh.priority) }
      : ch)
    setChalehs(updated)
    setEditingChaleh(null)
    setError('')
  }

  const cancelEditChaleh = () => setEditingChaleh(null)

  const calculateAllocations = () => {
    setResult(null)
    setError('')

    const income = parseFloat(monthlyIncome)
    const fixedChaleh = parseFloat(fixedMonthlyChaleh)
    const otherExpenses = parseFloat(otherMonthlyExpenses)
    const savings = parseFloat(desiredMonthlySavings)

    if ([income, fixedChaleh, otherExpenses, savings].some(v => isNaN(v))) {
      setError('لطفاً همه فیلدهای مالی را با اعداد معتبر پر کنید.')
      return
    }
    if (income <= 0 || fixedChaleh < 0 || otherExpenses < 0 || savings < 0) {
      setError('مقادیر وارد شده باید مثبت باشند.')
      return
    }
    if (chalehs.length === 0) {
      setError('لطفاً حداقل یک چاله تعریف کنید.')
      return
    }

    const availableFunds = income - fixedChaleh - otherExpenses - savings
    if (availableFunds <= 0) {
      setError('با درآمد و هزینه‌های فعلی، پولی برای رسیدن به اهداف باقی نمی‌ماند.')
      return
    }

    // Sort by time-bound then priority
    const sortedChalehs = [...chalehs].sort((a, b) => {
      const aIsTimeBound = a.dueDate && new Date(a.dueDate) > new Date()
      const bIsTimeBound = b.dueDate && new Date(b.dueDate) > new Date()
      if (aIsTimeBound && !bIsTimeBound) return -1
      if (!aIsTimeBound && bIsTimeBound) return 1
      return b.priority - a.priority
    })

    // ===== Normalized priority allocation with Largest Remainder =====
    const allocations = {}
    const chalehsByPriority = {}
    sortedChalehs.forEach(ch => {
      if (!chalehsByPriority[ch.priority]) chalehsByPriority[ch.priority] = []
      chalehsByPriority[ch.priority].push(ch)
    })

    let presentPriorityWeightSum = 0
    Object.keys(chalehsByPriority).forEach(pStr => {
      presentPriorityWeightSum += PRIORITY_LEVELS[parseInt(pStr, 10)].percentage
    })

    if (presentPriorityWeightSum === 0) {
      sortedChalehs.forEach(ch => (allocations[ch.id] = 0))
    } else {
      const items = []
      sortedChalehs.forEach(ch => {
        const p = ch.priority
        const priorityPercent = PRIORITY_LEVELS[p].percentage
        const countInP = chalehsByPriority[p].length
        const perGoalWeight = priorityPercent / countInP
        const normalizedWeight = perGoalWeight / presentPriorityWeightSum
        const raw = availableFunds * normalizedWeight
        const floorVal = Math.floor(raw)
        const frac = raw - floorVal
        items.push({ id: ch.id, priority: p, raw, floorVal, frac })
      })
      const sumFloors = items.reduce((s, it) => s + it.floorVal, 0)
      let remainder = Math.round(availableFunds - sumFloors)
      items.sort((a, b) => {
        if (b.frac !== a.frac) return b.frac - a.frac
        if (b.priority !== a.priority) return b.priority - a.priority
        return a.id - b.id
      })
      for (let i = 0; i < items.length && remainder > 0; i++) {
        items[i].floorVal += 1
        remainder -= 1
      }
      items.forEach(it => (allocations[it.id] = it.floorVal))
    }
    // ===== End normalized allocation =====

    const plan = simulateGlobalPlan(sortedChalehs, allocations, availableFunds, savings)


    setResult({
      availableFunds,
      sortedChalehs,
      allocations,
      plan,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <img src={chalehLogo} alt="چاله" className="w-12 h-12" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">چاله</h1>
              <p className="text-gray-600">مدیریت چندین هدف مالی با اولویت‌بندی هوشمند</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Input Forms */}
          <div className="space-y-6">
            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle>اطلاعات مالی شما</CardTitle>
                <CardDescription>لطفاً اطلاعات مالی ماهانه خود را وارد کنید</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="monthlyIncome">درآمد ماهانه (یورو)</Label>
                  <Input id="monthlyIncome" type="number" placeholder="مثال: 3000" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="fixedMonthlyChaleh">چاله‌های ثابت ماهانه (یورو)</Label>
                  <Input id="fixedMonthlyChaleh" type="number" placeholder="مثال: 800 (اجاره، قسط و...)" value={fixedMonthlyChaleh} onChange={(e) => setFixedMonthlyChaleh(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="otherMonthlyExpenses">سایر هزینه‌های ماهانه (یورو)</Label>
                  <Input id="otherMonthlyExpenses" type="number" placeholder="مثال: 500 (خوراک، حمل‌ونقل و...)" value={otherMonthlyExpenses} onChange={(e) => setOtherMonthlyExpenses(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="desiredMonthlySavings">پس‌انداز ماهانه مطلوب (یورو)</Label>
                  <Input id="desiredMonthlySavings" type="number" placeholder="مثال: 1000" value={desiredMonthlySavings} onChange={(e) => setDesiredMonthlySavings(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            {/* Add New Chaleh or Edit Existing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  {editingChaleh ? 'ویرایش چاله' : 'افزودن چاله جدید'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="chalehName">نام چاله</Label>
                  <Input id="chalehName" placeholder="مثال: خرید ماشین" value={editingChaleh ? editingChaleh.name : newChaleh.name} onChange={(e) => editingChaleh ? setEditingChaleh({ ...editingChaleh, name: e.target.value }) : setNewChaleh({ ...newChaleh, name: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="targetAmount">مبلغ هدف (یورو)</Label>
                  <Input id="targetAmount" type="number" placeholder="مثال: 15000" value={editingChaleh ? editingChaleh.targetAmount : newChaleh.targetAmount} onChange={(e) => editingChaleh ? setEditingChaleh({ ...editingChaleh, targetAmount: e.target.value }) : setNewChaleh({ ...newChaleh, targetAmount: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="priority">سطح اولویت</Label>
                  <Select value={(editingChaleh ? editingChaleh.priority : newChaleh.priority).toString()} onValueChange={(value) => editingChaleh ? setEditingChaleh({ ...editingChaleh, priority: parseInt(value) }) : setNewChaleh({ ...newChaleh, priority: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_LEVELS).map(([level, config]) => (
                        <SelectItem key={level} value={level}>
                          {config.name} ({config.percentage}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dueDate">تاریخ سررسید (اختیاری)</Label>
                  <Input id="dueDate" type="date" value={editingChaleh ? editingChaleh.dueDate : newChaleh.dueDate} onChange={(e) => editingChaleh ? setEditingChaleh({ ...editingChaleh, dueDate: e.target.value }) : setNewChaleh({ ...newChaleh, dueDate: e.target.value })} />
                </div>
                {editingChaleh ? (
                  <div className="flex gap-2">
                    <Button onClick={saveEditChaleh} className="flex-1">ذخیره تغییرات</Button>
                    <Button onClick={cancelEditChaleh} variant="outline" className="flex-1">لغو</Button>
                  </div>
                ) : (
                  <Button onClick={addChaleh} className="w-full">افزودن چاله</Button>
                )}
              </CardContent>
            </Card>

            <Button onClick={calculateAllocations} className="w-full" size="lg">محاسبه تخصیص بودجه به چاله‌ها</Button>
          </div>

          {/* Right Column: Chalehs List & Results */}
          <div className="space-y-6">
            {/* Current Chalehs */}
            <Card>
              <CardHeader>
                <CardTitle>چاله‌های فعلی ({chalehs.length})</CardTitle>
                <CardDescription>لیست چاله‌های تعریف شده با اولویت‌بندی</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {chalehs.map((chaleh) => (
                    <div key={chaleh.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">{chaleh.name}</div>
                          <div className="text-sm text-gray-600">
                            {chaleh.targetAmount.toLocaleString()} € {chaleh.dueDate && ` • ${new Date(chaleh.dueDate).toLocaleDateString('fa-IR')}`}
                          </div>
                        </div>
                        <Badge className={PRIORITY_LEVELS[chaleh.priority].color}>{PRIORITY_LEVELS[chaleh.priority].name}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => startEditChaleh(chaleh)}>ویرایش</Button>
                        <Button variant="ghost" size="sm" onClick={() => removeChaleh(chaleh.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {/* Results */}
            {result && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">تخصیص بودجه ماهانه</CardTitle>
                  <CardDescription>پول باقی‌مانده: {result.availableFunds} یورو در ماه</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Global Tepe summary */}
                  <TepeProgress plan={result.plan} tepeStart={DEFAULT_TEPE_START} />

                  <div className="space-y-4">
                    {result.sortedChalehs.map((chaleh) => (
                      <ChalehProgress
                        key={chaleh.id}
                        chaleh={chaleh}
                        initialAllocation={result.allocations[chaleh.id]}
                        allChalehs={result.sortedChalehs}
                        allAllocations={result.allocations}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
