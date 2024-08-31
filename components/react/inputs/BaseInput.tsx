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
  const id = props.id || props.name;
  return (
    <div className="form-control w-full">
      <label className="label" htmlFor={id}>
        <span className="label-text">{label}</span>
      </label>
      <input
        id={id}
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
