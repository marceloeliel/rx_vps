'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
    direction: 'up' | 'down' | 'neutral'
  }
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
  loading?: boolean
  onClick?: () => void
}

export default function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = 'blue',
  loading = false,
  onClick
}: StatsCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      trend: {
        up: 'text-green-600 bg-green-50',
        down: 'text-red-600 bg-red-50',
        neutral: 'text-gray-600 bg-gray-50'
      }
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      trend: {
        up: 'text-green-600 bg-green-50',
        down: 'text-red-600 bg-red-50',
        neutral: 'text-gray-600 bg-gray-50'
      }
    },
    yellow: {
      bg: 'bg-yellow-50',
      icon: 'text-yellow-600',
      trend: {
        up: 'text-green-600 bg-green-50',
        down: 'text-red-600 bg-red-50',
        neutral: 'text-gray-600 bg-gray-50'
      }
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      trend: {
        up: 'text-green-600 bg-green-50',
        down: 'text-red-600 bg-red-50',
        neutral: 'text-gray-600 bg-gray-50'
      }
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      trend: {
        up: 'text-green-600 bg-green-50',
        down: 'text-red-600 bg-red-50',
        neutral: 'text-gray-600 bg-gray-50'
      }
    },
    gray: {
      bg: 'bg-gray-50',
      icon: 'text-gray-600',
      trend: {
        up: 'text-green-600 bg-green-50',
        down: 'text-red-600 bg-red-50',
        neutral: 'text-gray-600 bg-gray-50'
      }
    }
  }

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`
      }
      return val.toLocaleString('pt-BR')
    }
    return val
  }

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return '↗'
      case 'down':
        return '↘'
      default:
        return '→'
    }
  }

  return (
    <Card 
      className={`transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        {loading ? (
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{title}</h3>
              <div className={`p-2 rounded-lg ${colorClasses[color].bg}`}>
                <Icon className={`h-4 w-4 ${colorClasses[color].icon}`} />
              </div>
            </div>
            
            <div className="mb-2">
              <div className="text-2xl font-bold text-gray-900">
                {formatValue(value)}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              {description && (
                <p className="text-xs text-gray-500">{description}</p>
              )}
              
              {trend && (
                <Badge 
                  variant="outline" 
                  className={`text-xs px-2 py-1 ${colorClasses[color].trend[trend.direction]}`}
                >
                  <span className="mr-1">{getTrendIcon(trend.direction)}</span>
                  {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
                </Badge>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}