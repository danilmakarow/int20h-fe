/** Map chat_status_id to status name string */
export const STATUS_ID_TO_NAME: Record<number, string> = {
  1: 'open_ai_agent',
  2: 'open_support',
  3: 'closed_support',
  4: 'closed_ai_agent',
};

/** Human-readable labels for status names */
export const STATUS_LABELS: Record<string, string> = {
  open_support: 'Open — Support',
  open_ai_agent: 'Open — AI Agent',
  closed_support: 'Closed — Support',
  closed_ai_agent: 'Closed — AI Agent',
};

/** MUI chip colors for status names */
export const STATUS_COLORS: Record<string, 'warning' | 'info' | 'default' | 'success'> = {
  open_support: 'warning',
  open_ai_agent: 'info',
  closed_support: 'default',
  closed_ai_agent: 'success',
};

/** Priority labels by priority_level_id */
export const PRIORITY_LABELS: Record<number, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Critical',
};

/** MUI chip colors for priority levels */
export const PRIORITY_COLORS: Record<number, 'default' | 'info' | 'warning' | 'error'> = {
  1: 'default',
  2: 'info',
  3: 'warning',
  4: 'error',
};

/** Get status name from chat_status_id */
export const getStatusName = (statusId: number): string => {
  return STATUS_ID_TO_NAME[statusId] ?? 'unknown';
};
