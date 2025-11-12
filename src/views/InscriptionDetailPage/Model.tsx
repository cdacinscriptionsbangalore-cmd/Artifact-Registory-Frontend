// Model.tsx
import { getCookie } from "@/utils/Auth/auth";
import type React from "react";
import { useState } from "react";

const backendApiUrl = window._env_?.VITE_BACKEND_API_URL || import.meta.env.VITE_BACKEND_API_URL;

interface ModelProps {
  postId: string;
  display: boolean;
  onClose: () => void;
  // pass back created comment object so parent can update list immediately
  onDescriptionAdded?: (createdComment: any) => void;
}

const Model: React.FC<ModelProps> = ({ postId, display, onClose, onDescriptionAdded }) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handlePost = async () => {
    try {
      const token = getCookie("token");

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
      myHeaders.append("Authorization", `Bearer ${token}`);
      myHeaders.append("X-XSRF-TOKEN", getCookie('XSRF-TOKEN') || '50d7115f-8f84-4e07-a8ae-1a155afe4864');

      const urlencoded = new URLSearchParams();
      urlencoded.append("postId", postId);
      // keep spelling used by backend if required; adjust if backend expects "description"
      urlencoded.append("discription", inputValue);

      const requestOptions: RequestInit = {
        credentials: 'include' as RequestCredentials,
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow"
      };

      const response = await fetch(`${backendApiUrl}post/addPoastDiscription`, requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status} - ${errorText}`);
      }

      // assume server returns the created comment/object
      const data = await response.json();
      console.log("Server response:", data);

      // give parent the created object so it can update UI immediately
      onDescriptionAdded?.(data ?? { description: inputValue, postId });

      alert("Description uploaded successfully!");
      onClose(); // close modal after success
    } catch (error) {
      if (error instanceof Error) {
        console.error("Upload failed:", error.message);
        alert("Upload failed: " + error.message);
      } else {
        console.error("Unknown error:", error);
        alert("An unknown error occurred.");
      }
    } finally {
      setInputValue("");
    }

    console.log("Posting:", inputValue);
  };


  if (!display) return null; // don't render if hidden

  return (
    <div className="fixed w-screen h-screen z-1 bg-primary-background/25 flex items-center justify-center top-0 left-0">
      <div className="bg-secondary-background p-4 rounded shadow flex flex-col gap-5 items-center w-sm">
        
        <div className="w-full">
            <label className="block text-sm font-medium mb-2 text-primary-text">Description</label>
            <textarea
              value={inputValue || ""}
              onChange={e => handleInputChange(e.target.value)}
              placeholder="This inscription belongs to the 12th century temple walls."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none"
              rows={3}
            />
          </div>

        <div className="w-full flex justify-between">
          <button onClick={onClose} className="ml-2 bg-slate-700 text-white px-3 py-1 rounded">
            Close
          </button>
          <button onClick={handlePost} className="ml-2 bg-orange-400 text-white px-3 py-1 rounded">
            post
          </button>
        </div>
      </div>
    </div>
  );
};

export default Model;
