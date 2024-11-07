import { test, expect, afterEach, describe } from 'bun:test';
import React from 'react';
import matchers from '@testing-library/jest-dom/matchers';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { TextArea } from '@/components/react/inputs';
import { Formik, Form } from 'formik';

expect.extend(matchers);

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
