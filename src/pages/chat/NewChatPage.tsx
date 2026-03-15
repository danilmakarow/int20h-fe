import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import SendRounded from '@mui/icons-material/SendRounded';
import SupportAgentRounded from '@mui/icons-material/SupportAgentRounded';
import { createChat } from '@/api/chat.api';
import FadeIn from '@/components/FadeIn';

/** New chat page — Claude-inspired greeting with email + message form */
const NewChatPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [email, setEmail] = useState('bob@example.com');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || !email.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await createChat({ email, text: trimmedMessage });
      navigate(`/chat/${response.chat.chat_id}`, { state: { initialMessage: trimmedMessage } });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create chat');
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const canSend = message.trim().length > 0 && !isSubmitting;

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2,
        py: 8,
      }}
    >
      <Container maxWidth="sm">
        <FadeIn delay={0} translateY={30}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: isDark ? 'rgba(201,160,122,0.15)' : 'rgba(179,132,90,0.12)',
              }}
            >
              <SupportAgentRounded sx={{ fontSize: 30, color: 'primary.main' }} />
            </Box>
          </Box>
        </FadeIn>

        <FadeIn delay={100} translateY={30}>
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              mb: 1.5,
              fontWeight: 600,
              color: 'text.primary',
              letterSpacing: '-0.02em',
            }}
          >
            How can we help you?
          </Typography>
        </FadeIn>

        <FadeIn delay={200} translateY={25}>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              mb: 5,
              color: 'text.secondary',
              fontSize: '1.1rem',
              lineHeight: 1.6,
            }}
          >
            Our support assistant is here to help. Describe your issue below.
          </Typography>
        </FadeIn>

        {error && (
          <FadeIn delay={0} duration={300}>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          </FadeIn>
        )}

        <FadeIn delay={350} translateY={20}>
          <TextField
            fullWidth
            label="Your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            variant="outlined"
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
                bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                transition: 'background-color 0.2s ease',
                '& fieldset': {
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                },
                '&:hover fieldset': {
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
        </FadeIn>

        <FadeIn delay={450} translateY={20}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 1,
              p: 1,
              pl: 2.5,
              pr: 1,
              borderRadius: '24px',
              bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              '&:focus-within': {
                borderColor: 'primary.main',
                boxShadow: `0 0 0 2px ${isDark ? 'rgba(201,160,122,0.15)' : 'rgba(179,132,90,0.15)'}`,
              },
            }}
          >
            <Box
              component="textarea"
              value={message}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                setMessage(event.target.value);
                const textarea = event.target;
                textarea.style.height = 'auto';
                textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder="Describe your issue..."
              disabled={isSubmitting}
              rows={1}
              sx={{
                flex: 1,
                border: 'none',
                outline: 'none',
                bgcolor: 'transparent',
                color: 'text.primary',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                resize: 'none',
                py: 0.8,
                '&::placeholder': {
                  color: 'text.secondary',
                  opacity: 0.6,
                },
              }}
            />
            <IconButton
              onClick={handleSubmit}
              disabled={!canSend}
              size="small"
              sx={{
                bgcolor: canSend ? 'primary.main' : 'transparent',
                color: canSend ? 'primary.contrastText' : 'text.secondary',
                width: 36,
                height: 36,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: canSend ? 'primary.dark' : 'transparent',
                },
                '&.Mui-disabled': {
                  color: 'text.secondary',
                  opacity: 0.4,
                },
              }}
            >
              <SendRounded sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </FadeIn>
      </Container>
    </Box>
  );
};

export default NewChatPage;
