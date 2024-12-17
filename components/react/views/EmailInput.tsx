import { XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { TextInput } from '../inputs/TextInput';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
});

export const EmailInput = ({
  onClose,
  onReturn,
  onSubmit,
}: {
  onClose: () => void;
  onReturn: () => void;
  onSubmit: (email: string) => void;
}) => {
  return (
    <div className="p-1 relative max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onReturn}
          className="p-2 text-primary bg-neutral rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-semibold">Enter Email</h1>
        <button
          onClick={onClose}
          className="p-2 text-primary bg-neutral rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <Formik
        initialValues={{ email: '' }}
        validationSchema={validationSchema}
        onSubmit={values => onSubmit(values.email)}
      >
        {({ isValid, dirty }) => (
          <Form className="space-y-4">
            <TextInput
              name="email"
              type="email"
              placeholder="your@email.com"
              className="w-full p-3 rounded-lg dark:bg-[#ffffff0c] bg-[#f0f0ff5c]"
            />

            <button
              type="submit"
              disabled={!isValid || !dirty}
              className="w-full p-3 rounded-lg bg-primary text-white disabled:opacity-50 transition"
            >
              Continue with Email
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};
