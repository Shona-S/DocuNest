/**
 * Loader Component
 * 
 * Simple loading spinner with lavender accent color.
 * Used throughout the app for async operations.
 */
const Loader = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-4 border-lavender/20 border-t-lavender rounded-full animate-spin`}
      ></div>
    </div>
  );
};

export default Loader;

