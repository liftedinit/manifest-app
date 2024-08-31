import React from 'react';
import { useField } from 'formik';

interface TextAreaProps {
  label: string;
  name: string;
  className?: string;
}

export const TextArea: React.FC<
  TextAreaProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>
> = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  const id = props.id || props.name;
  return (
    <div className="form-control w-full">
      <label className="label" htmlFor={id}>
        <span className="label-text">{label}</span>
      </label>
      <textarea
        id={id}
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
