import type { SelectOption } from '@/lib/selectStyles';

export type TitleOption = SelectOption;

// Designation choices — shared by SignupForm and ProfileScreen so both stay
// in sync. Not a workspace/team "role" (admin/member) — this is the
// professional title shown next to a person's name.
export const TITLE_OPTIONS: TitleOption[] = [
  { value: 'Engineer',        label: 'Engineer'        },
  { value: 'Designer',        label: 'Designer'        },
  { value: 'Product Manager', label: 'Product Manager' },
  { value: 'QA Engineer',     label: 'QA Engineer'     },
  { value: 'DevOps',          label: 'DevOps'          },
  { value: 'Team Lead',       label: 'Team Lead'       },
  { value: 'Manager',         label: 'Manager'         },
  { value: 'Director',        label: 'Director'        },
  { value: 'Founder',         label: 'Founder'         },
  { value: 'Other',           label: 'Other'           },
];
