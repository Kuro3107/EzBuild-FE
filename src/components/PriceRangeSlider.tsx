import React from 'react'
import { Slider } from 'antd'

interface PriceRangeSliderProps {
  value: [number, number]
  onChange: (value: [number, number]) => void
  min?: number
  max?: number
  step?: number
  currency?: string
  className?: string
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  value,
  onChange,
  min = 50,
  max = 2000,
  step = 10,
  currency = '$',
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex justify-between text-sm font-medium text-gray-700">
        <span>{currency}{value[0]}</span>
        <span>{currency}{value[1]}</span>
      </div>
      <Slider
        range
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(value) => onChange(value as [number, number])}
        trackStyle={[{ backgroundColor: '#3b82f6' }]}
        handleStyle={[
          { 
            borderColor: '#3b82f6',
            backgroundColor: '#3b82f6',
            boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)',
            width: '16px',
            height: '16px',
            marginTop: '-6px'
          },
          { 
            borderColor: '#3b82f6',
            backgroundColor: '#3b82f6',
            boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)',
            width: '16px',
            height: '16px',
            marginTop: '-6px'
          }
        ]}
        railStyle={{ 
          backgroundColor: '#e5e7eb',
          height: '4px'
        }}
        dotStyle={{
          borderColor: '#d1d5db',
          backgroundColor: '#d1d5db'
        }}
        activeDotStyle={{
          borderColor: '#3b82f6',
          backgroundColor: '#3b82f6'
        }}
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{currency}{min}</span>
        <span>{currency}{max}</span>
      </div>
    </div>
  )
}

export default PriceRangeSlider
