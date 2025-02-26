import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'bun:test';
import { Form, Formik } from 'formik';
import React from 'react';

import { TextArea } from '@/components/react/inputs';

const TestForm = ({ children }: { children: React.ReactNode }) => (
  <Formik initialValues={{ test: '' }} onSubmit={() => {}}>
    <Form>{children}</Form>
  </Formik>
);

describe('TextArea', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders correctly', () => {
    render(
      <TestForm>
        <TextArea label="Test TextArea" name="test" />
      </TestForm>
    );
    const textarea = screen.getByLabelText('Test TextArea');
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName.toLowerCase()).toBe('textarea');
  });

  test('updates value on change', async () => {
    render(
      <TestForm>
        <TextArea label="Test TextArea" name="test" />
      </TestForm>
    );
    const textarea = screen.getByLabelText('Test TextArea');
    fireEvent.change(textarea, { target: { value: 'Hello\nWorld' } });
    expect(textarea).toHaveValue('Hello\nWorld');
  });

  test('displays error message', () => {
    render(
      <Formik
        initialValues={{ test: '' }}
        initialErrors={{ test: 'This field is required' }}
        initialTouched={{ test: true }}
        onSubmit={() => {}}
      >
        <Form>
          <TextArea label="Test TextArea" name="test" />
        </Form>
      </Formik>
    );
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });
});
