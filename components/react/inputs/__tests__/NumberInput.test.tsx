import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'bun:test';
import { Form, Formik } from 'formik';
import React from 'react';

import { NumberInput } from '@/components/react/inputs';

const TestForm = ({ children }: { children: React.ReactNode }) => (
  <Formik initialValues={{ test: '' }} onSubmit={() => {}}>
    <Form>{children}</Form>
  </Formik>
);

describe('NumberInput', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders correctly', () => {
    render(
      <TestForm>
        <NumberInput label="Test Number" name="test" />
      </TestForm>
    );
    const input = screen.getByLabelText('Test Number');
    expect(input).toBeInTheDocument();
    expect(input.tagName.toLowerCase()).toBe('input');
    expect(input).toHaveAttribute('type', 'number');
  });

  test('updates value on change', () => {
    render(
      <TestForm>
        <NumberInput label="Test Number" name="test" />
      </TestForm>
    );
    const input = screen.getByLabelText('Test Number');
    fireEvent.change(input, { target: { value: '42' } });
    expect(input).toHaveValue(42);
  });

  test('displays error message', () => {
    render(
      <Formik
        initialValues={{ test: '' }}
        initialErrors={{ test: 'Must be a number' }}
        initialTouched={{ test: true }}
        onSubmit={() => {}}
      >
        <Form>
          <NumberInput label="Test Number" name="test" />
        </Form>
      </Formik>
    );
    expect(screen.getByText('Must be a number')).toBeInTheDocument();
  });
});
