// src/components/DetailCard.js
import React from 'react';

const DetailCard = ({ title, value, icon }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center space-x-4 transition-all duration-300 transform hover:scale-105">
    <div className="text-3xl">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

export default DetailCard;