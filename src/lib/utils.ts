export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercent(rate: number): string {
  return `${rate >= 0 ? '+' : ''}${rate.toFixed(1)}%`;
}

export function getScoreColor(score: number): {
  text: string;
  bg: string;
  border: string;
} {
  if (score >= 85) {
    return {
      text: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    };
  }
  if (score >= 70) {
    return {
      text: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    };
  }
  if (score >= 50) {
    return {
      text: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    };
  }
  return {
    text: 'text-stone-600',
    bg: 'bg-stone-100',
    border: 'border-stone-200',
  };
}

export function getStatusBadge(status: string): {
  label: string;
  classes: string;
} {
  switch (status) {
    case 'interested':
      return {
        label: 'Interested',
        classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    case 'contacted':
      return {
        label: 'Contacted',
        classes: 'bg-blue-50 text-blue-700 border-blue-200',
      };
    case 'in_sequence':
      return {
        label: 'In Sequence',
        classes: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      };
    case 'ready':
      return {
        label: 'Ready',
        classes: 'bg-stone-100 text-stone-700 border-stone-200',
      };
    case 'unverified':
      return {
        label: 'Unverified',
        classes: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    case 'not_interested':
      return {
        label: 'Not Interested',
        classes: 'bg-stone-50 text-stone-500 border-stone-200',
      };
    default:
      return {
        label: status,
        classes: 'bg-stone-100 text-stone-700 border-stone-200',
      };
  }
}
