'use client'

import { GetWorkflowExecutionWithPhases } from '@/actions/workflows/getWorkflowExecutionWithPhases';
import { GetWorkflowPhaseDetails } from '@/actions/workflows/getWorkflowPhaseDetails';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DatesToDuration } from '@/lib/helper/dates';
import { GetPhasesTotalCost } from '@/lib/helper/phases';
import { cn } from '@/lib/utils';
import { LogLevel } from '@/types/log';
import { ExecutionPhaseStatus, WorkflowExecutionStatus } from '@/types/workflows';
import { ExecutionLog } from '@prisma/client';
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns';
import {
  CalendarIcon,
  CircleDashedIcon,
  ClockIcon,
  CoinsIcon,
  CopyIcon,
  Loader2Icon,
  LucideIcon,
  WorkflowIcon
} from 'lucide-react';
import React, { ReactNode, useEffect, useState } from 'react'
import PhaseStatusBadge from './PhaseStatusBadge';
import ReactCountUpWrapper from '@/components/ReactCountUpWrapper';
import {toast} from "sonner";

type ExecutionData = Awaited<ReturnType<typeof GetWorkflowExecutionWithPhases>>;

export default function ExecutionViewer({ execution }: { execution: ExecutionData }) {
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["execution", execution.id],
    initialData: execution,
    queryFn: () => GetWorkflowExecutionWithPhases(execution.id),
    refetchInterval: (q) => q.state.data?.status === WorkflowExecutionStatus.RUNNING ? 1000 : false,
  });

  const phaseDetails = useQuery({
    queryKey: ["phaseDetails", selectedPhase],
    enabled: selectedPhase !== null,
    queryFn: () => GetWorkflowPhaseDetails(selectedPhase!),
    refetchInterval: () => query.data?.status === WorkflowExecutionStatus.RUNNING ? 1000 : false,
  })

  const startedAt = query.data?.startedAt ? formatDistanceToNow(query.data?.startedAt, { addSuffix: true }) : '-';
  const duration = DatesToDuration(query.data?.completedAt, query.data?.startedAt);
  const creditsConsumed = GetPhasesTotalCost(query.data?.phases || []);
  const isRunning = query.data?.status === WorkflowExecutionStatus.RUNNING;

  useEffect(() => {
    const phases = query.data?.phases || [];
    if (isRunning) {
      const phaseToSelect = phases.toSorted((a, b) => a.startedAt! > b.startedAt! ? -1 : 1)[0];
      setSelectedPhase(phaseToSelect.id);
      return;
    }

    const phaseToSelect = phases.toSorted((a, b) => a.completedAt! > b.completedAt! ? -1 : 1)[0];
    setSelectedPhase(phaseToSelect.id);
  }, [query.data?.phases, isRunning, setSelectedPhase])

  return (
    <div className='flex w-full h-full'>
      <aside className='w-[440px] min-w-[440px] max-w-[440px] border-r-2 border-separate flex flex-grow flex-col overflow-hidden'>
        <div className="py-4 px-2">
          <ExecutionLabel 
            icon={CircleDashedIcon} 
            label='Status' 
            value={
              <div className='font-semibold capitalize flex gap-2 items-center'>
                <PhaseStatusBadge status={query.data?.status as ExecutionPhaseStatus} />
                <span>{query.data?.status}</span>
              </div>
            } 
          />

          <ExecutionLabel 
            icon={CalendarIcon} 
            label='Started at' 
            value={<span className='lowercase'>{startedAt}</span>} 
          />

          <ExecutionLabel 
            icon={ClockIcon}
            label='Duration'
            value={duration ? duration : <Loader2Icon className='animate-spin' size={20} />}
          />

          <ExecutionLabel 
            icon={CoinsIcon}
            label='Credits consumed'
            value={<ReactCountUpWrapper value={creditsConsumed} />}
          />
        </div>

        <Separator />

        <div className='flex justify-center items-center py-2 px-4'>
          <div className='text-muted-foreground flex items-center gap-2'>
            <WorkflowIcon size={20} className='stroke-muted-foreground/80' />
            <span className="font-semibold">Phases</span>
          </div>
        </div>

        <Separator />

        <div className="overflow-auto h-full px-2 py-4">
          {query.data?.phases.map((phase, index) => (
            <Button 
              key={phase.id} 
              variant={selectedPhase === phase.id ? 'secondary' : 'ghost'} 
              className='w-full justify-between'
              onClick={() => {
                if (isRunning) return;
                setSelectedPhase(phase.id)
              }}
            >
              <div className='flex items-center gap-2'>
                <Badge variant={'outline'}>{index + 1}</Badge>
                <p className='font-semibold'>{phase.name}</p>
              </div>
              <PhaseStatusBadge status={phase.status as ExecutionPhaseStatus} />
            </Button>
          ))}
        </div>
      </aside>
      <div className='flex w-full h-full'>
        {isRunning && (
          <div className='flex items-center flex-col gap-2 justify-center h-full w-full'>
            <p className='font-bold'>Run is in progress, please wait</p>
          </div>
        )}
        {!isRunning && !selectedPhase && (
          <div className='flex items-center flex-col gap-2 justify-center h-full w-full'>
            <div className='flex flex-col gap-1 text-center'>
              <p className='font-bold'>No phase selected</p>
              <p className='text-sm text-muted-foreground'>Select a phase to view details</p>
            </div>
          </div>
        )}
        {!isRunning && selectedPhase && (
          <div className='flex flex-col py-4 container gap-4 overflow-auto'>
            <div className='flex gap-2 items-center'>
              <Badge variant={"outline"} className='space-x-4'>
                <div className='flex gap-1 items-center'>
                  <CoinsIcon size={18} className='stroke-muted-foreground' />
                  <span>Credits</span>
                </div>
                <span>{phaseDetails.data?.creditsConsumed}</span>
              </Badge>

              <Badge variant={"outline"} className='space-x-4'>
                <div className='flex gap-1 items-center'>
                  <ClockIcon size={18} className='stroke-muted-foreground' />
                  <span>Duration</span>
                </div>
                <span>{DatesToDuration(phaseDetails.data?.completedAt, phaseDetails.data?.startedAt) || "-"}</span>
              </Badge>
            </div>

            <ParameterViewer 
              title="Inputs" 
              subtitle="Inputs used for this phase" 
              paramsJSON={phaseDetails.data?.inputs} 
            />

            <ParameterViewer 
              title="Outputs" 
              subtitle="Outputs generated in this phase" 
              paramsJSON={phaseDetails.data?.outputs} 
            />

            <LogsViewer logs={phaseDetails.data?.logs} />
          </div>
        )}
      </div>
    </div>
  )
}

