import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import type { ChatMessage } from '@/types/entities';

interface ChatMessageListProps {
  messages: ChatMessage[] | null;
}

/** Renders a list of chat messages as bubbles */
const ChatMessageList = ({ messages }: ChatMessageListProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!messages || messages.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, py: 6 }}>
        <Typography color="text.secondary">No messages yet</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
      {messages.map((message, index) => {
        const isUser = message.role === 'user';
        return (
          <Box
            key={message.id ?? index}
            sx={{
              display: 'flex',
              justifyContent: isUser ? 'flex-end' : 'flex-start',
              opacity: 0,
              animation: `fadeSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
              animationDelay: `${index * 60}ms`,
              '@keyframes fadeSlideIn': {
                from: { opacity: 0, transform: 'translateY(8px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                maxWidth: '70%',
                bgcolor: isUser
                  ? 'primary.main'
                  : isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.05)',
                color: isUser ? 'primary.contrastText' : 'text.primary',
                borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              }}
            >
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {message.content}
              </Typography>
              {message.created_at && (
                <Typography variant="caption" sx={{ opacity: 0.6, mt: 0.5, display: 'block' }}>
                  {new Date(message.created_at).toLocaleTimeString()}
                </Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default ChatMessageList;
