import { useState } from "react";
import { motion } from "framer-motion";
// import { CheckCircle } from "lucide-react";
import inscriptionImg from '@assets/wellcomeImg.jpeg'
import { Link } from "react-router-dom";

export default function Wellcome() {
  const [step, setStep] = useState(0);
  const [consent, setConsent] = useState(false);

  const pages = [
    // Page 1: Introduction
    <motion.div
      key="intro"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center text-center p-6 max-w-md mx-auto"
    >
      <img
        src={inscriptionImg}
        alt="Inscription"
        className="rounded-2xl shadow-md mb-6"
      />
      <h1 className="text-2xl font-bold mb-2">C-DAC Crowdsourcing</h1>
      <p className="text-gray-300 mb-6">
        Discover, and archive historical inscriptions from around the
        world. Join our community of history enthusiasts and help preserve
        cultural heritage by documenting inscriptions wherever you find them.
      </p>
      <button
        onClick={() => setStep(1)}
        className="bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded-lg"
      >
        Next
      </button>
    </motion.div>,

    // Page 2: Consent
    <motion.div
      key="consent"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center text-center p-6 max-w-md mx-auto"
    >
      <img
        src={inscriptionImg}
        alt="Inscription"
        className="rounded-2xl shadow-md mb-6"
      />
      <h1 className="text-2xl font-bold mb-2">C-DAC Crowdsourcing</h1>
      <p className="text-gray-300 mb-4 font-semibold">Consent Required</p>
      <p className="text-gray-300 mb-4 text-sm">
        By continuing, you agree to contribute and share stone inscription data
        responsibly. Your submissions (photos, descriptions, and site details)
        may be displayed publicly and used to improve the platform.
        <br />
        <a href="#" className="underline text-orange-400">
          Read Full Consent & Policy
        </a>
      </p>

      <label className="flex items-center gap-2 text-sm text-gray-200 mb-6">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="w-4 h-4"
        />
        <span>I agree to the above terms and consent to participate.</span>
      </label>

      <button
        disabled={!consent}
        onClick={() => setStep(2)}
        className={`px-6 py-2 rounded-lg ${
          consent
            ? "bg-gray-800 hover:bg-gray-700"
            : "bg-gray-600 cursor-not-allowed"
        }`}
      >
        Next
      </button>
    </motion.div>,

    // Page 3: Welcome
    <motion.div
      key="welcome"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center text-center p-6 max-w-md mx-auto"
    >
      <img
        src={inscriptionImg}
        alt="Inscription"
        className="rounded-2xl shadow-md mb-6"
      />
      <h1 className="text-2xl font-bold mb-2">C-DAC Crowdsourcing</h1>
      <p className="text-gray-300 mb-6">
        Discover, and archive historical inscriptions from around world.
        Join our community of history enthusiasts and help preserve Indian
        cultural heritage by documenting inscriptions wherever you find them.
      </p>

      <div className="flex flex-col gap-4 w-full">
        {/* <Link to="/login" className="bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl"> */}
        <Link to="/upload" className="bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl">
          Add New Inscription
        </Link>
        <Link to="/feed" className="bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl">
          Explore Inscriptions
        </Link>
      </div>
    </motion.div>,
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      {pages[step]}
    </div>
  );
}
