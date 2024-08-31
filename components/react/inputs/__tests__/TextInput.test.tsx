import { test, expect, afterEach, describe } from 'bun:test';
import React from 'react';
import matchers from '@testing-library/jest-dom/matchers';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { TextInput } from '@/components/react/inputs';
import { Formik, Form } from 'formik';

expect.extend(matchers);

const TestForm = ({ children }: { children: React.ReactNode }) => (
  <Formik initialValues={{ test: '' }} onSubmit={() => {}}>
    <Form>{children}</Form>
  </Formik>
);

describe('TextInput', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders correctly', () => {
    render(
      <TestForm>
        <TextInput label="Test Input" name="test" />
      </TestForm>
    );
    const input = screen.getByLabelText('Test Input');
    expect(input).toBeInTheDocument();
    expect(input.tagName.toLowerCase()).toBe('input');
    expect(input).toHaveAttribute('type', 'text');
  });

  test('updates value on change', () => {
    render(
      <TestForm>
        <TextInput label="Test Input" name="test" />
      </TestForm>
    );
    const input = screen.getByLabelText('Test Input');
    fireEvent.change(input, { target: { value: 'Hello' } });
    expect(input).toHaveValue('Hello');
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
          <TextInput label="Test Input" name="test" />
        </Form>
      </Formik>
    );
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });
});
