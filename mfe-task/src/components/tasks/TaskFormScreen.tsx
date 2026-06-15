'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Formik, Form, Field, ErrorMessage, type FieldProps } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import AppSelect, { type SelectOption } from '@/components/ui/AppSelect';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { TEAMS, TEAM_STATUSES, PEOPLE, type Task, type LabelType, type Priority } from '@/lib/taskData';

// ── Yup schema ────────────────────────────────────────────────────────────────

const validationSchema = Yup.object({
  title: Yup.string()
    .trim()
    .required('Title is required')
    .max(200, 'Title must be 200 characters or fewer'),
  description: Yup.string(),
  teamId:   Yup.string().required('Please select a team'),
  statusId: Yup.string().required('Please select a status'),
  priority: Yup.string().oneOf(['high', 'medium', 'low'] as const).required(),
  label:    Yup.string().oneOf(['', 'feature', 'bug', 'design', 'docs', 'infra', 'refactor'] as const),
  assigneeIds:        Yup.array().of(Yup.string()),
  expectedCompletion: Yup.string(),
  progress: Yup.number()
    .min(0, 'Must be 0 – 100')
    .max(100, 'Must be 0 – 100')
    .integer('Must be a whole number'),
});

type FormValues = {
  title: string;
  description: string;
  teamId: string;
  statusId: string;
  priority: Priority;
  label: LabelType | '';
  assigneeIds: string[];
  expectedCompletion: string;
  progress: number;
};

// ── Static option lists ───────────────────────────────────────────────────────

const TEAM_OPTIONS: SelectOption[] = TEAMS.map(t => ({
  value: t.id,
  label: t.name,
  color: t.color,
}));

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'high',   label: 'High',   color: '#DC4949' },
  { value: 'medium', label: 'Medium', color: '#E09D34' },
  { value: 'low',    label: 'Low',    color: '#32B173' },
];

const LABEL_OPTIONS: SelectOption[] = [
  { value: 'feature',  label: 'Feature'  },
  { value: 'bug',      label: 'Bug'      },
  { value: 'design',   label: 'Design'   },
  { value: 'docs',     label: 'Docs'     },
  { value: 'infra',    label: 'Infra'    },
  { value: 'refactor', label: 'Refactor' },
];

interface PersonOption extends SelectOption { initials: string; email: string; title: string; }
const PERSON_OPTIONS: PersonOption[] = PEOPLE.map(p => ({
  value:    p.id,
  label:    p.name,
  initials: p.initials,
  email:    p.email,
  title:    p.title,
}));

// ── Custom option renderers ───────────────────────────────────────────────────

// Chip shown for each selected person in multi-select: [initials] Name · Role
function PersonMultiValueLabel({ data }: { data: PersonOption }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
        style={{ background: 'rgba(97,85,221,0.3)', color: '#766Be8', fontSize: '9px', fontWeight: 700 }}
      >
        {data.initials}
      </div>
      <span style={{ color: '#766Be8', fontSize: '12px', fontWeight: 500 }}>{data.label}</span>
      <span style={{ color: '#6E6C6A', fontSize: '11px' }}>{data.title}</span>
    </div>
  );
}

function PersonOptionLabel(opt: PersonOption) {
  return (
    <div className="flex items-center gap-2.5 py-0.5">
      <div className="w-7 h-7 rounded-full bg-accent-bg flex items-center justify-center text-accent text-xs font-semibold shrink-0">
        {opt.initials}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-text-100 leading-tight truncate">{opt.label}</p>
        <p className="text-2xs text-text-300 truncate">{opt.title}</p>
      </div>
    </div>
  );
}

function TeamOptionLabel(opt: SelectOption) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: opt.color as string }} />
      <span className="text-sm text-text-100">{opt.label}</span>
    </div>
  );
}

function PriorityOptionLabel(opt: SelectOption) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: opt.color as string }} />
      <span className="text-sm text-text-100">{opt.label}</span>
    </div>
  );
}

// ── Field error helper ────────────────────────────────────────────────────────

function FieldErr({ name }: { name: string }) {
  return (
    <ErrorMessage name={name}>
      {msg => (
        <motion.p className="text-xs text-status-red mt-1" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
          {msg}
        </motion.p>
      )}
    </ErrorMessage>
  );
}

const labelClass = 'block text-xs font-medium text-text-200 mb-1.5';
const inputClass = 'w-full h-10 px-3 rounded-lg bg-bg-700 border border-border-subtle text-sm text-text-100 placeholder:text-text-300 focus:outline-none focus:border-accent transition-colors';
const sectionHeading = 'text-xs font-semibold text-text-300 uppercase tracking-wider pb-1 border-b border-border-subtle';

