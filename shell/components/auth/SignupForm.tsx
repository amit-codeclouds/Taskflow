'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Select from 'react-select';
import { getSelectStyles, type SelectOption } from '@/lib/selectStyles';

type TitleOption = SelectOption;

const TITLE_OPTIONS: TitleOption[] = [
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

const schema = Yup.object({
  name:  Yup.string().min(2, 'Name must be at least 2 characters').required('Full name is required'),
  email: Yup.string().email('Enter a valid email address').required('Email is required'),
  title: Yup.string(),
  customTitle: Yup.string().when('title', {
    is:        'Other',
    then:      (s) => s.min(2, 'Must be at least 2 characters').required('Please describe your role'),
    otherwise: (s) => s.notRequired(),
  }),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

type FormValues = Yup.InferType<typeof schema>;

function inputClass(touched: boolean, error?: string) {
  return `h-10 px-3 rounded-lg bg-bg-700 border text-sm text-text-100 placeholder:text-text-300 focus:outline-none transition-colors w-full ${
    touched && error ? 'border-status-red focus:border-status-red' : 'border-border-subtle focus:border-accent'
  }`;
}

function EyeOpenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5S1 8 1 8z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 2l12 12M6.5 6.6A2 2 0 009.4 9.5M4.5 4.6C2.5 5.8 1 8 1 8s2.5 5 7 5a7 7 0 002.5-.5M7 3.1C7.3 3 7.7 3 8 3c4.5 0 7 5 7 5s-.5 1-1.5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export default function SignupForm() {
  const router  = useRouter();
  const [showPw, setShowPw] = useState(false);

  const formik = useFormik<FormValues>({
    initialValues: { name: '', email: '', title: '', customTitle: '', password: '' },
    validationSchema: schema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setStatus(null);
      const finalTitle = values.title === 'Other' ? (values.customTitle ?? '') : (values.title ?? '');
      try {
        const res  = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:     values.name,
            email:    values.email,
            password: values.password,
            title:    finalTitle,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setStatus(data.error || 'Account creation failed. Please try again.');
          return;
        }
        router.push('/');
        router.refresh();
      } catch {
        setStatus('Network error — please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const titleTouched  = !!formik.touched.title;
  const titleError    = formik.errors.title as string | undefined;
  const isOther       = formik.values.title === 'Other';

  return (
    <div className="min-h-screen bg-bg-900 flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-[400px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      >
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.05 }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <path d="M2 3h10M2 7h6M2 11h8" stroke="white" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-text-100 font-semibold text-lg tracking-tight">Taskflow</span>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          className="bg-bg-800 rounded-xl border border-border-subtle p-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.08 }}
        >
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-text-100">Create an account</h1>
            <p className="text-sm text-text-300 mt-1">Join your team on Taskflow</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4" noValidate>
            {/* Full name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-medium text-text-200">Full name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Arkabrata Das"
                {...formik.getFieldProps('name')}
                className={inputClass(!!formik.touched.name, formik.errors.name)}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-xs text-status-red">{formik.errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-medium text-text-200">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...formik.getFieldProps('email')}
                className={inputClass(!!formik.touched.email, formik.errors.email)}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-xs text-status-red">{formik.errors.email}</p>
              )}
            </div>

            {/* Designation */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-200">
                Designation <span className="text-text-300 font-normal">(optional)</span>
              </label>
              <Select<TitleOption, false>
                inputId="title"
                options={TITLE_OPTIONS}
                value={TITLE_OPTIONS.find(o => o.value === formik.values.title) ?? null}
                onChange={(opt) => {
                  formik.setFieldValue('title', opt?.value ?? '');
                  formik.setFieldValue('customTitle', '');
                }}
                onBlur={() => formik.setFieldTouched('title', true)}
                styles={getSelectStyles({ hasError: titleTouched && !!titleError })}
                placeholder="What describes your role?"
                isClearable
                instanceId="title-select"
              />
              {titleTouched && titleError && (
                <p className="text-xs text-status-red">{titleError}</p>
              )}

              {isOther && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                >
                  <input
                    id="customTitle"
                    type="text"
                    autoFocus
                    placeholder="Describe your role…"
                    {...formik.getFieldProps('customTitle')}
                    className={inputClass(!!formik.touched.customTitle, formik.errors.customTitle)}
                  />
                  {formik.touched.customTitle && formik.errors.customTitle && (
                    <p className="text-xs text-status-red mt-1">{formik.errors.customTitle}</p>
                  )}
                </motion.div>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-medium text-text-200">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
                  {...formik.getFieldProps('password')}
                  className={inputClass(!!formik.touched.password, formik.errors.password) + ' pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-300 hover:text-text-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-xs text-status-red">{formik.errors.password}</p>
              )}
            </div>

            {/* Server error */}
            {formik.status && (
              <motion.p
                className="text-xs text-status-red bg-red-bg px-3 py-2 rounded-lg"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {formik.status}
              </motion.p>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={formik.isSubmitting}
              className="h-10 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              whileHover={formik.isSubmitting ? undefined : { scale: 1.01 }}
              whileTap={formik.isSubmitting ? undefined : { scale: 0.99 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              {formik.isSubmitting ? 'Creating account…' : 'Create account'}
            </motion.button>
          </form>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-sm text-text-300 mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-accent hover:text-accent-hover transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
