"use client";

import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";

const fieldBase =
  "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-disabled focus:border-primary";

function Label({
  htmlFor,
  children,
  required,
}: {
  htmlFor?: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-semibold text-text-primary"
    >
      {children}
      {required && <span className="ml-0.5 text-error">*</span>}
    </label>
  );
}

function Error({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-error">{children}</p>;
}

export function TextField({
  label,
  error,
  required,
  id,
  ...props
}: { label: string; error?: string; required?: boolean } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <input
        id={id}
        className={`${fieldBase} ${error ? "border-error" : "border-grey-300"}`}
        {...props}
      />
      <Error>{error}</Error>
    </div>
  );
}

export function SelectField({
  label,
  error,
  required,
  id,
  children,
  ...props
}: { label: string; error?: string; required?: boolean } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <select
        id={id}
        className={`${fieldBase} appearance-none bg-[length:20px] bg-[right_0.6rem_center] bg-no-repeat pr-9 ${
          error ? "border-error" : "border-grey-300"
        }`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='%23637381' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        }}
        {...props}
      >
        {children}
      </select>
      <Error>{error}</Error>
    </div>
  );
}

export function TextAreaField({
  label,
  error,
  required,
  id,
  ...props
}: { label: string; error?: string; required?: boolean } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <textarea
        id={id}
        className={`${fieldBase} min-h-24 resize-y ${
          error ? "border-error" : "border-grey-300"
        }`}
        {...props}
      />
      <Error>{error}</Error>
    </div>
  );
}
