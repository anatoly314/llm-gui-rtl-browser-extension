import { cn } from '@/lib/utils';

type RadioOption<T extends string> = {
  value: T;
  label: string;
};

type RadioGroupProps<T extends string> = {
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  name: string;
  className?: string;
};

export const RadioGroup = <T extends string>({ options, value, onChange, name, className }: RadioGroupProps<T>) => (
  <div className={cn('flex flex-col gap-2', className)}>
    {options.map(option => (
      <label key={option.value} className="group flex cursor-pointer items-center gap-2">
        <input
          type="radio"
          name={name}
          value={option.value}
          checked={value === option.value}
          onChange={() => onChange(option.value)}
          className="h-4 w-4 cursor-pointer border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
        />
        <span className="select-none text-sm text-gray-700 group-hover:text-gray-900">{option.label}</span>
      </label>
    ))}
  </div>
);
