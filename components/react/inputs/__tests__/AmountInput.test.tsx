import { jest, test, expect, afterEach, describe } from 'bun:test';
import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { AmountInput, NumberInput } from '@/components/react/inputs';
import { Formik, Form } from 'formik';

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
    expect(onValueChange).toHaveBeenCalledWith('42.42');
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
    expect(onValueChange).toHaveBeenCalledWith('');
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
    expect(onValueChange).toHaveBeenCalledWith('42');
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
    expect(onValueChange).toHaveBeenCalledWith('');
    onValueChange.mockClear();
    fireEvent.change(input, { target: { value: '1' } });
    expect(onValueChange).toHaveBeenCalledWith('1');
    onValueChange.mockClear();
    fireEvent.change(input, { target: { value: '1E+10' } });
    expect(onValueChange).toHaveBeenCalledWith('');
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
    expect(onValueChange).toHaveBeenCalledWith('.');
  });
});
