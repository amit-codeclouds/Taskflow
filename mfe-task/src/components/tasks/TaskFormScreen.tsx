'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Formik, Form, Field, ErrorMessage, type FieldProps } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import AppSelect, { type SelectOption } from '@/components/ui/AppSelect';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { useTaskDetail, useCreateTask, useUpdateTask } from '@/lib/hooks/useTasks';
import { useTeamsList } from '@/lib/hooks/useTeams';
import { useBoardStatuses } from '@/lib/hooks/useBoardStatuses';
import { usePeopleOptions } from '@/lib/hooks/usePeople';
import type { Priority, LabelType, CreateTaskPayload } from '@/lib/types/tasks.types';

// ── Yup schema ────────────────────────────────────────────────────────────────

const validationSchema = Yup.object({
  title: Yup.string()
    .trim()
    .required('Title is required')
    .max(500, 'Title must be 500 characters or fewer'),
  description: Yup.string(),
  teamId:   Yup.string().required('Please select a team'),
  statusId: Yup.string().required('Please select a status'),
  priority: Yup.string().oneOf(['High', 'Medium', 'Low'] as const).required(),
  label:    Yup.string().oneOf(['', 'Feature', 'Bug', 'Design', 'Docs', 'Infra', 'Refactor'] as const),
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

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'High',   label: 'High',   color: '#DC4949' },
  { value: 'Medium', label: 'Medium', color: '#E09D34' },
  { value: 'Low',    label: 'Low',    color: '#32B173' },
];

const LABEL_OPTIONS: SelectOption[] = [
  { value: 'Feature',  label: 'Feature'  },
  { value: 'Bug',      label: 'Bug'      },
  { value: 'Design',   label: 'Design'   },
  { value: 'Docs',     label: 'Docs'     },
  { value: 'Infra',    label: 'Infra'    },
  { value: 'Refactor', label: 'Refactor' },
];

interface PersonOption extends SelectOption { initials: string; avatarUrl?: string; email: string; title: string; }

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ── Custom option renderers ───────────────────────────────────────────────────

function PersonMultiValueLabel({ data }: { data: PersonOption }) {
  return (
    <div className="flex items-center gap-1.5">
      {data.avatarUrl ? (
        <Image
          src={data.avatarUrl}
          alt={data.label}
          width={16}
          height={16}
          className="w-4 h-4 rounded-full object-cover shrink-0"
        />
      ) : (
        <div
          className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(97,85,221,0.3)', color: '#766Be8', fontSize: '9px', fontWeight: 700 }}
        >
          {data.initials}
        </div>
      )}
      <span style={{ color: '#766Be8', fontSize: '12px', fontWeight: 500 }}>{data.label}</span>
      <span style={{ color: '#6E6C6A', fontSize: '11px' }}>{data.title}</span>
    </div>
  );
}

