'use client';

import { INumberTextFieldProps } from '@/lib/utils/interfaces';
import { useFormikContext } from 'formik';
import { useQuery } from '@apollo/client';
import { InputNumber } from 'primereact/inputnumber';
import InputSkeleton from '../custom-skeletons/inputfield.skeleton';
import { GET_CONFIGURATION } from '@/lib/api/graphql';
import classes from './custom-input.module.css';

export default function CustomNumberTextField({
  className,
  placeholder,
  name,
  value,
  isLoading = false,
  onChange,
  ...props
}: INumberTextFieldProps) {
  const { setFieldValue } = useFormikContext();
  const { loading, error, data } = useQuery(GET_CONFIGURATION);
  const MIN_VALUE = 1;
  const MAX_VALUE = 100;

  const handleIncrease = () => {
    const currentValue = value || 0;
    if (currentValue < MAX_VALUE) {
      setFieldValue(name, currentValue + 1);
    }
  };

  const handleDecrease = () => {
    const currentValue = value || 0;
    if (currentValue > MIN_VALUE) {
      setFieldValue(name, currentValue - 1);
    }
  };

  const prefix = data?.configuration?.currencySymbol || "$";

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error! {error.message}</div>;

  return !isLoading ? (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium text-gray-600">
        {placeholder}
      </label>
      <div className="relative flex items-center justify-between">
        <div
          className="absolute left-2 z-10 flex h-6 w-6 cursor-pointer select-none items-center justify-center rounded-full border border-[#E4E4E7] hover:bg-slate-200"
          onClick={handleDecrease}
        >
          <span className="text-gray-500">-</span>
        </div>
        <InputNumber
          className={`${classes.inputNumber} z-0 h-11 w-full border border-inherit bg-white px-10 text-center focus:shadow-none focus:outline-none ${className}`}
          name={name}
          value={value}
          suffix={prefix}
          useGrouping={false}
          onChange={(e: { value: number | null }) => {
            setFieldValue(name, e.value);
            onChange?.(name, e.value);
          }}
          {...props}
        />
        <div
          className="absolute right-2 z-10 flex h-6 w-6 cursor-pointer select-none items-center justify-center rounded-full border border-[#E4E4E7] hover:bg-slate-200"
          onClick={handleIncrease}
        >
          <span className="text-gray-500">+</span>
        </div>
      </div>
    </div>
  ) : (
    <div>
      <InputSkeleton />
    </div>
  );
}