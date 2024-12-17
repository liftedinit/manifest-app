import { ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { TextInput } from '../inputs/TextInput';
import { useState } from 'react';
import { SearchIcon } from '@/components/icons';

// Country codes data with emojis
const countryCodes = [
  { code: '+1', country: 'US/CA', emoji: '🇺🇸', name: 'United States/Canada' },
  { code: '+44', country: 'UK', emoji: '🇬🇧', name: 'United Kingdom' },
  { code: '+91', country: 'IN', emoji: '🇮🇳', name: 'India' },
  { code: '+33', country: 'FR', emoji: '🇫🇷', name: 'France' },
  { code: '+49', country: 'DE', emoji: '🇩🇪', name: 'Germany' },
  { code: '+81', country: 'JP', emoji: '🇯🇵', name: 'Japan' },
  { code: '+86', country: 'CN', emoji: '🇨🇳', name: 'China' },
  { code: '+61', country: 'AU', emoji: '🇦🇺', name: 'Australia' },
];

const phoneRegExp = /^\+[1-9]\d{1,14}$/;

const validationSchema = Yup.object({
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^\d+$/, 'Phone number should only contain digits'),
});

export const SMSInput = ({
  onClose,
  onReturn,
  onSubmit,
}: {
  onClose: () => void;
  onReturn: () => void;
  onSubmit: (phone: string) => void;
}) => {
  const [selectedCountryCode, setSelectedCountryCode] = useState('+1');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredCountries = countryCodes.filter(
    country =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.includes(searchTerm)
  );

  const selectedCountry = countryCodes.find(c => c.code === selectedCountryCode);

  return (
    <div className="p-1 relative max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onReturn}
          className="p-2 text-primary bg-neutral rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-semibold">Enter Phone Number</h1>
        <button
          onClick={onClose}
          className="p-2 text-primary bg-neutral rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <Formik
        initialValues={{ phoneNumber: '' }}
        validationSchema={validationSchema}
        onSubmit={values => {
          const fullNumber = `${selectedCountryCode}-${values.phoneNumber}`;
          if (phoneRegExp.test(fullNumber.replace('-', ''))) {
            onSubmit(fullNumber);
          }
        }}
      >
        {({ isValid, dirty }) => (
          <Form className="space-y-4">
            <div className="w-full">
              <label className="block mb-1 text-sm text-slate-600 dark:text-slate-400">
                Phone Number
              </label>
              <div className="relative">
                <TextInput
                  name="phoneNumber"
                  type="tel"
                  placeholder="0123456789"
                  className="input input-md border border-[#00000033] dark:border-[#FFFFFF33] bg-[#E0E0FF0A] dark:bg-[#E0E0FF0A] w-full pl-24 dark:text-[#FFFFFF] text-[#161616]"
                  leftElement={
                    <div className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <div className="dropdown dropdown-bottom">
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="flex items-center gap-1 text-sm text-slate-700 dark:text-slate-300"
                        >
                          <span>{selectedCountry?.emoji}</span>
                          <span>{selectedCountryCode}</span>
                          <ChevronDownIcon className="h-4 w-4" />
                        </button>
                        {isDropdownOpen && (
                          <ul className="dropdown-content z-50 menu p-2 max-h-32 shadow bg-base-300 rounded-lg mt-1 w-72 overflow-y-auto dark:text-[#FFFFFF] text-[#161616]">
                            <li className="sticky top-0 bg-base-300">
                              <input
                                type="text"
                                placeholder="Search countries..."
                                className="input input-sm w-full"
                                onChange={e => setSearchTerm(e.target.value)}
                              />
                            </li>
                            {filteredCountries.map(({ code, emoji, name }) => (
                              <li key={code}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedCountryCode(code);
                                    setIsDropdownOpen(false);
                                  }}
                                  className="flex items-center gap-2"
                                >
                                  <span>{emoji}</span>
                                  <div className="flex flex-col">
                                    <span className="text-sm">{name}</span>
                                    <span className="text-xs text-slate-500">{code}</span>
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="h-6 border-l border-slate-200 dark:border-slate-700 mx-2" />
                    </div>
                  }
                />
              </div>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Enter your phone number without country code
            </div>

            <button
              type="submit"
              disabled={!isValid || !dirty}
              className="w-full p-3 rounded-lg bg-primary text-white disabled:opacity-50 transition"
            >
              Continue with SMS
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};
