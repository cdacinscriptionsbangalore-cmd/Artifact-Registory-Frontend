import { TextField } from "@mui/material";

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  widthFull: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  onBlur?: () => void;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  widthFull,
  required = false,
  error,
  helperText,
  onBlur,
}) => {
  return (
    <div style={{ width: `100%` }}>
      <TextField
        error={!!error}
        helperText={helperText}
        id={`outlined-${label}-helper-text`}
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        size="small"
        fullWidth={widthFull}
        // style={{backdropFilter:"blur(5px)"}}
        sx={error ? {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(244, 67, 54, 0.04)'
          },
          '& .MuiOutlinedInput-root fieldset': {
            borderColor: '#f44336'
          }
        } : undefined}
        FormHelperTextProps={{
          style: { position:"absolute",bottom:"-20px",margin: '0',  }
        }}
      />
    </div>
  )
};

export default FormField;
