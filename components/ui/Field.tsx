"use client";

import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";
import { AlertTriangleIcon } from "@/components/ui/Icon";

const fieldBase =
  "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-disabled";
/* The error border holds while the field has focus, so the state stays visible. */
const borderFor = (error?: string) => (error ? "border-error" : "border-grey-300 focus:border-primary");

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

/** Message under a field that needs attention. The icon keeps it from relying on
    colour alone; the dark red keeps small text at AA contrast. Give it an `id`
    and point the field's aria-describedby at it so screen readers read it. */
export function FieldError({ id, children }: { id?: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-error-dark">
      <AlertTriangleIcon size={14} className="mt-px shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/** aria wiring for a field showing `error`. */
const invalidProps = (id: string | undefined, error: string | undefined) =>
  error ? { "aria-invalid": true, "aria-describedby": id ? `${id}-error` : undefined } : {};

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
        className={`${fieldBase} ${borderFor(error)}`}
        {...invalidProps(id, error)}
        {...props}
      />
      <FieldError id={id && `${id}-error`}>{error}</FieldError>
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
          borderFor(error)
        }`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='%23637381' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        }}
        {...invalidProps(id, error)}
        {...props}
      >
        {children}
      </select>
      <FieldError id={id && `${id}-error`}>{error}</FieldError>
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
          borderFor(error)
        }`}
        {...invalidProps(id, error)}
        {...props}
      />
      <FieldError id={id && `${id}-error`}>{error}</FieldError>
    </div>
  );
}
