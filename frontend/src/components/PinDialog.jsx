import { useState, useEffect } from 'react';

const PinDialog = ({ isOpen, title = 'Enter PIN', onCancel, onSubmit, description = '' }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pin || pin.trim().length === 0) {
      setError('PIN cannot be empty');
      return;
    }
    setError('');
    onSubmit(pin.trim());
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel && onCancel()}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[#1b1622] rounded-2xl shadow-2xl p-5 sm:p-6 text-left">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
        </div>

        <div className="mt-4">
          <label className="block text-sm text-gray-300 mb-2">PIN</label>
          <input
            autoFocus
            inputMode="numeric"
            pattern="[0-9]*"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full rounded-lg px-3 py-2 bg-[#0f0b12] border border-[#2a2535] text-white placeholder:text-gray-500"
            placeholder="Enter PIN"
          />
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-300 hover:text-white hover:bg-[#2a2535] rounded-lg transition text-sm">
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-lg transition text-sm">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default PinDialog;
