import type { ComponentType } from '@/types';
import {
  Monitor,
  Server,
  Database,
  Zap,
  ListOrdered,
  Network,
  Cloud,
  type LucideIcon,
} from 'lucide-react';

export interface ComponentConfig {
  type: ComponentType;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  width: number;
  height: number;
}

export const componentConfigs: Record<ComponentType, ComponentConfig> = {
  client: {
    type: 'client',
    label: 'Client',
    icon: Monitor,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    width: 140,
    height: 80,
  },
  server: {
    type: 'server',
    label: 'Server / API',
    icon: Server,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    width: 140,
    height: 80,
  },
  database: {
    type: 'database',
    label: 'Database',
    icon: Database,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    width: 140,
    height: 80,
  },
  cache: {
    type: 'cache',
    label: 'Cache',
    icon: Zap,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    width: 140,
    height: 80,
  },
  queue: {
    type: 'queue',
    label: 'Queue',
    icon: ListOrdered,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    width: 140,
    height: 80,
  },
  load_balancer: {
    type: 'load_balancer',
    label: 'Load Balancer',
    icon: Network,
    color: 'text-slate-700',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-400',
    width: 140,
    height: 80,
  },
  external_service: {
    type: 'external_service',
    label: 'External Service',
    icon: Cloud,
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-300',
    width: 140,
    height: 80,
  },
};

export const componentLibrary: ComponentConfig[] = Object.values(componentConfigs);