function PersonOptionLabel(opt: PersonOption) {
  return (
    <div className="flex items-center gap-2.5 py-0.5">
      {opt.avatarUrl ? (
        <Image
          src={opt.avatarUrl}
          alt={opt.label}
          width={28}
          height={28}
          className="w-7 h-7 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-accent-bg flex items-center justify-center text-accent text-xs font-semibold shrink-0">
          {opt.initials}
        </div>
      )}
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

function NotFoundView({ taskId }: { taskId: string }) {
  return (
    <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-24 text-center">
      <p className="text-text-300 text-sm">Task <span className="font-mono text-text-200">{taskId}</span> was not found.</p>
      <Link href="/" className="mt-4 text-sm text-accent hover:text-accent-hover transition-colors">
        ← Back to tasks
      </Link>
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

export default function TaskFormScreen({ taskId }: { taskId?: string }) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const isEdit        = !!taskId;

  const { data: editTask, isPending: taskPending, isError: taskError } = useTaskDetail(taskId ?? '');
  const { data: teams = [], isPending: teamsPending } = useTeamsList();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const [selectedTeamId, setSelectedTeamId] = useState(() => searchParams.get('teamId') ?? '');
  const { data: teamStatuses = [], isPending: statusesPending } = useBoardStatuses(selectedTeamId);
  // Assignees are team-scoped — only people on the selected team can be assigned.
  const { data: peopleResult, isPending: peoplePending } = usePeopleOptions(selectedTeamId);
  const people = peopleResult?.data ?? [];

  // Once the task being edited loads, sync the team-scoped status query to it.
  useEffect(() => {
    if (editTask) setSelectedTeamId(editTask.teamId);
  }, [editTask]);

  if (isEdit && taskPending) return <FormSkeleton />;
  if (isEdit && (taskError || !editTask)) return <NotFoundView taskId={taskId!} />;

  const TEAM_OPTIONS: SelectOption[] = teams.map(t => ({ value: t.id, label: t.name, color: t.color }));
  const STATUS_OPTIONS: SelectOption[] = teamStatuses.map(s => ({ value: s.statusId, label: s.statusName }));
  const PERSON_OPTIONS: PersonOption[] = people.map(p => ({
    value:     p.id,
    label:     p.name,
    initials:  p.avatarInitials || initialsFromName(p.name),
    avatarUrl: p.avatarUrl,
    email:     p.email ?? '',
    title:     p.title ?? '',
  }));

  const initialValues: FormValues = isEdit
    ? {
        title:              editTask!.title,
        description:        editTask!.description ?? '',
        teamId:             editTask!.teamId,
        statusId:           editTask!.statusId,
        priority:           editTask!.priority,
        label:              editTask!.label ?? '',
        assigneeIds:        editTask!.assignees.map(a => a.userId),
        expectedCompletion: editTask!.expectedCompletion?.slice(0, 10) ?? '',
        progress:           editTask!.progress,
      }
    : {
        title:              '',
        description:        '',
        teamId:             searchParams.get('teamId')   ?? '',
        statusId:           searchParams.get('statusId') ?? '',
        priority:           'Medium',
        label:              '',
        assigneeIds:        [],
        expectedCompletion: '',
        progress:           0,
      };

  async function handleSubmit(values: FormValues, { setSubmitting }: { setSubmitting: (b: boolean) => void }) {
    const basePayload: CreateTaskPayload = {
      title: values.title.trim(),
      description: values.description || undefined,
      priority: values.priority,
      label: values.label || undefined,
      statusId: values.statusId,
      teamId: values.teamId,
      assigneeIds: values.assigneeIds,
      expectedCompletion: values.expectedCompletion || null,
      progress: values.progress,
    };

    try {
      if (isEdit) {
        // UpdateTaskRequestDto has no teamId — a task's team cannot change after creation.
        const { teamId: _teamId, ...updatePayload } = basePayload;
        const updated = await updateTask.mutateAsync({ id: editTask!.id, ...updatePayload });
        router.push(`/${updated.id}`);
      } else {
        await createTask.mutateAsync(basePayload);
        router.push('/');
      }
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
              #{editTask!.taskNumber}
            </Link>
          </>
        )}
        <span className="text-border-subtle">/</span>
        <span className="text-sm text-text-100 font-medium">{isEdit ? 'Edit' : 'New Task'}</span>
      </motion.div>

      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} enableReinitialize>
        {({ values, setFieldValue, isSubmitting, touched, errors }) => (
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
                          maxLength={500}
                          className={`${inputClass} ${touched.title && errors.title ? 'border-status-red' : ''}`}
                        />
                      )}
                    </Field>
                    <div className="flex items-center justify-between">
                      <FieldErr name="title" />
                      <p className="text-2xs text-text-300 mt-1 ml-auto">{values.title.length}/500</p>
                    </div>
                  </div>

                  {/* Description — Tiptap rich-text editor */}
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
                      {teamsPending ? (
                        <Skeleton height={40} borderRadius={8} baseColor="#222227" highlightColor="#2C2C32" />
                      ) : (
                        <div
                          data-tooltip={isEdit ? "A task's team can't be changed after creation" : undefined}
                          className={isEdit ? 'cursor-not-allowed' : undefined}
                        >
                          <AppSelect
                            options={TEAM_OPTIONS}
                            value={TEAM_OPTIONS.find(o => o.value === values.teamId) ?? null}
                            onChange={opt => {
                              setFieldValue('teamId', opt?.value ?? '');
                              setFieldValue('statusId', '');
                              setFieldValue('assigneeIds', []);
                              setSelectedTeamId(opt?.value ?? '');
                            }}
                            placeholder="Select team…"
                            formatOptionLabel={TeamOptionLabel as any}
                            hasError={!!(touched.teamId && errors.teamId)}
                            isDisabled={isEdit}
                          />
                        </div>
                      )}
                      <FieldErr name="teamId" />
                    </div>

                    <div>
                      <label className={labelClass}>Status <span className="text-status-red">*</span></label>
                      {statusesPending && values.teamId ? (
                        <Skeleton height={40} borderRadius={8} baseColor="#222227" highlightColor="#2C2C32" />
                      ) : (
                        <AppSelect
                          options={STATUS_OPTIONS}
                          value={STATUS_OPTIONS.find(o => o.value === values.statusId) ?? null}
                          onChange={opt => setFieldValue('statusId', opt?.value ?? '')}
                          placeholder={values.teamId ? 'Select status…' : 'Select a team first'}
                          isDisabled={!values.teamId}
                          hasError={!!(touched.statusId && errors.statusId)}
                        />
                      )}
                      <FieldErr name="statusId" />
                    </div>

                    <div>
                      <label className={labelClass}>Priority</label>
                      <AppSelect
                        options={PRIORITY_OPTIONS}
                        value={PRIORITY_OPTIONS.find(o => o.value === values.priority) ?? null}
                        onChange={opt => setFieldValue('priority', opt?.value ?? 'Medium')}
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
                    {peoplePending && values.teamId ? (
                      <Skeleton height={40} borderRadius={8} baseColor="#222227" highlightColor="#2C2C32" />
                    ) : (
                      <AppSelect
                        isMulti
                        options={PERSON_OPTIONS}
                        value={PERSON_OPTIONS.filter(o => values.assigneeIds.includes(o.value))}
                        onChange={opts =>
                          setFieldValue('assigneeIds', opts ? (opts as PersonOption[]).map(o => o.value) : [])
                        }
                        placeholder={values.teamId ? 'Assign to one or more people…' : 'Select a team first'}
                        isDisabled={!values.teamId}
                        formatOptionLabel={PersonOptionLabel as any}
                        maxMenuHeight={340}
                        components={{ MultiValueLabel: PersonMultiValueLabel as any }}
                      />
                    )}
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
          )}
      </Formik>
    </div>
  );
}

// ── Component-level skeleton — shown only while the task being edited loads ──

function FormSkeleton() {
  const theme = { baseColor: '#222227', highlightColor: '#2C2C32' };
  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <div className="bg-bg-800 rounded-xl border border-border-subtle p-6 flex flex-col gap-5">
        <Skeleton width={70} height={11} {...theme} />
        <Skeleton height={40} borderRadius={8} {...theme} />
        <Skeleton height={200} borderRadius={8} {...theme} />
      </div>
      <div className="bg-bg-800 rounded-xl border border-border-subtle p-6 flex flex-col gap-5">
        <Skeleton width={100} height={11} {...theme} />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={40} borderRadius={8} {...theme} />
          ))}
        </div>
      </div>
    </div>
  );
}
