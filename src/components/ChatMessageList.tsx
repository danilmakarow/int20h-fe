import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import type { ChatMessage } from '@/types/entities';

interface ChatMessageListProps {
  messages: ChatMessage[] | null;
  isWaitingReply?: boolean;
  /** When true, user messages appear on the left and assistant on the right (BO perspective) */
  invertSides?: boolean;
}

/** Three-dot typing indicator animation */
const TypingIndicator = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        opacity: 0,
        animation: 'fadeSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        '@keyframes fadeSlideIn': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2,
          bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
          borderRadius: '18px 18px 18px 4px',
          display: 'flex',
          gap: 0.6,
          alignItems: 'center',
        }}
      >
        {[0, 1, 2].map((dotIndex) => (
          <Box
            key={dotIndex}
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: 'text.secondary',
              opacity: 0.5,
              animation: 'dotBounce 1.4s ease-in-out infinite',
              animationDelay: `${dotIndex * 0.2}s`,
              '@keyframes dotBounce': {
                '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: 0.3 },
                '40%': { transform: 'scale(1)', opacity: 0.7 },
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

/** Renders a list of chat messages as bubbles */
const ChatMessageList = ({ messages, isWaitingReply = false, invertSides = false }: ChatMessageListProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if ((!messages || messages.length === 0) && !isWaitingReply) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, py: 6 }}>
        <Typography color="text.secondary">No messages yet</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
      {(messages ?? []).map((message, index) => {
        const isUser = message.role === 'user';
        const isRight = invertSides ? !isUser : isUser;
        return (
          <Box
            key={message.id ?? `msg-${index}`}
            sx={{
              display: 'flex',
              justifyContent: isRight ? 'flex-end' : 'flex-start',
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
                bgcolor: isRight
                  ? 'primary.main'
                  : isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.05)',
                color: isRight ? 'primary.contrastText' : 'text.primary',
                borderRadius: isRight ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
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
      {isWaitingReply && <TypingIndicator />}
    </Box>
  );
};

export default ChatMessageList;
