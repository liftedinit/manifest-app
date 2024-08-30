import React from "react";
import { useField } from "formik";

interface TextAreaProps {
  label: string;
  name: string;
  className?: string;
}

export const TextArea: React.FC<
  TextAreaProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>
> = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <div className="form-control w-full">
      <label className="label" htmlFor={props.name}>
        <span className="label-text">{label}</span>
      </label>
      <textarea
        {...field}
        {...props}
        className={`textarea textarea-bordered h-24 ${props.className}`}
      />
      {meta.touched && meta.error ? (
        <label className="label">
          <span className="label-text-alt text-error">{meta.error}</span>
        </label>
      ) : null}
    </div>
  );
};
