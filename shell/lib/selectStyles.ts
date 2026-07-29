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
  const borderColor = hasError ? 'var(--color-status-red)' : 'var(--color-border-subtle)';
  const focusBorder = hasError ? 'var(--color-status-red)' : 'var(--color-accent)';

  return {
    control: (base, state) => ({
      ...base,
      minHeight,
      background:   'var(--color-bg-700)',
      borderColor:  state.isFocused ? focusBorder : borderColor,
      borderRadius: '8px',
      boxShadow:    'none',
      cursor:       'pointer',
      '&:hover': { borderColor: focusBorder },
    }),
    menu: (base) => ({
      ...base,
      background:   'var(--color-bg-700)',
      border:       '1px solid var(--color-border-subtle)',
      borderRadius: '8px',
      boxShadow:    'var(--shadow-elevated)',
      marginTop:    '4px',
      zIndex:       9999,
    }),
    menuList: (base) => ({ ...base, padding: '4px' }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      background:   isSelected ? 'var(--color-accent-bg)' : isFocused ? 'var(--color-bg-600)' : 'transparent',
      color:        isSelected ? 'var(--color-accent-hover)' : 'var(--color-text-200)',
      borderRadius: '6px',
      fontSize:     '14px',
      cursor:       'pointer',
      padding:      '8px 12px',
    }),
    singleValue:        (base) => ({ ...base, color: 'var(--color-text-100)', fontSize: '14px' }),
    multiValue:         (base) => ({ ...base, background: 'var(--color-accent-bg)', borderRadius: '6px', border: '1px solid rgba(97,85,221,0.25)', margin: '2px 3px' }),
    multiValueLabel:    (base) => ({ ...base, color: 'var(--color-accent-hover)', fontSize: '13px', padding: '2px 6px' }),
    multiValueRemove:   (base) => ({ ...base, color: 'var(--color-accent-hover)', borderRadius: '0 6px 6px 0', ':hover': { background: 'var(--color-status-red)', color: '#fff' } }),
    input:              (base) => ({ ...base, color: 'var(--color-text-100)', fontSize: '14px' }),
    placeholder:        (base) => ({ ...base, color: 'var(--color-text-300)', fontSize: '14px' }),
    menuPortal:         (base) => ({ ...base, zIndex: 9999 }),
    indicatorSeparator: ()     => ({ display: 'none' }),
    dropdownIndicator:  (base) => ({ ...base, color: 'var(--color-text-300)', padding: '0 8px' }),
    clearIndicator:     (base) => ({ ...base, color: 'var(--color-text-300)' }),
    valueContainer:     (base) => ({ ...base, padding: size === 'sm' ? '0 6px' : '2px 8px' }),
  };
}
