'use client';

import ReactSelect, {
  components,
  type Props as ReactSelectProps,
  type StylesConfig,
  type GroupBase,
  type ControlProps,
} from 'react-select';

export interface SelectOption {
  value: string;
  label: string;
  [key: string]: unknown;
}

// ── Dark theme styles ─────────────────────────────────────────────────────────

function buildStyles<T extends SelectOption>(hasError?: boolean): StylesConfig<T, boolean, GroupBase<T>> {
  return {
    control: (base, state) => ({
      ...base,
      background: '#222227',
      border: `1px solid ${hasError ? '#DC4949' : state.isFocused ? '#6155DD' : '#2C2C32'}`,
      borderRadius: '8px',
      minHeight: '40px',
      boxShadow: 'none',
      cursor: 'pointer',
      transition: 'border-color 0.15s',
      '&:hover': { borderColor: hasError ? '#DC4949' : '#6155DD' },
    }),
    menu: (base) => ({
      ...base,
      background: '#1A1A1E',
      border: '1px solid #2C2C32',
      borderRadius: '10px',
      overflow: 'hidden',
      zIndex: 50,
      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
    }),
    menuList: (base) => ({
      ...base,
      padding: '4px',
      maxHeight: '240px',
    }),
    option: (base, state) => ({
      ...base,
      background: state.isSelected
        ? '#261F42'
        : state.isFocused
        ? '#222227'
        : 'transparent',
      color: state.isSelected ? '#766Be8' : '#F4F3F0',
      borderRadius: '6px',
      fontSize: '14px',
      cursor: 'pointer',
      padding: '8px 10px',
      '&:active': { background: '#261F42' },
    }),
    singleValue: (base) => ({ ...base, color: '#F4F3F0', fontSize: '14px' }),
    multiValue: (base) => ({ ...base, background: '#261F42', borderRadius: '6px', padding: '2px 4px' }),
    multiValueLabel: (base) => ({ ...base, color: '#766Be8', fontSize: '12px', padding: '1px 4px' }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#766Be8',
      borderRadius: '0 4px 4px 0',
      '&:hover': { background: '#6155DD', color: '#fff' },
    }),
    placeholder: (base) => ({ ...base, color: '#6E6C6A', fontSize: '14px' }),
    input: (base) => ({ ...base, color: '#F4F3F0', fontSize: '14px', margin: 0, padding: 0 }),
    valueContainer: (base, state) => ({
      ...base,
      padding: state.selectProps.menuIsOpen ? '0 4px 0 36px' : '0 12px',
      gap: '4px',
      transition: 'padding 0.1s',
    }),
    indicatorsContainer: (base) => ({ ...base, paddingRight: '4px' }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? '#6155DD' : '#6E6C6A',
      padding: '0 6px',
      transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.2s, color 0.15s',
      '&:hover': { color: '#6155DD' },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: '#6E6C6A',
      padding: '0 4px',
      '&:hover': { color: '#F4F3F0' },
    }),
    noOptionsMessage: (base) => ({ ...base, color: '#6E6C6A', fontSize: '14px', padding: '10px' }),
    loadingMessage: (base) => ({ ...base, color: '#6E6C6A', fontSize: '14px' }),
  };
}

// ── Custom Control — adds search icon when menu is open ───────────────────────

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function CustomControl<T extends SelectOption, IsMulti extends boolean = false>({
  children,
  ...props
}: ControlProps<T, IsMulti, GroupBase<T>>) {
  return (
    <components.Control {...props}>
      {props.selectProps.menuIsOpen && (
        <span
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#6155DD',
            pointerEvents: 'none',
            zIndex: 1,
            display: 'flex',
          }}
        >
          <SearchIcon />
        </span>
      )}
      {children}
    </components.Control>
  );
}

// ── AppSelect ─────────────────────────────────────────────────────────────────

export interface AppSelectProps<T extends SelectOption = SelectOption, IsMulti extends boolean = false>
  extends Omit<ReactSelectProps<T, IsMulti, GroupBase<T>>, 'styles' | 'classNamePrefix'> {
  hasError?: boolean;
}

export default function AppSelect<T extends SelectOption = SelectOption, IsMulti extends boolean = false>({
  hasError,
  components: userComponents,
  isSearchable = true,
  ...props
}: AppSelectProps<T, IsMulti>) {
  return (
    <ReactSelect<T, IsMulti, GroupBase<T>>
      isSearchable={isSearchable}
      classNamePrefix="app-select"
      styles={buildStyles<T>(hasError) as StylesConfig<T, IsMulti, GroupBase<T>>}
      components={{
        Control: CustomControl as any,
        ...userComponents,
      }}
      {...props}
    />
  );
}
