'use client';

import React from 'react';
import { useDispatch } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Container,
} from '@mui/material';

// Validation schema using Yup
const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
});

// Custom Material-UI TextField for Formik
const FormikTextField = ({ field, form, ...props }) => {
  const { name } = field;
  const { touched, errors } = form;
  const hasError = touched[name] && errors[name];

  return (
    <TextField
      {...field}
      {...props}
      error={Boolean(hasError)}
      helperText={hasError ? errors[name] : ''}
      fullWidth
      margin="normal"
    />
  );
};

export default function ExampleForm() {
  const dispatch = useDispatch();

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    // Simulate API call
    setTimeout(() => {
      console.log('Form values:', values);

      // Dispatch to Redux store
      dispatch({
        type: 'user/login',
        payload: { name: values.name, email: values.email },
      });

      alert('Form submitted successfully!');
      setSubmitting(false);
      resetForm();
    }, 1000);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Example Form
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom align="center">
            Using Material-UI + Formik + Yup + Redux Toolkit
          </Typography>

          <Formik
            initialValues={{
              name: '',
              email: '',
              password: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <Field
                  name="name"
                  component={FormikTextField}
                  label="Name"
                  placeholder="Enter your name"
                />

                <Field
                  name="email"
                  component={FormikTextField}
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                />

                <Field
                  name="password"
                  component={FormikTextField}
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                />

                <Box sx={{ mt: 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={isSubmitting}
                    size="large"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    </Container>
  );
}
