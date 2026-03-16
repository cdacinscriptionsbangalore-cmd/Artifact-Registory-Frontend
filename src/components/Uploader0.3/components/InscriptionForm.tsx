import React, { useState, useEffect } from "react";
import type { GeoInfo, PostSchema } from "../types/types";
import FormField from "./FormField";
import SuggestionControls from "./SuggestionControls";
import { FormControlLabel, FormLabel, MenuItem, Radio, RadioGroup, TextField } from "@mui/material";
import { X } from "lucide-react";

interface InscriptionFormProps {
  formData: PostSchema;
  onChange: (field: string, value: any) => void;
  suggestion: string | null;
  onSuggestionClose: () => void;
  isFetchingSuggestion: boolean;
  onFetchSuggestion: (lat?: string, lon?: string) => void;
  geoInfo: GeoInfo | null;
}

const InscriptionForm: React.FC<InscriptionFormProps> = ({
  formData,
  onChange,
  suggestion,
  onSuggestionClose,
  isFetchingSuggestion,
  onFetchSuggestion,
  geoInfo
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [postedAnonymously, setPostedAnonymously] = useState<boolean>(!!formData.description.postedAnonymously);
  const [showSuggestion, setShowSuggestion] = useState<boolean>(true);

  // keep local state in sync if parent updates formData
  useEffect(() => {
    setPostedAnonymously(!!formData.description.postedAnonymously);
  }, [formData.description.postedAnonymously]);

  useEffect(() => {
    if (typeof formData.description.postedAnonymously === "undefined") {
      onChange("description.postedAnonymously", false);
    }
  }, [formData.description.postedAnonymously, onChange]);
  // Allow unicode letters and numbers, spaces and these punctuation: () , : " . ; -
  const allowedRegex = /^[a-zA-Z0-9\s]+$/
    ;

  const validateFieldValue = (value: string) => {
    const v = (value || "").trim();
    if (v.length === 0) return "This field is required.";
    if (v.length < 3) return "Minimum 3 characters required.";
    if (v.length > 100) return "Maximum 100 characters allowed.";
    if (!allowedRegex.test(v)) return 'Special characters are prohibited: () , : " . ; -';
    return "";
  };

  const handleFieldBlur = (key: string, rawValue: string) => {
    const msg = validateFieldValue(rawValue || "");
    setErrors(prev => ({ ...prev, [key]: msg }));
  };

  const clearErrorIfValid = (key: string, rawValue: string) => {
    const msg = validateFieldValue(rawValue || "");
    if (!msg && errors[key]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    } else if (msg) {
      setErrors(prev => ({ ...prev, [key]: msg }));
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-6">
        <FormField
          label="Title"
          value={formData.description.title || ""}
          onChange={(value) => { onChange("description.title", value); clearErrorIfValid('title', value); }}
          placeholder="Stone Inscription Title"
          widthFull={true}
          required={true}
          error={!!errors['title']}
          helperText={errors['title']}
          onBlur={() => handleFieldBlur('title', formData.description.title || "")}
        />
        <FormField
          label="Subject"
          value={formData.description.subject || ""}
          onChange={(value) => { onChange("description.subject", value); clearErrorIfValid('subject', value); }}
          placeholder="Ancient History"
          widthFull={true}
          required={true}
          error={!!errors['subject']}
          helperText={errors['subject']}
          onBlur={() => handleFieldBlur('subject', formData.description.subject || "")}
        />
      </div>

      <div className="flex items-center space-x-6">
        <FormField
          label="Topic"
          value={formData.topic || ""}
          onChange={(value) => { onChange("topic", value); clearErrorIfValid('topic', value); }}
          placeholder="Temple Inscriptions"
          widthFull={true}
          required={true}
          error={!!errors['topic']}
          helperText={errors['topic']}
          onBlur={() => handleFieldBlur('topic', formData.topic || "")}
        />
        {/* <FormField
          label="Type"
          value={formData.type || ""}
          onChange={(value) => onChange("type", value)}
          placeholder="Stone"
          widthFull={false}
        /> */}
        <TextField
          select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={formData.type || ""}
          label="Manuscript Material"
          // defaultValue="Choose manuscript material"
          onChange={(value) => onChange("type", value)}
          required
          size="small"
          fullWidth
        >
          <MenuItem value={"Stone"}>Stone</MenuItem>
          <MenuItem value={"Metal"}>Metal</MenuItem>
          <MenuItem value={"Clay"}>Clay</MenuItem>
          {/* <MenuItem value={"Leaf"}>Leaf</MenuItem>
                    <MenuItem value={"Bark"}>Bark</MenuItem> */}
        </TextField>


      </div>
      <div className="flex items-center space-x-6">
        <FormField
          label="Script (comma separated)"
          value={formData.script?.join(", ") || ""}
          onChange={(value) => { onChange("script", value.split(",").map(s => s.trim()).filter(Boolean)); clearErrorIfValid('script', value); }}
          placeholder="Grantha, Brahmi"
          widthFull={true}
          required={true}
          error={!!errors['script']}
          helperText={errors['script']}
          onBlur={() => handleFieldBlur('script', formData.script?.join(", ") || "")}
        />

        <FormField
          label="Language (comma separated)"
          value={formData.description.language?.join(", ") || ""}
          onChange={(value) => { onChange("description.language", value.split(",").map(s => s.trim()).filter(Boolean)); clearErrorIfValid('language', value); }}
          placeholder="Sanskrit, Prakrit"
          widthFull={true}
          required={true}
          error={!!errors['language']}
          helperText={errors['language']}
          onBlur={() => handleFieldBlur('language', formData.description.language?.join(", ") || "")}
        />
      </div>
      <div className="flex items-center space-x-5">
        <FormLabel
          id="demo-radio-buttons-group-label"
        >
          Post anonymously:
        </FormLabel>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          name="radio-buttons-group"
          className="flex flex-row text-black"
          value={postedAnonymously ? "true" : "false"}
          onChange={(e, v) => {
            const boolVal = v === "true";
            setPostedAnonymously(boolVal);
            onChange("description.postedAnonymously", boolVal);
          }}
          defaultValue={"false"}
          style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
        >
          <FormControlLabel value={"true"} control={<Radio />} label="Yes" />
          <FormControlLabel value={"false"} control={<Radio />} label="No" />
        </RadioGroup>
      </div>

      <div>
        {/* <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={formData.description.description || ""}
          onChange={(e) => onChange("description.description", e.target.value)}
          placeholder="This inscription belongs to the 12th century temple walls."
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none"
          rows={3}
        /> */}
        <TextField
          id="outlined-description-error-helper-text"
          label="Description"
          placeholder="This inscription belongs to the 12th century temple walls."
          size="small"

          value={formData.description.description || ""}
          onChange={(e) => { onChange("description.description", e.target.value); clearErrorIfValid('description', e.target.value); }}
          onBlur={() => handleFieldBlur('description', formData.description.description || "")}
          required
          error={!!errors['description']}
          helperText={errors['description']}
          multiline
          rows={3}
          fullWidth
          FormHelperTextProps={{
            style: { bottom: "-20px", margin: '0' }
          }}
        />

        <SuggestionControls
          isFetching={isFetchingSuggestion}
          onFetch={onFetchSuggestion}
          geoInfo={geoInfo}
          suggestion={suggestion}
          onUseSuggestion={(text) => { onChange("description.description", text); setShowSuggestion(false); }}
        />

        {
          suggestion && showSuggestion &&
          (
            <div className="mt-3 p-3 border border-gray-300 hover:border-black rounded-sm text-sm text-black">
              <div className="flex justify-between items-start">
                <strong className="text-xs text-black">Suggested description</strong>
                <button
                  onClick={onSuggestionClose}
                  className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-xs">{suggestion}</p>
            </div>
          )}
      </div>

      {/* <FormField
        label="Script Language (comma separated)"
        value={formData.description.scriptLanguage?.join(", ") || ""}
        onChange={(value) => onChange("description.scriptLanguage", value.split(",").map(s => s.trim()).filter(Boolean))}
        placeholder="Devanagari, Tamil"
      /> */}
    </div>
  );
};

export default InscriptionForm;
