import { useField } from 'formik';
import React from 'react';

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
        <span className="label-text text-[#00000099] dark:text-[#FFFFFF99]">{label}</span>
      </label>
      <div className="relative">
        <textarea
          id={id}
          {...field}
          {...props}
          className={`dark:text-[#FFFFFF99] text-[#161616] textarea border-[#00000033] dark:border-[#FFFFFF33] bg-[#E0E0FF0A] dark:bg-[#E0E0FF0A] w-full 
            autofill:bg-[#E0E0FF0A] dark:autofill:bg-[#E0E0FF0A]
            focus:bg-[#E0E0FF0A] dark:focus:bg-[#E0E0FF0A]
            ${props.className}`}
        />
      </div>
      {meta.touched && meta.error ? (
        <label className="label">
          <span className="label-text-alt text-error">{meta.error}</span>
        </label>
      ) : null}
    </div>
  );
};