function LogsViewer({ logs }: { logs: ExecutionLog[] | undefined }) {
  if (!logs || logs.length === 0) return null;

  return (
    <Card className='w-full'>
      <CardHeader className='rounded-lg rounded-b-none border-b py-4 bg-gray-50 dark:bg-background'>
        <CardTitle className='text-base'>Logs</CardTitle>
        <CardDescription className='text-muted-foreground text-sm'>Logs generated by this phase</CardDescription>
      </CardHeader>
      <CardContent className='p-0'>
        <Table>
          <TableHeader className='text-muted-foreground text-sm'>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map(log => (
              <TableRow key={log.id} className='text-muted-foreground'>
                <TableCell 
                  width={190} 
                  className='text-xs text-muted-foreground p-[2px] pl-4'
                >
                  {log.timestamp.toISOString()}
                </TableCell>
                <TableCell 
                  width={80}
                  className={cn(
                    'uppercase text-xs font-bold p-[3px] pl-4',
                    log.logLevel as LogLevel === 'error' && 'text-destructive',
                    log.logLevel as LogLevel === 'info' && 'text-primary'
                  )}
                >
                  {log.logLevel}
                </TableCell>
                <TableCell className='text-sm flex-1 p-[3px] pl-4'>{log.message}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function ParameterViewer({ title, subtitle, paramsJSON }: { title: string, subtitle: string, paramsJSON?: string | null }) {
  const params = paramsJSON ? JSON.parse(paramsJSON) : undefined;

  const handleCopyValue = async (value: string) => {
    await navigator.clipboard.writeText(value as string);
    toast.success('Copied to clipboard');
  }

  return (
    <Card>
      <CardHeader className='rounded-lg rounded-b-none border-b py-4 bg-gray-50 dark:bg-background'>
        <CardTitle className='text-base'>{title}</CardTitle>
        <CardDescription className='text-muted-foreground text-sm'>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className='py-4'>
        <div className="flex flex-col gap-2">
          {(!params || Object.keys(params).length === 0) && (
            <p className='text-sm'>No parameters generated by this phase</p>
          )}
          {params && Object.entries(params).map(([key, value]) => (
            <div 
              key={key} 
              className="flex justify-between items-center space-y-1"
            >
              <p className='text-sm text-muted-foreground flex-1 basis-1/3'>{key}</p>
              <div className="basis-2/3 flex gap-2">
                <Input readOnly className='flex-1' value={value as string} />
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => handleCopyValue(value as string)}
                >
                  <CopyIcon />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ExecutionLabel({ icon, label, value }: { icon: LucideIcon, label: ReactNode, value: ReactNode }) {
  const IconComponent = icon;

  return (
    <div className='flex justify-between items-center py-2 px-4 text-sm'>
      <div className="text-muted-foreground flex items-center gap-2">
        <IconComponent size={20} className='stroke-muted-foreground' />
        <span>{label}</span>
      </div>
      <div className="font-semibold capitalize flex gap-2 items-center">
        {value}
      </div>
    </div>
  )
}