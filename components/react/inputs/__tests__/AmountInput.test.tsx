import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, jest, test } from 'bun:test';
import { Form, Formik } from 'formik';
import React from 'react';

import { AmountInput } from '@/components/react/inputs';

const TestForm = ({ children }: { children: React.ReactNode }) => (
  <Formik initialValues={{ test: '' }} onSubmit={() => {}}>
    <Form>{children}</Form>
  </Formik>
);

describe('AmountInput', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders correctly', () => {
    const value = '42';
    const onValueChange = jest.fn();

    render(
      <TestForm>
        <AmountInput name="test" value={value} onValueChange={onValueChange} />
      </TestForm>
    );

    const input = screen.getByPlaceholderText('0.00');
    expect(input).toBeInTheDocument();
    expect(input.tagName.toLowerCase()).toBe('input');
    expect(input).toHaveAttribute('type', 'text');
  });

  test('calls onValueChange with the new value', () => {
    const value = '42';
    const onValueChange = jest.fn();

    render(
      <TestForm>
        <AmountInput name="test" value={value} onValueChange={onValueChange} />
      </TestForm>
    );

    const input = screen.getByPlaceholderText('0.00');
    fireEvent.change(input, { target: { value: '42.42' } });
    expect(onValueChange).toHaveBeenCalledWith(42.42);
  });

  test('calls onValueChange with an empty string when the input is empty', () => {
    const value = '42';
    const onValueChange = jest.fn();

    render(
      <TestForm>
        <AmountInput name="test" value={value} onValueChange={onValueChange} />
      </TestForm>
    );

    const input = screen.getByPlaceholderText('0.00');
    fireEvent.change(input, { target: { value: '' } });
    expect(onValueChange).toHaveBeenCalledWith(undefined);
  });

  test('calls onValueChange with the same value when the input is invalid', () => {
    const value = '42';
    const onValueChange = jest.fn();

    render(
      <TestForm>
        <AmountInput name="test" value={value} onValueChange={onValueChange} />
      </TestForm>
    );

    const input = screen.getByPlaceholderText('0.00');
    fireEvent.change(input, { target: { value: '42.42.42' } });
    expect(onValueChange).toHaveBeenCalledWith(42);
  });

  test('calls onValueChange with the same value when the input is invalid (empty initial value)', () => {
    const value = '';
    const onValueChange = jest.fn();

    render(
      <TestForm>
        <AmountInput name="test" value={value} onValueChange={onValueChange} />
      </TestForm>
    );

    const input = screen.getByPlaceholderText('0.00');
    fireEvent.change(input, { target: { value: '42.42.42' } });
    expect(onValueChange).toHaveBeenCalledWith(undefined);
    onValueChange.mockClear();
    fireEvent.change(input, { target: { value: '1' } });
    expect(onValueChange).toHaveBeenCalledWith(1);
    onValueChange.mockClear();
    fireEvent.change(input, { target: { value: '1E+10' } });
    expect(onValueChange).toHaveBeenCalledWith(1);
  });

  test('calls onValueChange when only a dot is present', () => {
    const value = '42';
    const onValueChange = jest.fn();

    render(
      <TestForm>
        <AmountInput name="test" value={value} onValueChange={onValueChange} />
      </TestForm>
    );

    const input = screen.getByPlaceholderText('0.00');
    fireEvent.change(input, { target: { value: '.' } });
    expect(onValueChange).toHaveBeenCalledWith(undefined);
  });

  test('returns the right amount when a number too high is used', () => {
    const onValueChange = jest.fn();

    render(
      <TestForm>
        <AmountInput name="test" value={42} onValueChange={onValueChange} />
      </TestForm>
    );

    const input = screen.getByPlaceholderText('0.00');
    fireEvent.change(input, { target: { value: '' + (Number.MAX_SAFE_INTEGER - 1) } });
    expect(onValueChange).toHaveBeenCalledWith(Number.MAX_SAFE_INTEGER - 1);

    onValueChange.mockClear();

    fireEvent.change(input, { target: { value: '' + Number.MAX_SAFE_INTEGER + '123' } });
    expect(onValueChange).toHaveBeenCalledWith(Number.MAX_SAFE_INTEGER - 1);
  });

  test('returns the same amount even if too many decimals are used', () => {
    const onValueChange = jest.fn();

    render(
      <TestForm>
        <AmountInput name="test" value={42} onValueChange={onValueChange} />
      </TestForm>
    );

    const input = screen.getByPlaceholderText('0.00');
    fireEvent.change(input, { target: { value: '0.1234567890123456789' } });
    expect(onValueChange).toHaveBeenCalledWith(0.1234567890123456789);
  });
});
