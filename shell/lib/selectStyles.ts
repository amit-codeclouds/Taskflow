import type { StylesConfig } from 'react-select';

export type SelectOption = { value: string; label: string };

interface Opts {
  hasError?: boolean;
  /** 'sm' = 36px height (filter bars), 'md' = 40px height (forms) */
  size?: 'sm' | 'md';
}

export function getSelectStyles<T extends SelectOption = SelectOption>(
  opts: Opts = {},
): StylesConfig<T, false> {
  const { hasError = false, size = 'md' } = opts;
  const minHeight   = size === 'sm' ? '36px' : '40px';
  const borderColor = hasError ? '#DC4949' : '#2C2C32';
  const focusBorder = hasError ? '#DC4949' : '#6155DD';

  return {
    control: (base, state) => ({
      ...base,
      minHeight,
      background:   '#222227',
      borderColor:  state.isFocused ? focusBorder : borderColor,
      borderRadius: '8px',
      boxShadow:    'none',
      cursor:       'pointer',
      '&:hover': { borderColor: focusBorder },
    }),
    menu: (base) => ({
      ...base,
      background:   '#222227',
      border:       '1px solid #2C2C32',
      borderRadius: '8px',
      boxShadow:    '0 4px 16px rgba(0,0,0,0.5)',
      marginTop:    '4px',
      zIndex:       50,
    }),
    menuList: (base) => ({ ...base, padding: '4px' }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      background:   isSelected ? '#261F42' : isFocused ? '#2C2C32' : 'transparent',
      color:        isSelected ? '#766BE8' : '#ABAAA5',
      borderRadius: '6px',
      fontSize:     '14px',
      cursor:       'pointer',
      padding:      '8px 12px',
    }),
    singleValue:        (base) => ({ ...base, color: '#F4F3F0', fontSize: '14px' }),
    input:              (base) => ({ ...base, color: '#F4F3F0', fontSize: '14px' }),
    placeholder:        (base) => ({ ...base, color: '#6E6C6A', fontSize: '14px' }),
    indicatorSeparator: ()     => ({ display: 'none' }),
    dropdownIndicator:  (base) => ({ ...base, color: '#6E6C6A', padding: '0 8px' }),
    clearIndicator:     (base) => ({ ...base, color: '#6E6C6A' }),
    valueContainer:     (base) => ({ ...base, padding: size === 'sm' ? '0 6px' : '2px 8px' }),
  };
}
