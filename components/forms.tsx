import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function Field({
  label,
  htmlFor,
  description,
  children,
}: {
  label: string;
  htmlFor: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {description ? <p className="text-xs leading-5 text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export function TextField(props: InputHTMLAttributes<HTMLInputElement> & { label: string; description?: string }) {
  const { label, description, id, ...rest } = props;
  return (
    <Field label={label} htmlFor={String(id)} description={description}>
      <Input id={id} {...rest} />
    </Field>
  );
}

export function TextAreaField(props: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; description?: string }) {
  const { label, description, id, className, ...rest } = props;
  return (
    <Field label={label} htmlFor={String(id)} description={description}>
      <Textarea id={id} className={cn("min-h-32", className)} {...rest} />
    </Field>
  );
}