// ── Main form ─────────────────────────────────────────────────────────────────

export default function TaskFormScreen({ editTask }: { editTask?: Task | null }) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const isEdit       = !!editTask;

  const initialValues: FormValues = isEdit
    ? {
        title:              editTask!.title,
        description:        editTask!.description ?? '',
        teamId:             editTask!.teamId,
        statusId:           editTask!.statusId,
        priority:           editTask!.priority,
        label:              editTask!.label,
        assigneeIds:        PEOPLE.filter(p => p.initials === editTask!.assignee).map(p => p.id),
        expectedCompletion: editTask!.expectedCompletion ?? '',
        progress:           editTask!.progress,
      }
    : {
        title:              '',
        description:        '',
        teamId:             searchParams.get('teamId')   ?? '',
        statusId:           searchParams.get('statusId') ?? '',
        priority:           'medium',
        label:              '',
        assigneeIds:        [],
        expectedCompletion: '',
        progress:           0,
      };

  async function handleSubmit(values: FormValues, { setSubmitting }: { setSubmitting: (b: boolean) => void }) {
    try {
      await new Promise(r => setTimeout(r, 600));
      router.push(isEdit ? `/${editTask!.id}` : `/TF-${String(Math.floor(Math.random() * 900) + 100)}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <motion.div
        className="flex items-center gap-3 mb-8"
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <Link href="/" className="text-text-300 hover:text-text-100 transition-colors flex items-center gap-1.5 text-sm">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M8.5 3L4.5 7l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Tasks
        </Link>
        {isEdit && (
          <>
            <span className="text-border-subtle">/</span>
            <Link href={`/${editTask!.id}`} className="text-sm font-mono text-text-300 hover:text-text-100 transition-colors">
              {editTask!.id}
            </Link>
          </>
        )}
        <span className="text-border-subtle">/</span>
        <span className="text-sm text-text-100 font-medium">{isEdit ? 'Edit' : 'New Task'}</span>
      </motion.div>

      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, setFieldValue, isSubmitting, touched, errors }) => {
          const statusOptions: SelectOption[] = (TEAM_STATUSES[values.teamId] ?? []).map(s => ({
            value: s.id,
            label: s.name,
          }));

          return (
            <Form>
              <div className="flex flex-col gap-6">

                {/* ── Section 1: Content ── */}
                <motion.div
                  className="bg-bg-800 rounded-xl border border-border-subtle p-6 flex flex-col gap-5"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.05 }}
                >
                  <h3 className={sectionHeading}>Content</h3>

                  {/* Title */}
                  <div>
                    <label className={labelClass}>
                      Title <span className="text-status-red">*</span>
                    </label>
                    <Field name="title">
                      {({ field }: FieldProps) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="What needs to be done?"
                          maxLength={200}
                          className={`${inputClass} ${touched.title && errors.title ? 'border-status-red' : ''}`}
                        />
                      )}
                    </Field>
                    <div className="flex items-center justify-between">
                      <FieldErr name="title" />
                      <p className="text-2xs text-text-300 mt-1 ml-auto">{values.title.length}/200</p>
                    </div>
                  </div>

                  {/* Description — CKEditor (white bg, black text) */}
                  <div>
                    <label className={labelClass}>Description</label>
                    <Field name="description">
                      {({ form }: FieldProps) => (
                        <RichTextEditor
                          value={form.values.description}
                          onChange={val => form.setFieldValue('description', val)}
                          placeholder="Add more context, steps to reproduce, or relevant links..."
                          minHeight={500}
                        />
                      )}
                    </Field>
                  </div>
                </motion.div>

                {/* ── Section 2: Task Details ── */}
                <motion.div
                  className="bg-bg-800 rounded-xl border border-border-subtle p-6 flex flex-col gap-5"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.1 }}
                >
                  <h3 className={sectionHeading}>Task Details</h3>

                  {/* Row 1: Team | Status | Priority */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Team <span className="text-status-red">*</span></label>
                      <AppSelect
                        options={TEAM_OPTIONS}
                        value={TEAM_OPTIONS.find(o => o.value === values.teamId) ?? null}
                        onChange={opt => {
                          setFieldValue('teamId', opt?.value ?? '');
                          setFieldValue('statusId', '');
                        }}
                        placeholder="Select team…"
                        formatOptionLabel={TeamOptionLabel as any}
                        hasError={!!(touched.teamId && errors.teamId)}
                      />
                      <FieldErr name="teamId" />
                    </div>

                    <div>
                      <label className={labelClass}>Status <span className="text-status-red">*</span></label>
                      <AppSelect
                        options={statusOptions}
                        value={statusOptions.find(o => o.value === values.statusId) ?? null}
                        onChange={opt => setFieldValue('statusId', opt?.value ?? '')}
                        placeholder={values.teamId ? 'Select status…' : 'Select a team first'}
                        isDisabled={!values.teamId}
                        hasError={!!(touched.statusId && errors.statusId)}
                      />
                      <FieldErr name="statusId" />
                    </div>

                    <div>
                      <label className={labelClass}>Priority</label>
                      <AppSelect
                        options={PRIORITY_OPTIONS}
                        value={PRIORITY_OPTIONS.find(o => o.value === values.priority) ?? null}
                        onChange={opt => setFieldValue('priority', opt?.value ?? 'medium')}
                        formatOptionLabel={PriorityOptionLabel as any}
                        isSearchable={false}
                      />
                    </div>
                  </div>

                  {/* Row 2: Label | Expected Completion | Progress */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Label</label>
                      <AppSelect
                        options={LABEL_OPTIONS}
                        value={LABEL_OPTIONS.find(o => o.value === values.label) ?? null}
                        onChange={opt => setFieldValue('label', opt?.value ?? '')}
                        placeholder="No label"
                        isClearable
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Expected Completion</label>
                      <Field name="expectedCompletion">
                        {({ field }: FieldProps) => (
                          <input
                            {...field}
                            type="date"
                            className={`${inputClass} [color-scheme:dark]`}
                          />
                        )}
                      </Field>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={labelClass.replace('mb-1.5', '')}>Progress</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0} max={100}
                            value={values.progress}
                            onChange={e =>
                              setFieldValue('progress', Math.min(100, Math.max(0, Number(e.target.value) || 0)))
                            }
                            className="w-12 h-6 px-1.5 text-center rounded-md bg-bg-700 border border-border-subtle text-xs text-text-100 focus:outline-none focus:border-accent"
                          />
                          <span className="text-xs text-text-300">%</span>
                        </div>
                      </div>
                      {/* Clickable filled bar */}
                      <div
                        className="relative h-2 w-full rounded-full bg-bg-600 cursor-pointer overflow-hidden"
                        onClick={e => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100 / 5) * 5;
                          setFieldValue('progress', Math.min(100, Math.max(0, pct)));
                        }}
                      >
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-[#6155DD] to-[#766Be8]"
                          animate={{ width: `${values.progress}%` }}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      </div>
                      {/* Quick-pick steps */}
                      <div className="flex justify-between mt-1.5">
                        {[0, 25, 50, 75, 100].map(v => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setFieldValue('progress', v)}
                            className={`text-[10px] transition-colors ${
                              values.progress === v
                                ? 'text-accent font-semibold'
                                : 'text-text-300 hover:text-text-100'
                            }`}
                          >
                            {v === 0 ? 'None' : v === 100 ? 'Done' : `${v}%`}
                          </button>
                        ))}
                      </div>
                      <FieldErr name="progress" />
                    </div>
                  </div>

                  {/* Row 3: Assignees — full width, multi-select */}
                  <div>
                    <label className={labelClass}>Assignees</label>
                    <AppSelect
                      isMulti
                      options={PERSON_OPTIONS}
                      value={PERSON_OPTIONS.filter(o => values.assigneeIds.includes(o.value))}
                      onChange={opts =>
                        setFieldValue('assigneeIds', opts ? (opts as PersonOption[]).map(o => o.value) : [])
                      }
                      placeholder="Assign to one or more people…"
                      formatOptionLabel={PersonOptionLabel as any}
                      maxMenuHeight={340}
                      components={{ MultiValueLabel: PersonMultiValueLabel as any }}
                    />
                  </div>
                </motion.div>

                {/* ── Actions ── */}
                <motion.div
                  className="flex items-center justify-end gap-3 pb-8"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <Link href="/">
                    <button
                      type="button"
                      className="h-10 px-5 rounded-lg border border-border-subtle text-sm text-text-200 hover:bg-bg-700 hover:text-text-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </Link>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-10 px-6 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    whileHover={isSubmitting ? undefined : { scale: 1.01 }}
                    whileTap={isSubmitting ? undefined : { scale: 0.99 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    {isSubmitting ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : 'Create Task')}
                  </motion.button>
                </motion.div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
