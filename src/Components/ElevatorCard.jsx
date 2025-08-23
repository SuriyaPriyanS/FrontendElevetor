// src/components/ElevatorCard.js
import React from 'react';
import { IconArrowUp, IconArrowDown, IconCheckCircle, IconClock, IconDoorClosed, IconDoorOpen, IconExclamationTriangle, IconPlay, IconPowerOff, IconStop } from '../icons/Icons';

const ElevatorCard = ({ elevator, onSelect, onToggleBlock }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "RUNNING_FINE_OPERATIONAL": return "bg-green-100 text-green-800 border-green-400";
      case "ERROR_TO_BE_CHECKED": return "bg-red-100 text-red-800 border-red-400";
      case "STOPPED_POWERED_OFF": return "bg-gray-100 text-gray-800 border-gray-400";
      case "IDLE_NO_REQUEST": return "bg-blue-100 text-blue-800 border-blue-400";
      default: return "bg-yellow-100 text-yellow-800 border-yellow-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "RUNNING_FINE_OPERATIONAL": return <IconCheckCircle className="text-green-500 w-6 h-6" />;
      case "ERROR_TO_BE_CHECKED": return <IconExclamationTriangle className="text-red-500 w-6 h-6" />;
      case "STOPPED_POWERED_OFF": return <IconPowerOff className="text-gray-500 w-6 h-6" />;
      case "IDLE_NO_REQUEST": return <IconClock className="text-blue-500 w-6 h-6" />;
      default: return <IconExclamationTriangle className="text-yellow-500 w-6 h-6" />;
    }
  };

  const healthScoreColor = elevator.predictive_health_score_pct > 70 ? 'text-green-500' :
                           elevator.predictive_health_score_pct > 40 ? 'text-orange-500' :
                           'text-red-500';

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-l-8
        ${elevator.isBlocked ? 'border-red-500' : 'border-indigo-500'}
      `}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          Elevator <span className="text-indigo-600 dark:text-indigo-400 ml-2">#{elevator.elevatorId.substring(0, 4)}</span>
        </h3>
        {getStatusIcon(elevator.operationalStatus)}
      </div>

      <div className="space-y-2 mb-4 text-gray-700 dark:text-gray-300">
        <div className="flex items-center">
          <span className="font-semibold w-24">Status:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(elevator.operationalStatus)}`}>
            {elevator.operationalStatus.replace(/_/g, ' ')}
          </span>
        </div>
        <p><span className="font-semibold w-24 inline-block">Floor:</span> <span className="transition-colors duration-500 ease-in-out font-bold text-lg">{elevator.currentFloor}</span></p>
        <p className="flex items-center"><span className="font-semibold w-24 inline-block">Direction:</span> <span className="transition-colors duration-500 ease-in-out">{elevator.direction}</span> {elevator.direction === 'UP' ? <IconArrowUp className="ml-1 text-green-500 w-5 h-5 animate-bounce-up" /> : elevator.direction === 'DOWN' ? <IconArrowDown className="ml-1 text-red-500 w-5 h-5 animate-bounce-down" /> : null}</p>
        <p className="flex items-center"><span className="font-semibold w-24 inline-block">Doors:</span> <span className="transition-colors duration-500 ease-in-out">{elevator.doorState}</span> {elevator.doorState === 'OPEN' ? <IconDoorOpen className="ml-1 text-blue-500 w-5 h-5 animate-pulse" /> : <IconDoorClosed className="ml-1 text-gray-500 w-5 h-5" />}</p>
        <p><span className="font-semibold w-24 inline-block">Load:</span> {elevator.car_load_kg.toFixed(1)} kg</p>
        <p><span className="font-semibold w-24 inline-block">Health:</span> <span className={`${healthScoreColor} transition-colors duration-500 ease-in-out`}>{elevator.predictive_health_score_pct.toFixed(1)}%</span></p>
      </div>

      {elevator.fault_active_codes && elevator.fault_active_codes.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-200 animate-fade-in-down">
          <p className="font-bold flex items-center"><IconExclamationTriangle className="mr-2 w-5 h-5 animate-pulse-red" /> Active Faults:</p>
          <ul className="list-disc list-inside text-sm mt-1">
            {elevator.fault_active_codes.map((fault, idx) => <li key={idx}>{fault}</li>)}
          </ul>
        </div>
      )}

      <div className="mt-6 flex justify-between space-x-3">
        <button
          onClick={onSelect}
          className="flex-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          View Details
        </button>
        <button
          onClick={() => onToggleBlock(elevator.elevatorId, !elevator.isBlocked)}
          className={`flex-1 px-4 py-2 ${elevator.isBlocked ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95`}
        >
          {elevator.isBlocked ? <IconPlay className="inline mr-2 w-5 h-5" /> : <IconStop className="inline mr-2 w-5 h-5" />}
          {elevator.isBlocked ? 'Unblock' : 'Block'}
        </button>
      </div>
    </div>
  );
};

export default ElevatorCard;