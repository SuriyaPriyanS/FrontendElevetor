// src/App.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { collection, query, onSnapshot, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { FirebaseContext } from './contexts/FirebaseContext.jsx';
import ElevatorCard from './Components/ElevatorCard.jsx';
import ElevatorDetail from './Components/ElevatorDetail.jsx';
import { generateUUID, withExponentialBackoff } from './utils/utils';
import { INITIAL_ELEVATOR_STATE, NUM_FLOORS, TRAVEL_DIRECTIONS, DOOR_STATES, POWER_MODES, LOAD_WEIGHING_STATUS } from './constants/constants.jsx';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

function App() {
  const { db, auth, userId, isAuthReady } = useContext(FirebaseContext);
  const [elevators, setElevators] = useState([]);
  const [selectedElevatorId, setSelectedElevatorId] = useState(null);
  const [notification, setNotification] = useState(null);

  const elevatorRef = useRef({});

  useEffect(() => {
    if (!db || !isAuthReady) return;

    const elevatorsCollectionRef = collection(db, `artifacts/${__app_id}/public/data/elevators`);
    const q = query(elevatorsCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedElevators = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setElevators(updatedElevators);
      console.log("Elevators updated in UI:", updatedElevators);

      updatedElevators.forEach(elevator => {
        if (elevator.operationalStatus === "ERROR_TO_BE_CHECKED") {
          showNotification(`Elevator ${elevator.elevatorId} is in ERROR state! Faults: ${elevator.fault_active_codes.join(', ')}`, 'error');
        } else if (elevator.operationalStatus === "STOPPED_POWERED_OFF" && elevator.isBlocked) {
          showNotification(`Elevator ${elevator.elevatorId} has been STOPPED remotely.`, 'warning');
        }
      });
    }, (error) => {
      console.error("Error fetching elevators:", error);
    });

    return () => {
      unsubscribe();
      Object.values(elevatorRef.current).forEach(intervalId => clearInterval(intervalId));
    };
  }, [db, isAuthReady]);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const getElevatorDocRef = (elevatorId) => doc(db, `artifacts/${__app_id}/public/data/elevators`, elevatorId);

  const startElevatorSimulation = async (elevatorId) => {
    if (!db || !auth || !userId || !isAuthReady) return;

    if (elevatorRef.current[elevatorId]) {
      clearInterval(elevatorRef.current[elevatorId]);
    }

    const docRef = getElevatorDocRef(elevatorId);

    const intervalId = setInterval(async () => {
      try {
        await withExponentialBackoff(async () => {
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists()) {
            console.error(`Elevator ${elevatorId} not found for simulation.`);
            clearInterval(intervalId);
            delete elevatorRef.current[elevatorId];
            return;
          }

          let elevatorData = docSnap.data();

          if (elevatorData.isBlocked) {
            elevatorData.operationalStatus = "STOPPED_POWERED_OFF";
            elevatorData.speed_mps = 0;
            elevatorData.acceleration_mps2 = 0;
            elevatorData.direction = TRAVEL_DIRECTIONS[2];
            await updateDoc(docRef, elevatorData);
            return;
          }

          if (Math.random() < 0.005 && elevatorData.fault_active_codes.length === 0) {
            const faultCode = `F-${Math.floor(Math.random() * 999) + 100}`;
            elevatorData.fault_active_codes.push(faultCode);
            elevatorData.fault_history.push({ code: faultCode, ts: Date.now(), data: "Simulated fault" });
            elevatorData.operationalStatus = "ERROR_TO_BE_CHECKED";
            elevatorData.speed_mps = 0;
            elevatorData.acceleration_mps2 = 0;
            elevatorData.direction = TRAVEL_DIRECTIONS[2];
            elevatorData.doorState = DOOR_STATES[2];
            elevatorData.predictive_health_score_pct = Math.max(0, elevatorData.predictive_health_score_pct - 10);
            await updateDoc(docRef, elevatorData);
            return;
          }

          if (elevatorData.operationalStatus === "ERROR_TO_BE_CHECKED" && Math.random() < 0.01) {
            elevatorData.fault_active_codes = [];
            if (elevatorData.predictive_health_score_pct < 90) elevatorData.predictive_health_score_pct += 5;
            elevatorData.operationalStatus = "IDLE_NO_REQUEST";
            await updateDoc(docRef, elevatorData);
            return;
          }

          let { currentFloor, targetFloor, direction, speed_mps, acceleration_mps2, doorState, hall_calls, car_calls, setpoints_speed_mps, setpoints_accel_mps2 } = elevatorData;

          const allCalls = [...new Set([...hall_calls.map(c => c.floor), ...car_calls])].sort((a, b) => a - b);

          if (allCalls.length > 0 && elevatorData.operationalStatus !== "ERROR_TO_BE_CHECKED") {
            if (targetFloor === currentFloor && doorState === DOOR_STATES[2]) {
              let nextTarget = -1;
              let currentDirectionPreference = direction;

              if (direction === TRAVEL_DIRECTIONS[0]) {
                nextTarget = allCalls.find(f => f > currentFloor);
                if (nextTarget === undefined) {
                  currentDirectionPreference = TRAVEL_DIRECTIONS[1];
                  nextTarget = allCalls.find(f => f < currentFloor);
                }
              } else if (direction === TRAVEL_DIRECTIONS[1]) {
                nextTarget = allCalls.find(f => f < currentFloor);
                if (nextTarget === undefined) {
                  currentDirectionPreference = TRAVEL_DIRECTIONS[0];
                  nextTarget = allCalls.find(f => f > currentFloor);
                }
              }

              if (nextTarget === -1 || direction === TRAVEL_DIRECTIONS[2]) {
                const distances = allCalls.map(f => Math.abs(f - currentFloor));
                const minDistance = Math.min(...distances);
                nextTarget = allCalls[distances.indexOf(minDistance)];
                if (nextTarget > currentFloor) currentDirectionPreference = TRAVEL_DIRECTIONS[0];
                else if (nextTarget < currentFloor) currentDirectionPreference = TRAVEL_DIRECTIONS[1];
                else currentDirectionPreference = TRAVEL_DIRECTIONS[2];
              }

              if (nextTarget !== -1) {
                targetFloor = nextTarget;
                direction = currentDirectionPreference;
                elevatorData.operationalStatus = "RUNNING_FINE_OPERATIONAL";
                elevatorData.ui_display_message = `Moving to Floor ${targetFloor}`;
              } else {
                direction = TRAVEL_DIRECTIONS[2];
                elevatorData.operationalStatus = "IDLE_NO_REQUEST";
                elevatorData.ui_display_message = "Idle";
              }
            }
          } else if (allCalls.length === 0 && elevatorData.operationalStatus !== "ERROR_TO_BE_CHECKED") {
            direction = TRAVEL_DIRECTIONS[2];
            elevatorData.operationalStatus = "IDLE_NO_REQUEST";
            elevatorData.ui_display_message = "Idle";
          }

          const floorHeight = 3.5;
          const timeStep = 0.1;

          if (direction === TRAVEL_DIRECTIONS[0] && currentFloor < targetFloor) {
            elevatorData.speed_mps = Math.min(setpoints_speed_mps, speed_mps + setpoints_accel_mps2 * timeStep);
            elevatorData.position_m_above_pit += elevatorData.speed_mps * timeStep;
            elevatorData.acceleration_mps2 = setpoints_accel_mps2;
          } else if (direction === TRAVEL_DIRECTIONS[1] && currentFloor > targetFloor) {
            elevatorData.speed_mps = Math.min(setpoints_speed_mps, speed_mps + setpoints_accel_mps2 * timeStep);
            elevatorData.position_m_above_pit -= elevatorData.speed_mps * timeStep;
            elevatorData.acceleration_mps2 = setpoints_accel_mps2;
          } else {
            elevatorData.speed_mps = Math.max(0, speed_mps - setpoints_accel_mps2 * timeStep);
            if (elevatorData.speed_mps < 0.1) elevatorData.speed_mps = 0;
            elevatorData.acceleration_mps2 = -setpoints_accel_mps2;
          }

          const newFloor = Math.round(elevatorData.position_m_above_pit / floorHeight);
          if (newFloor !== currentFloor) {
            elevatorData.currentFloor = Math.max(0, Math.min(NUM_FLOORS - 1, newFloor));
          }

          if (elevatorData.currentFloor === targetFloor && elevatorData.speed_mps === 0) {
            if (doorState === DOOR_STATES[2]) {
              elevatorData.doorState = DOOR_STATES[3];
            } else if (doorState === DOOR_STATES[3]) {
              elevatorData.doorState = DOOR_STATES[0];
              elevatorData.car_calls = elevatorData.car_calls.filter(f => f !== currentFloor);
              elevatorData.hall_calls = elevatorData.hall_calls.filter(c => c.floor !== currentFloor);
            } else if (doorState === DOOR_STATES[0]) {
              setTimeout(() => {
                if (!elevatorData.car_calls.includes(currentFloor) && !elevatorData.hall_calls.some(c => c.floor === currentFloor)) {
                  elevatorData.doorState = DOOR_STATES[1];
                  updateDoc(docRef, { doorState: DOOR_STATES[1] });
                }
              }, elevatorData.doors_hold_open_ms);
            } else if (doorState === DOOR_STATES[1]) {
              elevatorData.doorState = DOOR_STATES[2];
              elevatorData.direction = TRAVEL_DIRECTIONS[2];
              if (elevatorData.car_calls.length === 0 && elevatorData.hall_calls.length === 0) {
                elevatorData.operationalStatus = "IDLE_NO_REQUEST";
              }
            }
          }

          elevatorData.car_load_kg = Math.max(0, Math.min(elevatorData.car_occupancy_count * 75 + Math.random() * 50, 1000));
          elevatorData.car_overload = elevatorData.car_load_kg > 800;
          elevatorData.load_weighing_status = elevatorData.car_overload ? "OVERLOAD" : (elevatorData.car_load_kg > 600 ? "NEAR_OVERLOAD" : "OK");

          elevatorData.motor_temp_C = Math.min(elevatorData.motor_temp_C + (elevatorData.speed_mps > 0 ? 0.1 : -0.05) + Math.random() * 0.1, 80);
          if (elevatorData.motor_temp_C > 70 && !elevatorData.fault_active_codes.includes("MOTOR_OVERHEAT")) {
            elevatorData.fault_active_codes.push("MOTOR_OVERHEAT");
            elevatorData.fault_history.push({ code: "MOTOR_OVERHEAT", ts: Date.now(), data: "Simulated fault" });
            elevatorData.operationalStatus = "ERROR_TO_BE_CHECKED";
            elevatorData.speed_mps = 0;
            elevatorData.acceleration_mps2 = 0;
            elevatorData.direction = TRAVEL_DIRECTIONS[2];
          }

          elevatorData.usage_cycle_count++;
          elevatorData.usage_rope_runtime_hours += elevatorData.speed_mps > 0 ? (timeStep / 3600) : 0;
          elevatorData.wear_traction_rope_pct = Math.min(100, elevatorData.usage_rope_runtime_hours * 0.01 + Math.random() * 0.1);
          elevatorData.wear_brake_lining_pct = Math.min(100, elevatorData.usage_cycle_count * 0.001 + Math.random() * 0.1);

          if (elevatorData.predictive_health_score_pct > 0.01) {
            elevatorData.predictive_health_score_pct = Math.max(0, elevatorData.predictive_health_score_pct - (elevatorData.operationalStatus === "ERROR_TO_BE_CHECKED" ? 0.5 : 0.01));
          }

          elevatorData.lastUpdateTime = Date.now();

          await updateDoc(docRef, elevatorData);
        });
      } catch (error) {
        console.error(`Error in elevator ${elevatorId} simulation loop:`, error);
        clearInterval(intervalId);
        delete elevatorRef.current[elevatorId];
      }
    }, 1000);

    elevatorRef.current[elevatorId] = intervalId;
    console.log(`Started simulation for elevator ${elevatorId}`);
  };

  const createElevator = async () => {
    if (!db || !auth || !userId || !isAuthReady) return;

    const newElevatorId = generateUUID();
    const elevatorData = INITIAL_ELEVATOR_STATE(newElevatorId);
    const docRef = doc(db, `artifacts/${__app_id}/public/data/elevators`, newElevatorId);

    try {
      await withExponentialBackoff(() => setDoc(docRef, elevatorData));
      showNotification(`Elevator ${newElevatorId} created!`, 'success');
      startElevatorSimulation(newElevatorId);
    } catch (e) {
      console.error("Error adding document: ", e);
      showNotification("Error creating elevator.", 'error');
    }
  };

  const toggleElevatorBlock = async (elevatorId, isBlocked) => {
    if (!db || !auth || !userId || !isAuthReady) return;
    const docRef = getElevatorDocRef(elevatorId);
    try {
      await withExponentialBackoff(() => updateDoc(docRef, { isBlocked }));
      showNotification(`Elevator ${elevatorId} ${isBlocked ? 'blocked' : 'unblocked'}!`, isBlocked ? 'warning' : 'info');
    } catch (e) {
      console.error(`Error toggling block for elevator ${elevatorId}: `, e);
      showNotification("Error updating elevator status.", 'error');
    }
  };

  const sendCall = async (elevatorId, floor, type, direction = null) => {
    if (!db || !auth || !userId || !isAuthReady) return;
    const docRef = getElevatorDocRef(elevatorId);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        let elevatorData = docSnap.data();
        if (type === 'car') {
          if (!elevatorData.car_calls.includes(floor)) {
            elevatorData.car_calls.push(floor);
          }
        } else if (type === 'hall') {
          if (!elevatorData.hall_calls.some(c => c.floor === floor && c.direction === direction)) {
            elevatorData.hall_calls.push({ floor, direction });
          }
        }
        await withExponentialBackoff(() => updateDoc(docRef, { car_calls: elevatorData.car_calls, hall_calls: elevatorData.hall_calls }));
        showNotification(`Call sent to Elevator ${elevatorId} for floor ${floor}.`, 'info');
      }
    } catch (e) {
      console.error(`Error sending call to elevator ${elevatorId}: `, e);
      showNotification("Error sending call.", 'error');
    }
  };

  const updateElevatorParam = async (elevatorId, param, value) => {
    if (!db || !auth || !userId || !isAuthReady) return;
    const docRef = getElevatorDocRef(elevatorId);
    try {
      await withExponentialBackoff(() => updateDoc(docRef, { [param]: value }));
      showNotification(`Elevator ${elevatorId} ${param} updated to ${value}.`, 'info');
    } catch (e) {
      console.error(`Error updating param ${param} for elevator ${elevatorId}: `, e);
      showNotification("Error updating parameter.", 'error');
    }
  };

  const clearFaults = async (elevatorId) => {
    if (!db || !auth || !userId || !isAuthReady) return;
    const docRef = getElevatorDocRef(elevatorId);
    try {
      await withExponentialBackoff(() => updateDoc(docRef, {
        fault_active_codes: [],
        operationalStatus: "IDLE_NO_REQUEST",
        predictive_health_score_pct: Math.min(100, (elevators.find(e => e.elevatorId === elevatorId)?.predictive_health_score_pct || 0) + 10)
      }));
      showNotification(`Faults cleared for Elevator ${elevatorId}.`, 'success');
    } catch (e) {
      console.error(`Error clearing faults for elevator ${elevatorId}: `, e);
      showNotification("Error clearing faults.", 'error');
    }
  };

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg">Loading secure environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 font-inter text-gray-800 dark:text-gray-200 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center mb-12 text-gray-900 dark:text-white drop-shadow-lg">
          Elevator IoT Portal 🏢
        </h1>

        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl text-white animate-fade-in-out ${
            notification.type === 'error' ? 'bg-red-600' :
            notification.type === 'warning' ? 'bg-orange-500' :
            'bg-blue-500'
          }`}>
            {notification.message}
          </div>
        )}

        <div className="flex justify-center gap-4 mb-10">
          <button
            onClick={createElevator}
            className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            <span className="mr-2 text-xl">+</span> Add New Elevator
          </button>
        </div>

        <div className="text-center text-sm mb-8 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner">
          <p className="font-semibold text-gray-700 dark:text-gray-300">Your User ID:</p>
          <p className="break-all text-gray-600 dark:text-gray-400">{userId || "Not available"}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {elevators.length === 0 ? (
            <p className="col-span-full text-center text-xl text-gray-500 dark:text-gray-400">
              No elevators created yet. Click "Add New Elevator" to begin!
            </p>
          ) : (
            elevators.map((elevator) => (
              <ElevatorCard
                key={elevator.elevatorId}
                elevator={elevator}
                onSelect={() => setSelectedElevatorId(elevator.elevatorId)}
                onToggleBlock={toggleElevatorBlock}
              />
            ))
          )}
        </div>

        {selectedElevatorId && (
          <ElevatorDetail
            elevator={elevators.find(e => e.elevatorId === selectedElevatorId)}
            onClose={() => setSelectedElevatorId(null)}
            onToggleBlock={toggleElevatorBlock}
            onSendCall={sendCall}
            onUpdateParam={updateElevatorParam}
            onClearFaults={clearFaults}
          />
        )}
      </div>
    </div>
  );
}

export default App;