import { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  children: ReactNode
  actions?: ReactNode
}

export default function ChartCard({ title, children, actions }: ChartCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {actions && <div>{actions}</div>}
      </div>
      {children}
    </div>
  )
}
