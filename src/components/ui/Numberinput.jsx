import { Icon } from '@iconify/react'
import Cleave from 'cleave.js/react'

const NumberInput = ({
  label,
  placeholder = 'Add placeholder',
  classLabel = 'form-label',
  className = '',
  register,
  name,
  readonly,
  error,
  disabled,
  id,
  horizontal,
  validate,
  msgTooltip,
  description,
  hasicon,
  onChange,
  onFocus,
  defaultValue,
  rules = {},
  ...rest
}) => {
  const options = {
    numeral: true,
    numeralThousandsGroupStyle: 'none'
  }

  return (
    <div
      className={`fromGroup ${error ? 'has-error' : ''} ${
        horizontal ? 'flex' : ''
      } ${validate ? 'is-valid' : ''}`}
    >
      {label && (
        <label
          htmlFor={id}
          className={`block capitalize ${classLabel} ${
            horizontal
              ? 'flex-0 mr-6 md:w-[100px] w-[60px] break-words'
              : ''
          }`}
        >
          {label}
        </label>
      )}

      <div className={`relative ${horizontal ? 'flex-1' : ''}`}>
        {name && (
          <Cleave
            {...register(name, rules)}
            {...rest}
            placeholder={placeholder}
            options={options}
            className={`${error ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}
            ${error ? 'has-error' : ''} form-control py-2 ${className} dark:text-white dark:placeholder-white placeholder-black-900`}
            readOnly={readonly}
            disabled={disabled}
            defaultValue={defaultValue}
            id={id}
            onFocus={onFocus}
            onChange={onChange}
          />
        )}

        {!name && (
          <Cleave
            placeholder={placeholder}
            options={options}
            className={`${error ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}
            ${error ? 'has-error' : ''} form-control py-2 ${className} dark:text-white dark:placeholder-white placeholder-black-900`}
            readOnly={readonly}
            disabled={disabled}
            defaultValue={defaultValue}
            id={id}
            onFocus={onFocus}
            onChange={onChange}
          />
        )}

        <div className='flex text-xl absolute ltr:right-[14px] rtl:left-[14px] top-1/2 -translate-y-1/2 space-x-1 rtl:space-x-reverse'>
          {error && (
            <span className='text-danger-500'>
              <Icon icon='heroicons-outline:information-circle' />
            </span>
          )}
          {validate && (
            <span className='text-success-500'>
              <Icon icon='bi:check-lg' />
            </span>
          )}
        </div>
      </div>

      {error && (
        <div
          className={`mt-2 ${
            msgTooltip
              ? 'inline-block bg-danger-500 text-white text-[10px] px-2 py-1 rounded'
              : 'text-danger-500 block text-sm'
          }`}
        >
          {error.message}
        </div>
      )}

      {validate && (
        <div
          className={`mt-2 ${
            msgTooltip
              ? 'inline-block bg-success-500 text-white text-[10px] px-2 py-1 rounded'
              : 'text-success-500 block text-sm'
          }`}
        >
          {validate}
        </div>
      )}

      {description && (
        <span className='input-description'>{description}</span>
      )}
    </div>
  )
}

export default NumberInput
