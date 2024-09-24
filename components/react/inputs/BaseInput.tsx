import React from 'react';
import { useField } from 'formik';

interface BaseInputProps {
  label: string;
  name: string;
  className?: string;
  rightElement?: React.ReactNode;
  showError?: boolean;
}

export const BaseInput: React.FC<BaseInputProps & React.InputHTMLAttributes<HTMLInputElement>> = ({
  label,
  rightElement,
  showError = true,
  ...props
}) => {
  const [field, meta] = useField(props);
  const id = props.id || props.name;
  return (
    <div className="form-control w-full">
      <label className="label" htmlFor={id}>
        <span className="label-text text-[#00000099] dark:text-[#FFFFFF99]">{label}</span>
      </label>
      <div className="relative">
        <input
          id={id}
          {...field}
          {...props}
          className={`dark:text-[#FFFFFF] text-[#161616] input border-[#00000033] dark:border-[#FFFFFF33] bg-[#E0E0FF0A] dark:bg-[#E0E0FF0A] w-full 
            autofill:bg-[#E0E0FF0A] autofill:dark:bg-[#E0E0FF0A]
            focus:bg-[#E0E0FF0A] focus:dark:bg-[#E0E0FF0A]
            ${props.className}`}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">{rightElement}</div>
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
