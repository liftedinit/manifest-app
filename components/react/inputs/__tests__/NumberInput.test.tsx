import { test, expect, afterEach, describe } from 'bun:test';
import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { NumberInput } from '@/components/react/inputs';
import { Formik, Form } from 'formik';

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
