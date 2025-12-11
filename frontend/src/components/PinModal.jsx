import { useState, useEffect } from "react";

const PinModal = ({
  isOpen,
  onSubmit,
  onCancel,
  title = "Enter PIN",
  message = "This file is protected. Please enter your PIN to continue.",
}) => {
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (isOpen) setPin("");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        className="bg-[#1e1b29] text-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-sm text-gray-400 mb-4">{message}</p>

        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter PIN"
          className="w-full px-4 py-2 rounded-lg bg-[#2a2537] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(pin)}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-sm font-medium transition"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default PinModal;
