import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { toggleTheme } from '../store/slices/themeSlice';

const Settings = () => {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)', py: { xs: 2, md: 4 }, pb: { xs: 10, md: 4 } }}>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SettingsIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, fontSize: { xs: '2rem', md: '3rem' } }}>
            Settings
          </Typography>
        </Box>

        <Paper sx={{ overflow: 'hidden' }}>
          <List sx={{ p: 0 }}>
            {/* Appearance Section */}
            <Box sx={{ px: 3, py: 2, bgcolor: 'action.hover' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Appearance
              </Typography>
            </Box>

            <ListItem>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                {mode === 'dark' ? (
                  <DarkModeIcon sx={{ color: 'primary.main' }} />
                ) : (
                  <LightModeIcon sx={{ color: 'primary.main' }} />
                )}
              </Box>
              <ListItemText
                primary="Dark Mode"
                secondary={mode === 'dark' ? 'Dark theme is enabled' : 'Light theme is enabled'}
              />
              <ListItemSecondaryAction>
                <FormControlLabel
                  control={
                    <Switch
                      checked={mode === 'dark'}
                      onChange={handleThemeToggle}
                      color="primary"
                    />
                  }
                  label=""
                />
              </ListItemSecondaryAction>
            </ListItem>

            <Divider />

            {/* Application Info Section */}
            <Box sx={{ px: 3, py: 2, bgcolor: 'action.hover', mt: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Application Info
              </Typography>
            </Box>

            <ListItem>
              <ListItemText
                primary="Version"
                secondary="1.0.0"
              />
            </ListItem>

            <Divider />

            <ListItem>
              <ListItemText
                primary="Application Name"
                secondary="Spinach Billing System"
              />
            </ListItem>

            <Divider />

            <ListItem>
              <ListItemText
                primary="Developer"
                secondary="Parthiban R"
              />
            </ListItem>
          </List>
        </Paper>
      </Container>
    </Box>
  );
};

export default Settings;
