import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Field({
  label,
  value,
  type,
  placeholder,
  name,
  className,
  readOnly,
  onChange,
}: {
  label: string;
  value?: string;
  type?: string;
  placeholder?: string;
  name?: string;
  className?: string;
  readOnly?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className={cn(className)}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        name={name}
        defaultValue={onChange ? undefined : value}
        value={onChange ? value : undefined}
        type={type}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={onChange}
        className="mt-1"
      />
    </div>
  );
}
