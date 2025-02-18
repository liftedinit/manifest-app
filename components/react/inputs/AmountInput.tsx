import React from 'react';

export interface AmountInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onValueChange: (newAmount: string) => void;
}

/**
 * A component for entering an amount of tokens. Allows only positive decimal
 * numbers, or empty values (for an empty field).
 * @param value The current value of the input field.
 * @param onValueChange A callback that is called when the value of the input field
 *                      changes, with the new amount.
 * @param props Additional props to pass to the input field.
 * @constructor
 */
export const AmountInput: React.FC<AmountInputProps> = ({ value, onValueChange, ...props }) => {
  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const v = event.target.value;

    if (v === '') {
      onValueChange('');
      return;
    }
    if (v === '.') {
      // Allow for `.` to be entered on its way to a real number.
      onValueChange('.');
      return;
    }
    const newValue = /^\d*\.?\d*$/.test(v) ? parseFloat(v) : NaN;

    if (Number.isFinite(newValue)) {
      onValueChange(v);
    } else if (value !== '') {
      onValueChange(value);
    } else {
      onValueChange('');
    }
  }

  return (
    <input
      className="input input-md border border-[#00000033] dark:border-[#FFFFFF33] bg-[#E0E0FF0A] dark:bg-[#E0E0FF0A] w-full pr-24 dark:text-[#FFFFFF] text-[#161616] rounded-xl"
      type="text"
      inputMode="decimal"
      placeholder="0.00"
      min={0}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
};
