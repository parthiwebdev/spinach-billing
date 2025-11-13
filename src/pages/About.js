import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper } from '@mui/material';

const About = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            About
          </Typography>

          <Typography variant="body1" paragraph>
            This is a demo application showcasing the integration of:
          </Typography>

          <Box component="ul" sx={{ mb: 3 }}>
            <li><Typography variant="body1">React Router DOM - for navigation</Typography></li>
            <li><Typography variant="body1">Material-UI - for UI components</Typography></li>
            <li><Typography variant="body1">Formik - for form management</Typography></li>
            <li><Typography variant="body1">Yup - for validation</Typography></li>
            <li><Typography variant="body1">Redux Toolkit - for state management</Typography></li>
          </Box>

          <Button
            component={RouterLink}
            to="/"
            variant="contained"
            color="primary"
          >
            Back to Home
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default About;
