import { TextField } from "@mui/material";
import { useState } from "react";

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  widthFull: boolean;
}

const FormField: React.FC<FormFieldProps> = ({ label, value, onChange, placeholder, widthFull }) => {
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  return (
    <div style={{ width: `100%` }}
    >
      {/* <label className="block text-sm font-medium mb-2">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
    /> */}
      <TextField
        error={!!errors["description.title"]}
        helperText={errors["description.title"] ? "Title cannot be left blank." : ""}
        id="outlined-error-helper-text"
        label={label}
        defaultValue=""
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        size="small"
        fullWidth={widthFull}
      />
    </div>
  )
};

export default FormField;