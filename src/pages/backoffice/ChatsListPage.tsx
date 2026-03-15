import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import SearchRounded from '@mui/icons-material/SearchRounded';
import { getChats, getUsers } from '@/api/backoffice.api';
import type { ChatListItem } from '@/types/api';
import type { User } from '@/types/entities';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  getStatusName,
} from '@/utils/chatStatus';

type SortField = 'chat_id' | 'user_name' | 'priority' | 'status' | 'first_message' | 'issue_type';
type SortDirection = 'asc' | 'desc';

/** Extract issue type from report data */
const getIssueType = (item: ChatListItem): string => {
  if (!item.report?.report_data) return '—';
  const data = item.report.report_data;
  if (typeof data === 'object' && 'issue_type' in data && typeof data.issue_type === 'string') {
    return data.issue_type;
  }
  return '—';
};

/** Get user display name from users map */
const getUserName = (userId: number | null, usersMap: Map<number, User>): string => {
  if (!userId) return '—';
  const user = usersMap.get(userId);
  if (!user) return `User #${userId}`;
  const fullName = `${user.first_name} ${user.last_name}`.trim();
  return fullName || user.username || '—';
};

const SKELETON_ROWS = 6;
const COLUMN_COUNT = 6;

/** All chats list page with table, filtering, and sorting */
const ChatsListPage = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('chat_id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const usersMap = useMemo(() => {
    const map = new Map<number, User>();
    users.forEach((user) => map.set(user.user_id, user));
    return map;
  }, [users]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [chatsRes, usersRes] = await Promise.all([getChats(), getUsers()]);
      setChats(chatsRes.data);
      setUsers(usersRes.data);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  /** Get sortable value for a given field */
  const getSortValue = (item: ChatListItem, field: SortField): string | number => {
    const statusName = getStatusName(item.chat.chat_status_id);
    switch (field) {
      case 'chat_id':
        return item.chat.chat_id;
      case 'user_name':
        return getUserName(item.chat.user_id, usersMap).toLowerCase();
      case 'priority':
        return item.chat.priority_level_id;
      case 'status':
        return statusName;
      case 'first_message':
        return (item.first_message ?? '').toLowerCase();
      case 'issue_type':
        return getIssueType(item).toLowerCase();
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = chats;

    // Filter by status
    if (statusFilter) {
      result = result.filter((item) => getStatusName(item.chat.chat_status_id) === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) => {
        const userName = getUserName(item.chat.user_id, usersMap).toLowerCase();
        const firstMessage = (item.first_message ?? '').toLowerCase();
        const issueType = getIssueType(item).toLowerCase();
        const chatId = String(item.chat.chat_id);
        return (
          userName.includes(query) ||
          firstMessage.includes(query) ||
          issueType.includes(query) ||
          chatId.includes(query)
        );
      });
    }

    // Sort
    result = [...result].sort((itemA, itemB) => {
      const valueA = getSortValue(itemA, sortField);
      const valueB = getSortValue(itemB, sortField);
      const comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [chats, statusFilter, searchQuery, sortField, sortDirection, usersMap]);

  const renderSortableHeader = (field: SortField, label: string) => (
    <TableSortLabel
      active={sortField === field}
      direction={sortField === field ? sortDirection : 'asc'}
      onClick={() => handleSort(field)}
    >
      {label}
    </TableSortLabel>
  );

  return (
    <>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Chats
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded sx={{ fontSize: 20, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: 300 }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          sx={{ width: 220 }}
        >
          <MenuItem value="">All statuses</MenuItem>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>{renderSortableHeader('chat_id', 'ID')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{renderSortableHeader('user_name', 'User')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{renderSortableHeader('priority', 'Priority')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{renderSortableHeader('status', 'Status')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{renderSortableHeader('first_message', 'First Message')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{renderSortableHeader('issue_type', 'Issue Type')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading &&
              Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {Array.from({ length: COLUMN_COUNT }).map((_, colIndex) => (
                    <TableCell key={`skeleton-${rowIndex}-${colIndex}`}>
                      <Skeleton variant="text" width={colIndex === 4 ? '80%' : '60%'} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading &&
              filteredAndSorted.map((item) => {
                const statusName = getStatusName(item.chat.chat_status_id);
                return (
                  <TableRow
                    key={item.chat.chat_id}
                    hover
                    sx={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                    onClick={() => navigate(`/bo/chat/${item.chat.chat_id}`)}
                  >
                    <TableCell>#{item.chat.chat_id}</TableCell>
                    <TableCell>{getUserName(item.chat.user_id, usersMap)}</TableCell>
                    <TableCell>
                      <Chip
                        label={PRIORITY_LABELS[item.chat.priority_level_id] ?? `P${item.chat.priority_level_id}`}
                        size="small"
                        color={PRIORITY_COLORS[item.chat.priority_level_id] ?? 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={STATUS_LABELS[statusName] ?? statusName}
                        size="small"
                        color={STATUS_COLORS[statusName] ?? 'default'}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 300,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.first_message ?? '—'}
                    </TableCell>
                    <TableCell>{getIssueType(item)}</TableCell>
                  </TableRow>
                );
              })}

            {!isLoading && filteredAndSorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={COLUMN_COUNT} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    {chats.length === 0 ? 'No chats found' : 'No chats match the current filters'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default ChatsListPage;
