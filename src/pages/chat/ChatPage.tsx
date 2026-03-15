import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import ChatMessageList from '@/components/ChatMessageList';
import ChatInput from '@/components/ChatInput';
import FadeIn from '@/components/FadeIn';
import { getChat, sendMessage } from '@/api/chat.api';
import type { Chat, ChatMessage } from '@/types/entities';

/** Chat conversation page — displays messages with send + refresh */
const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const chatId = Number(id);
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const initialMessage = (location.state as { initialMessage?: string } | null)?.initialMessage;

  const [chat, setChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(!!initialMessage);
  const [error, setError] = useState<string | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>(() => {
    if (!initialMessage) return [];
    return [{
      id: `optimistic-initial`,
      chat_id: String(chatId),
      role: 'user' as const,
      content: initialMessage,
      created_at: new Date().toISOString(),
    }];
  });
  const initialMessageSent = useRef(false);

  const fetchChat = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getChat(chatId);
      setChat(response.data);
      setOptimisticMessages([]);
      setError(null);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load chat');
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  /** On mount: fetch chat, then auto-send initial message if present */
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        const response = await getChat(chatId);
        setChat(response.data);
        setError(null);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load chat');
      } finally {
        setIsLoading(false);
      }

      if (initialMessage && !initialMessageSent.current) {
        initialMessageSent.current = true;
        window.history.replaceState({}, '');
        try {
          await sendMessage(chatId, { text: initialMessage });
          const response = await getChat(chatId);
          setChat(response.data);
          setOptimisticMessages([]);
        } catch (sendError) {
          setOptimisticMessages([]);
          setError(sendError instanceof Error ? sendError.message : 'Failed to send message');
        } finally {
          setIsSending(false);
        }
      }
    };
    init();
  }, [chatId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async (text: string) => {
    const optimisticMessage: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      chat_id: String(chatId),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    setOptimisticMessages([optimisticMessage]);
    setIsSending(true);
    setError(null);

    try {
      await sendMessage(chatId, { text });
      await fetchChat();
    } catch (sendError) {
      setOptimisticMessages([]);
      setError(sendError instanceof Error ? sendError.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  /** Merge real messages with optimistic ones */
  const displayMessages = (): ChatMessage[] | null => {
    const real = chat?.chat_messages ?? [];
    if (optimisticMessages.length === 0) return real.length > 0 ? real : null;
    return [...real, ...optimisticMessages];
  };

  if (isLoading && !chat && optimisticMessages.length === 0) {
    return (
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  return (
    <Container
      maxWidth="md"
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        py: 4,
      }}
    >
      <FadeIn delay={0}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" fontWeight={600} color="text.primary">
            Chat #{chatId}
          </Typography>
          <IconButton
            onClick={fetchChat}
            disabled={isLoading || isSending}
            sx={{
              color: 'text.secondary',
              transition: 'all 0.2s ease',
              '&:hover': { color: 'primary.main' },
            }}
          >
            <RefreshRounded />
          </IconButton>
        </Box>
      </FadeIn>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <FadeIn delay={100}>
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            px: 3,
            py: 1,
            mb: 3,
            minHeight: 300,
          }}
        >
          <ChatMessageList messages={displayMessages()} isWaitingReply={isSending} />
        </Box>
      </FadeIn>

      <FadeIn delay={200}>
        <ChatInput onSend={handleSend} disabled={isSending} placeholder="Type your reply..." />
      </FadeIn>
    </Container>
  );
};

export default ChatPage;
