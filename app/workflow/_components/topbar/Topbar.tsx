'use client'

import TooltipWrapper from '@/components/TooltipWrapper'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import SaveButton from './SaveButton'
import ExecuteButton from './ExecuteButton'

interface Props {
  title: string;
  subtitle?: string;
  href?: string;
  workflowId: string;
  hideButtons?: boolean;
}

function Topbar({ title, subtitle, href, workflowId, hideButtons = false}: Props) {
  const router = useRouter();

  return (
    <header className='flex p-2 border-b-2 border-separate justify-between w-full h-[60px] sticky top-0 bg-background z-10'>
      <div className="flex gap-1 flex-1">
        <TooltipWrapper content="Back to workflows">
          <Button 
            variant={'ghost'} 
            size={'icon'} 
            onClick={() => {
              if (!href) {
                router.push('/workflows')
                return;
              }

              router.push(href)
            }}
          >
            <ChevronLeftIcon size={20} />
          </Button> 
        </TooltipWrapper>
        <div>
          <p className='font-bold text-ellipsis truncate'>{title}</p>
          {subtitle && (
            <p className='text-xs text-muted-foreground truncate text-ellipsis'>{subtitle}</p>
          )}
        </div>
      </div>
      <div className='flex flex-1 gap-1 justify-end'>
        {!hideButtons && (
          <>
            <ExecuteButton workflowId={workflowId} />
            <SaveButton workflowId={workflowId} />
          </>
        )}
      </div>
    </header>
  )
}

export default Topbar