import React from "react";
import { useField } from "formik";

interface BaseInputProps {
  label: string;
  name: string;
  className?: string;
}

export const BaseInput: React.FC<
  BaseInputProps & React.InputHTMLAttributes<HTMLInputElement>
> = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <div className="form-control w-full">
      <label className="label" htmlFor={props.name}>
        <span className="label-text">{label}</span>
      </label>
      <input
        {...field}
        {...props}
        className={`input input-bordered w-full ${props.className}`}
      />
      {meta.touched && meta.error ? (
        <label className="label">
          <span className="label-text-alt text-error">{meta.error}</span>
        </label>
      ) : null}
    </div>
  );
};
