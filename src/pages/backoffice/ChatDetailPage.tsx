import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import CheckRounded from '@mui/icons-material/CheckRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import StopCircleRounded from '@mui/icons-material/StopCircleRounded';
import ChatMessageList from '@/components/ChatMessageList';
import ChatInput from '@/components/ChatInput';
import { getChatDetail, patchActionRequest, escalateChat } from '@/api/backoffice.api';
import type { ChatDetailData } from '@/types/api';
import { STATUS_LABELS, STATUS_COLORS, getStatusName } from '@/utils/chatStatus';

/** Chat detail page — full height, conversation + right sidebar with status, actions, report */
const ChatDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const chatId = Number(id);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [detail, setDetail] = useState<ChatDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isActioning, setIsActioning] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getChatDetail(chatId);
      setDetail(response.data);
      setError(null);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load chat');
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  /** CS manager sends a reply — this also escalates to human */
  const handleSendMessage = async (text: string) => {
    setIsSending(true);
    try {
      await escalateChat(chatId, { escalate_to_human: true, message: text });
      await fetchDetail();
    } catch {
      setError('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  /** Stop AI agent — escalate without a message */
  const handleStopAiAgent = async () => {
    setIsStopping(true);
    try {
      await escalateChat(chatId, { escalate_to_human: true, message: '' });
      await fetchDetail();
    } catch {
      setError('Failed to stop AI agent');
    } finally {
      setIsStopping(false);
    }
  };

  const handleActionRequest = async (action: 'accepted' | 'rejected') => {
    if (!detail?.open_action) return;
    setIsActioning(true);
    try {
      await patchActionRequest(detail.open_action.id, { action });
      await fetchDetail();
    } catch {
      setError('Failed to process action request');
    } finally {
      setIsActioning(false);
    }
  };

  if (isLoading && !detail) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!detail) {
    return <Alert severity="error">{error ?? 'Chat not found'}</Alert>;
  }

  const statusName = getStatusName(detail.chat.chat_status_id);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexShrink: 0 }}>
        <Typography variant="h4" fontWeight={700}>
          Chat #{chatId}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, flexShrink: 0 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Main content — fills remaining height */}
      <Box sx={{ display: 'flex', gap: 3, flex: 1, minHeight: 0 }}>
        {/* Left: Conversation + input */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 1 }}>
              <ChatMessageList messages={detail.chat.chat_messages} />
            </Box>
          </Paper>

          {/* Message input + Stop AI button */}
          <Box sx={{ mt: 2, flexShrink: 0, display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <Box sx={{ flex: 1 }}>
              <ChatInput
                onSend={handleSendMessage}
                disabled={isSending}
                placeholder="Reply as support agent..."
              />
            </Box>
            <Button
              variant="outlined"
              color="error"
              onClick={handleStopAiAgent}
              disabled={isStopping || statusName === 'open_support' || statusName === 'closed_support'}
              startIcon={<StopCircleRounded />}
              sx={{ height: 48, whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              {isStopping ? 'Stopping...' : 'Stop AI Agent'}
            </Button>
          </Box>
        </Box>

        {/* Right sidebar */}
        <Box sx={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {/* Status */}
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Status
            </Typography>
            <Chip
              label={STATUS_LABELS[statusName] ?? statusName}
              color={STATUS_COLORS[statusName] ?? 'default'}
              size="medium"
            />
          </Paper>

          {/* Report */}
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Report
            </Typography>
            {detail.report?.report_data ? (
              <Box
                component="pre"
                sx={{
                  fontSize: 13,
                  bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'grey.50',
                  p: 1.5,
                  borderRadius: 1,
                  overflow: 'auto',
                  maxHeight: 180,
                  m: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {JSON.stringify(detail.report.report_data, null, 2)}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">No report available</Typography>
            )}
          </Paper>

          {/* Action Request */}
          {detail.open_action && (
            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Pending Action Request
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Action ID: {detail.open_action.action_id}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  startIcon={<CheckRounded />}
                  onClick={() => handleActionRequest('accepted')}
                  disabled={isActioning}
                >
                  Accept
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  startIcon={<CloseRounded />}
                  onClick={() => handleActionRequest('rejected')}
                  disabled={isActioning}
                >
                  Reject
                </Button>
              </Box>
            </Paper>
          )}

          {/* Chat metadata */}
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Details
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Created</Typography>
                <Typography variant="body2">{new Date(detail.chat.created_at).toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Updated</Typography>
                <Typography variant="body2">{new Date(detail.chat.updated_at).toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Priority</Typography>
                <Typography variant="body2">{detail.chat.priority_level_id}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Created by LLM</Typography>
                <Typography variant="body2">{detail.chat.created_by_llm ? 'Yes' : 'No'}</Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatDetailPage;
