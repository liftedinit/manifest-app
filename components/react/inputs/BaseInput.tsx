import React from 'react';
import { useField } from 'formik';
import { QuestionIcon } from '@/components/icons';
interface BaseInputProps {
  label?: string;
  name: string;
  className?: string;
  rightElement?: React.ReactNode;
  showError?: boolean;
  leftElement?: React.ReactNode;
  helperText?: string;
}

export const BaseInput: React.FC<BaseInputProps & React.InputHTMLAttributes<HTMLInputElement>> = ({
  label,
  rightElement,
  leftElement,
  helperText,
  showError = true,
  ...props
}) => {
  const [field, meta] = useField(props);
  const id = props.id || props.name;
  return (
    <div className="form-control w-full">
      <div className="flex justify-between items-center">
        {label && (
          <label className="label" htmlFor={id}>
            <span className="label-text text-[#00000099] dark:text-[#FFFFFF99] select-text">
              {label}
            </span>
          </label>
        )}
        {helperText && (
          <span className="text-sm flex-row flex items-center justify-between gap-2 text-[#00000099] dark:text-[#FFFFFF99]">
            <QuestionIcon className="w-4 h-4" /> {helperText}
          </span>
        )}
      </div>
      <div className="relative">
        <input
          id={id}
          {...field}
          {...props}
          className={`dark:text-[#FFFFFF99] text-[#161616] input border-[#00000033] dark:border-[#FFFFFF33] bg-[#E0E0FF0A] dark:bg-[#E0E0FF0A] w-full 
            autofill:bg-[#E0E0FF0A] autofill:dark:bg-[#E0E0FF0A]
            focus:bg-[#E0E0FF0A] focus:dark:bg-[#E0E0FF0A]
            ${props.className}`}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">{rightElement}</div>
        )}
        {leftElement && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">{leftElement}</div>
        )}
      </div>
      {meta.touched && meta.error && showError ? (
        <label className="label">
          <span className="label-text-alt text-error">{meta.error}</span>
        </label>
      ) : null}
    </div>
  );
};
