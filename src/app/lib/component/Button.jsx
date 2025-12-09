import PropTypes from "prop-types";

/**
 * Modern Apple-inspired Button Component
 * 
 * @param {String} title - Button title
 * @param {Function} onClickCallback - Parent onclick event callback
 * @param {String} variant - Button style variant: 'primary', 'secondary', 'success', 'danger'
 * @param {String} size - Button size: 'sm', 'md', 'lg'
 * @param {Boolean} fullWidth - Whether button should take full width
 * @returns {React.Element} - returns a button
 */
export const CustomButton = ({ 
  title, 
  onClickCallback, 
  variant = 'primary',
  size = 'md',
  fullWidth = true 
}) => {
  // Apple-inspired color schemes with subtle, professional colors
  const variantStyles = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100',
    success: 'bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700',
    danger: 'bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const baseStyles = 'rounded-lg font-medium transition-all duration-200 ease-in-out transform active:scale-95 shadow-sm hover:shadow-md text-center cursor-pointer';
  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <div 
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle}`}
      onClick={onClickCallback}
    >
      {title}
    </div>
  );
};

CustomButton.propTypes = {
  title: PropTypes.string.isRequired,
  onClickCallback: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullWidth: PropTypes.bool,
};
