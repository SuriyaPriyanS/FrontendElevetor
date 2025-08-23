
import React from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import DetailCard from './DetailCard';
import { IconArrowDown, IconArrowUp, IconClock, IconDoorClosed, IconDoorOpen, IconExclamationTriangle, IconHealth, IconLoad, IconPlay, IconSpeed, IconStop } from '../icons/Icons';
import { NUM_FLOORS, POWER_MODES } from '../constants/constants';

const ElevatorDetail = ({ elevator, onClose, onToggleBlock, onSendCall, onUpdateParam, onClearFaults }) => {
  if (!elevator) return null;

  const floors = Array.from({ length: NUM_FLOORS }, (_, i) => i);

  const healthScoreData = {
    labels: ['Health', 'Degradation'],
    datasets: [
      {
        data: [elevator.predictive_health_score_pct, 100 - elevator.predictive_health_score_pct],
        backgroundColor: [
          elevator.predictive_health_score_pct > 70 ? '#10B981' : elevator.predictive_health_score_pct > 40 ? '#F59E0B' : '#EF4444',
          '#E5E7EB',
        ],
        borderColor: [
          elevator.predictive_health_score_pct > 70 ? '#059669' : elevator.predictive_health_score_pct > 40 ? '#D97706' : '#DC2626',
          '#D1D5DB',
        ],
        borderWidth: 1,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  const mockHistoricalData = (value, min, max, fluctuations = 5) => {
    const data = [];
    for (let i = 0; i < 20; i++) {
      let val = value + (Math.random() - 0.5) * fluctuations;
      data.push(Math.max(min, Math.min(max, val)));
    }
    return data;
  };

  const motorTempData = {
    labels: Array.from({ length: 20 }, (_, i) => `${i}`),
    datasets: [{
      label: 'Motor Temp (°C)',
      data: mockHistoricalData(elevator.motor_temp_C, 20, 90, 2),
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      tension: 0.3,
      pointRadius: 0,
    }],
  };

  const ropeWearData = {
    labels: Array.from({ length: 20 }, (_, i) => `${i}`),
    datasets: [{
      label: 'Rope Wear (%)',
      data: mockHistoricalData(elevator.wear_traction_rope_pct, 0, 100, 1),
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
      tension: 0.3,
      pointRadius: 0,
    }],
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl p-8 relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 transition-colors duration-200 text-3xl font-light"
        >
          &times;
        </button>

        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6 border-b-2 border-indigo-500 pb-3">
          Elevator Details: <span className="text-indigo-600 dark:text-indigo-400">#{elevator.elevatorId.substring(0, 8)}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <DetailCard title="Current Floor" value={elevator.currentFloor} icon={<IconArrowUp className="text-indigo-500 w-6 h-6" />} />
          <DetailCard title="Direction" value={elevator.direction} icon={elevator.direction === 'UP' ? <IconArrowUp className="text-green-500 w-6 h-6 animate-bounce-up" /> : elevator.direction === 'DOWN' ? <IconArrowDown className="text-red-500 w-6 h-6 animate-bounce-down" /> : <IconClock className="text-blue-500 w-6 h-6" />} />
          <DetailCard title="Door State" value={elevator.doorState} icon={elevator.doorState === 'OPEN' ? <IconDoorOpen className="text-blue-500 w-6 h-6 animate-pulse" /> : <IconDoorClosed className="text-gray-500 w-6 h-6" />} />
console.log("Elevator Speed:", elevator.speed_mps); // Log the speed data

<DetailCard title="Speed" value={elevator.speed_mps ? `${elevator.speed_mps.toFixed(1)} m/s` : "N/A"} icon={<IconSpeed className="w-6 h-6 text-purple-500" />} />
          <DetailCard title="Load" value={`${elevator.car_load_kg.toFixed(1)} kg`} icon={<IconLoad className="w-6 h-6 text-yellow-500" />} />
          <DetailCard title="Health Score" value={`${elevator.predictive_health_score_pct.toFixed(1)}%`} icon={<IconHealth className="w-6 h-6" healthPct={elevator.predictive_health_score_pct} />} />
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-inner mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Monitoring Data (RO)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <p><span className="font-semibold">Acceleration:</span> {elevator.acceleration_mps2.toFixed(2)} m/s²</p>
            <p><span className="font-semibold">Motor Temp:</span> {elevator.motor_temp_C.toFixed(1)} °C</p>
            <p><span className="font-semibold">VFD State:</span> {elevator.vfd_state}</p>
            <p><span className="font-semibold">Power Mode:</span> {elevator.power_mode}</p>
            <p><span className="font-semibold">Overload:</span> {elevator.car_overload ? 'Yes' : 'No'} ({elevator.load_weighing_status})</p>
            <p><span className="font-semibold">Rope Runtime:</span> {elevator.usage_rope_runtime_hours.toFixed(2)} hrs</p>
            <p><span className="font-semibold">Rope Wear:</span> {elevator.wear_traction_rope_pct.toFixed(1)} %</p>
            <p><span className="font-semibold">Brake Wear:</span> {elevator.wear_brake_lining_pct.toFixed(1)} %</p>
            <p><span className="font-semibold">Cycle Count:</span> {elevator.usage_cycle_count}</p>
            <p><span className="font-semibold">Display Message:</span> {elevator.ui_display_message}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
              <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Motor Temperature (°C)</h4>
              <Line data={motorTempData} options={lineChartOptions} />
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
              <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Rope Wear (%)</h4>
              <Line data={ropeWearData} options={lineChartOptions} />
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md flex items-center justify-center">
              <div>
                <h4 className="font-semibold text-lg mb-2 text-center text-gray-900 dark:text-white">Predictive Health Score</h4>
                <div className="w-36 h-36 mx-auto">
                  <Doughnut data={healthScoreData} />
                </div>
                <p className="text-center mt-2 text-xl font-bold text-gray-900 dark:text-white">{elevator.predictive_health_score_pct.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-inner mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Controls (RC)</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
              <h4 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Emergency Stop / Block</h4>
              <button
                onClick={() => onToggleBlock(elevator.elevatorId, !elevator.isBlocked)}
                className={`w-full py-3 rounded-lg font-bold text-white transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center
                  ${elevator.isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                `}
              >
                {elevator.isBlocked ? <IconPlay className="inline mr-2 w-5 h-5" /> : <IconStop className="inline mr-2 w-5 h-5" />}
                {elevator.isBlocked ? 'Unblock Elevator' : 'Block Elevator (Remote Stop)'}
              </button>
              {elevator.isBlocked && <p className="text-red-500 text-sm mt-2 text-center animate-pulse">Elevator is currently blocked and cannot respond to calls.</p>}
            </div>

            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
              <h4 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Send Calls</h4>
              <div className="flex flex-col gap-2">
                <p className="font-medium text-gray-700 dark:text-gray-300">Car Calls (Inside Elevator):</p>
                <div className="grid grid-cols-3 gap-2">
                  {floors.map((floor) => (
                    <button
                      key={`car-call-${floor}`}
                      onClick={() => onSendCall(elevator.elevatorId, floor, 'car')}
                      disabled={elevator.isBlocked || elevator.car_calls.includes(floor)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95
                        ${elevator.isBlocked ? 'bg-gray-300 text-gray-600 cursor-not-allowed' :
                          elevator.car_calls.includes(floor) ? 'bg-blue-200 text-blue-800 animate-pulse-blue' :
                          'bg-blue-500 hover:bg-blue-600 text-white'}
                      `}
                    >
                      Floor {floor}
                    </button>
                  ))}
                </div>
                <p className="font-medium text-gray-700 dark:text-gray-300 mt-4">Hall Calls (From Floors):</p>
                <div className="grid grid-cols-2 gap-2">
                  {floors.map((floor) => (
                    <React.Fragment key={`hall-call-${floor}`}>
                      {floor < NUM_FLOORS - 1 && (
                        <button
                          onClick={() => onSendCall(elevator.elevatorId, floor, 'hall', 'UP')}
                          disabled={elevator.isBlocked || elevator.hall_calls.some(c => c.floor === floor && c.direction === 'UP')}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center
                            ${elevator.isBlocked ? 'bg-gray-300 text-gray-600 cursor-not-allowed' :
                              elevator.hall_calls.some(c => c.floor === floor && c.direction === 'UP') ? 'bg-green-200 text-green-800 animate-pulse-green' :
                              'bg-green-500 hover:bg-green-600 text-white'}
                          `}
                        >
                          Floor {floor} <IconArrowUp className="ml-2 w-5 h-5" />
                        </button>
                      )}
                      {floor > 0 && (
                        <button
                          onClick={() => onSendCall(elevator.elevatorId, floor, 'hall', 'DOWN')}
                          disabled={elevator.isBlocked || elevator.hall_calls.some(c => c.floor === floor && c.direction === 'DOWN')}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center
                            ${elevator.isBlocked ? 'bg-gray-300 text-gray-600 cursor-not-allowed' :
                              elevator.hall_calls.some(c => c.floor === floor && c.direction === 'DOWN') ? 'bg-red-200 text-red-800 animate-pulse-red' :
                              'bg-red-500 hover:bg-red-600 text-white'}
                          `}
                        >
                          Floor {floor} <IconArrowDown className="ml-2 w-5 h-5" />
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md col-span-full lg:col-span-1">
              <h4 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Adjustable Parameters</h4>
              <div className="space-y-4">
                <div>
                  <label htmlFor="doors-hold-open" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Door Hold Open Time (ms): {elevator.doors_hold_open_ms}
                  </label>
                  <input
                    type="range"
                    id="doors-hold-open"
                    min="1000"
                    max="10000"
                    step="500"
                    value={elevator.doors_hold_open_ms}
                    onChange={(e) => onUpdateParam(elevator.elevatorId, 'doors_hold_open_ms', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600 mt-2 transition-all duration-200 hover:h-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                    disabled={elevator.isBlocked}
                  />
                </div>
                <div>
                  <label htmlFor="fan-speed" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fan Speed (%): {elevator.ui_fan_speed_pct}
                  </label>
                  <input
                    type="range"
                    id="fan-speed"
                    min="0"
                    max="100"
                    step="10"
                    value={elevator.ui_fan_speed_pct}
                    onChange={(e) => onUpdateParam(elevator.elevatorId, 'ui_fan_speed_pct', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600 mt-2 transition-all duration-200 hover:h-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                    disabled={elevator.isBlocked}
                  />
                </div>
                <div>
                  <label htmlFor="power-mode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Power Mode:
                  </label>
                  <select
                    id="power-mode"
                    value={elevator.power_mode}
                    onChange={(e) => onUpdateParam(elevator.elevatorId, 'power_mode', e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 transition-all duration-200 hover:shadow-md"
                    disabled={elevator.isBlocked}
                  >
                    {POWER_MODES.map(mode => <option key={mode} value={mode}>{mode}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md col-span-full lg:col-span-1">
              <h4 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Fault Management</h4>
              {elevator.fault_active_codes && elevator.fault_active_codes.length > 0 ? (
                <div>
                  <p className="text-red-500 font-bold mb-2 flex items-center animate-pulse-red"><IconExclamationTriangle className="mr-2 w-5 h-5" /> Active Faults:</p>
                  <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 mb-4">
                    {elevator.fault_active_codes.map((fault, idx) => <li key={idx}>{fault}</li>)}
                  </ul>
                  <button
                    onClick={() => onClearFaults(elevator.elevatorId)}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
                    disabled={elevator.isBlocked}
                  >
                    Clear Active Faults
                  </button>
                </div>
              ) : (
                <p className="text-green-600 dark:text-green-400 transition-colors duration-500">No active faults detected. System running smoothly.</p>
              )}
              {elevator.fault_history && elevator.fault_history.length > 0 && (
                <div className="mt-4 border-t pt-4 border-gray-200 dark:border-gray-600">
                  <h5 className="font-semibold text-md text-gray-800 dark:text-gray-200 mb-2">Fault History:</h5>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 max-h-40 overflow-y-auto custom-scrollbar">
                    {elevator.fault_history.slice().reverse().map((fault, idx) => (
                      <li key={idx} className="mb-1">
                        <span className="font-medium">{fault.code}</span> at {new Date(fault.ts).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ElevatorDetail;