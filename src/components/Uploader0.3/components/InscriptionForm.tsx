import React from "react";
import type { GeoInfo, PostSchema } from "../types/types";
import FormField from "./FormField";
import SuggestionControls from "./SuggestionControls";
import { MenuItem, TextField } from "@mui/material";
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
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-6">
        <FormField
          label="Title"
          value={formData.description.title || ""}
          onChange={(value) => onChange("description.title", value)}
          placeholder="Stone Inscription Title"
          widthFull={true}
        />
        <FormField
          label="Subject"
          value={formData.description.subject || ""}
          onChange={(value) => onChange("description.subject", value)}
          placeholder="Ancient History"
          widthFull={true}
        />
      </div>

      <div className="flex items-center space-x-6">
        <FormField
          label="Topic"
          value={formData.topic || ""}
          onChange={(value) => onChange("topic", value)}
          placeholder="Temple Inscriptions"
          widthFull={true}
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
          onChange={(value) => onChange("script", value.split(",").map(s => s.trim()).filter(Boolean))}
          placeholder="Grantha, Brahmi"
          widthFull={true}
        />

        <FormField
          label="Language (comma separated)"
          value={formData.description.language?.join(", ") || ""}
          onChange={(value) => onChange("description.language", value.split(",").map(s => s.trim()).filter(Boolean))}
          placeholder="Sanskrit, Prakrit"
          widthFull={true}
        />
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
          onChange={(e) => onChange("description.description", e.target.value)}
          multiline
          rows={4}
          fullWidth
        />

        <SuggestionControls
          isFetching={isFetchingSuggestion}
          onFetch={onFetchSuggestion}
          geoInfo={geoInfo}
          suggestion={suggestion}
          onUseSuggestion={(text) => onChange("description.description", text)}
        />

        {
          suggestion &&
          (
            <div className="mt-3 p-3 border border-gray-700 rounded-md text-sm text-black">
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