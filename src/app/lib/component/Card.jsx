import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ children, cardTitle, status, className }) => {
  return (
    <div className={`w-full mb-8 bg-yellow-300 ${className || 'sm:w-[100%] md:w-[75%] lg:w-[50%] xl:w-[40%]'}`}> 
      <div className="flex items-center">
        <div className="pb-2 pr-2 text-2xl font-bold tracking-tight text-default dark:text-dark">{cardTitle}</div>
        <div
          className={
            status === undefined
              ? "w-2 h-2 rounded-full bg-red-500"
              : status === true
              ? "w-2 h-2 rounded-full bg-green-500"
              : status === false
              ? "w-2 h-2 rounded-full bg-red-500"
              : status === null
              ? "w-0 h-0"
              : "w-2 h-2 rounded-full bg-red-500"
          }
        ></div>
      </div>

      <div className="w-full bg-white dark:bg-gray-900 rounded-xl border-gray-200 shadow-lg">
        <div className="block p-4 rounded-lg">{children}</div>
      </div>
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  cardTitle: PropTypes.string,
  status: PropTypes.bool,
  className: PropTypes.string, // Add className prop type
};

export default Card;
