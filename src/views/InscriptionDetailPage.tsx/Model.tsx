// Model.tsx
import { coreBackendClient } from "@/utils/http/clients/coreBackend.client";
import type React from "react";
import { useState } from "react";

interface ModelProps {
  postId: string;
  display: boolean;
  onClose: () => void;
}

const Model: React.FC<ModelProps> = ({ postId, display, onClose }) => {

  const [inputValue, setInputValue] = useState("");
  const handleInputChange = (e: string) => {
    setInputValue(e as string);
  };

  function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  const handlePost = async () => {
    try {
      const token = getCookie("token");
      const form = new FormData();
      form.append("postId", postId);
      form.append("description", inputValue);

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
      myHeaders.append("Authorization", `Bearer ${token}`);

      const urlencoded = new URLSearchParams();
      urlencoded.append("postId", postId);
      urlencoded.append("discription", inputValue);

      const requestOptions: RequestInit = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow"
      };

      const response = await coreBackendClient.post("http://localhost:8080/post/addPoastDiscription", requestOptions)

      if (!response.status || response.status !== 200) {
        const errorText = await response.data.text(); // or response.json() if backend returns JSON
        throw new Error(`${response.status} - ${errorText}`);
      }

      const { data } = response; // 🔥 get backend response
      // console.log("Server response:", data);

      alert("Description uploaded successfully!");
      onClose(); // Close the modal after posting
    } catch (error) {
      if (error instanceof Error) {
        console.error("Upload failed:", error.message);
        alert("Upload failed: " + error.message);
      } else {
        console.error("Unknown error:", error);
        alert("An unknown error occurred.");
      }
    } finally {
      setInputValue(""); // Clear input after attempt
      onClose(); // Close the modal after attempt
    }

    // console.log("Posting:", inputValue);
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
