'use client'

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea';
import { ParamProps } from '@/types/app-nodes';
import React, { useEffect, useId, useState } from 'react'

function StringParamField({ param, value, updateValue, disabled }: ParamProps) {
  const id = useId();
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value])

  let Component: any = Input;

  if (param.variant === "textarea") {
    Component = Textarea
  }

  return (
    <div className='space-y-1 p-1  w-full'>
      <Label htmlFor={id} className='text-xs flex'>
        {param.name}
        {param.required && (
          <p className='text-red-400 px-2'>*</p>
        )}
      </Label>
      <Component 
        id={id} 
        value={internalValue}
        className='text-xs resize-none'
        onChange={(e: any) => setInternalValue(e?.target.value)}
        onBlur={(e: any) => updateValue(e.target.value)}
        placeholder='Enter value here'
        disabled={disabled}
      />
      {param.helperText && (
        <p className='text-muted-foreground px-2'>{param.helperText}</p>
      )}
    </div>
  )
}

export default StringParamField