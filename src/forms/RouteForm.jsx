import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import RadarComponent from "../components/radar";
import Select from "react-select";
import { FaPlay } from "react-icons/fa";
import { FaPause } from "react-icons/fa";
import { FaStop } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
const options = [
  {
    value: 1,
    label: (
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src="https://img.freepik.com/premium-vector/plane-top-view-aircraft-flight-airport-vehicle-isolated-white-background_80590-19966.jpg?w=740"
          alt="Plane"
          style={{ width: "50px", height: "50px", marginRight: "10px" }}
        />
        Commercial
      </div>
    ),
  },
  {
    value: 2,
    label: (
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src="https://static.vecteezy.com/system/resources/previews/015/242/306/non_2x/aircraft-or-airplane-on-top-view-png.png"
          alt="Plane"
          style={{ width: "50px", height: "50px", marginRight: "10px" }}
        />
        Cargo
      </div>
    ),
  },
  {
    value: 3,
    label: (
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src="https://www.clipartbest.com/cliparts/4c9/6bg/4c96bg5yi.png"
          alt="Plane"
          style={{ width: "50px", height: "50px", marginRight: "10px" }}
        />
        Fighter Jet
      </div>
    ),
  },
];

const RouteForm = ({
  startLat,
  startLon,
  endLat,
  endLon,
  curvature,
  // speed,
  setStartLat,
  setStartLon,
  setEndLat,
  setEndLon,
  setCurvature,
  // setSpeed,
  drawLine,
  playAnimation,
  pauseAnimation,
  stopAnimation,
  isDrawing,
  isPlaying,
  distance,
  resetInputs,
  clearRoute,
  locations,
  handleLocationSelect,
  fromLocation,
  setFromLocation,
  toLocation,
  setToLocation,
  addEmitterMarkerRandom,
  manualEmitters,
  flightPath,
}) => {
  const [showRadar, setShowRadar] = useState(false);
  const [selectedEmitterType, setSelectedEmitterType] = useState("enemy");

  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    const token = localStorage.getItem("token");

    if (token) {
      localStorage.removeItem("token");
      if (!localStorage.getItem("token")) {
        navigate("/");
      }
    }
  }, [navigate]);

  return (
    <div className="lg:w-140 xl:w-150 !sm:w-100 !xs:w-20 bg-[#34495e] text-white p-5 flex flex-col overflow-auto scrollbar-hide">
      <div className="flex flex-row items-center gap-2 mb-3">
        <input
          id="showR"
          type="checkbox"
          onChange={() => setShowRadar(!showRadar)}
        />
        <label htmlFor="showR">{showRadar ? "Hide Radar" : "Show Radar"}</label>
      </div>
      {showRadar && (
        <div>
          <RadarComponent />
        </div>
      )}

      <div className="bg-black px-5 py-3 mb-5 rounded-xl">
        <h1 className="font-bold text-xl">Emitter Controls</h1>
        <div className="mt-3 mb-3">
          <label className="block text-sm font-medium mb-2">
            Flight Type:{" "}
          </label>
          <Select
            options={options}
            defaultValue={options[0]}
            styles={{
              option: (provided) => ({
                ...provided,
                display: "flex",
                alignItems: "center",
                color: "black",
              }),
            }}
          />
        </div>
        <div className="flex flex-row items-center justify-around flex-wrap">
          <div>
            <button className="bg-[#58a399] py-3 rounded-lg px-10 mb-5">
              <FaPlay className="text-red-400 text-2xl" />
            </button>
          </div>
          <div>
            <button className="bg-[#58a399] py-3 rounded-lg px-10 mb-5">
              <FaPause className="text-red-400 text-2xl" />
            </button>
          </div>
          <div>
            <button className="bg-[#58a399] py-3 rounded-lg px-10 mb-5">
              <FaStop className="text-red-400 text-2xl" />
            </button>
          </div>
          <div>
            <button className="bg-[#58a399] py-3 rounded-lg px-10 mb-5">
              <MdDelete className="text-red-400 text-2xl" />
            </button>
          </div>
        </div>
        <h2 className="bg-white rounded text-black mb-3 font-bold py-2 text-center">
          Flight Path Coordinates
        </h2>
        <ul className="max-h-40 min-h-auto bg-white rounded overflow-auto scrollbar-hide">
          {flightPath.length === 0 ? (
            <p className="text-black px-5 font-black">No flight path drawn yet.</p>
          ) : (
            flightPath.map((point, index) => (
              <li key={index} className="mt-2 text-black px-5">
                <span>{index+ 1}. </span>
               <span className="font-bold">Lat</span>: {point.lat}, <span className="font-bold">Lon</span>: {point.lon}
              </li>
            ))
          )}
        </ul>
      </div>
      <div className="flex flex-row justify-between flex-wrap gap-5">
        <div className="bg-black px-5 py-3 rounded-xl gap-5">
          <h2 className="text-2xl font-bold mb-4">Route Planner</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              From Location
            </label>
            <select
              value={fromLocation}
              onChange={(e) => {
                const selectedLocation = locations.find(
                  (loc) => loc.name === e.target.value
                );
                if (selectedLocation) {
                  handleLocationSelect(selectedLocation, "from");
                  setFromLocation(e.target.value);
                }
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm"
            >
              <option value="">Select From Location</option>
              {locations.map((loc) => (
                <option key={`from-${loc.name}`} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              To Location
            </label>
            <select
              value={toLocation}
              onChange={(e) => {
                const selectedLocation = locations.find(
                  (loc) => loc.name === e.target.value
                );
                if (selectedLocation) {
                  handleLocationSelect(selectedLocation, "to");
                  setToLocation(e.target.value);
                }
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm"
            >
              <option value="">Select To Location</option>
              {locations.map((loc) => (
                <option key={`to-${loc.name}`} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              From Location
            </label>
            <input
              type="text"
              placeholder="Latitude"
              value={startLat}
              onChange={(e) => setStartLat(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm"
            />
            <input
              type="text"
              placeholder="Longitude"
              value={startLon}
              onChange={(e) => setStartLon(e.target.value)}
              className="mt-2 block w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              To Location
            </label>
            <input
              type="text"
              placeholder="Latitude"
              value={endLat}
              onChange={(e) => setEndLat(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm"
            />
            <input
              type="text"
              placeholder="Longitude"
              value={endLon}
              onChange={(e) => setEndLon(e.target.value)}
              className="mt-2 block w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Curvature</label>
            <input
              type="number"
              step="0.1"
              placeholder="Curvature"
              value={curvature}
              onChange={(e) => setCurvature(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm"
            />
          </div>

          {/* ADJUSTING SPEED DISABLED BECAUSE ANIMATION IS LAGGING FOR CURVED ANGLE */}

          {/* 
          // <div className="mb-4">
          //   <label className="block text-sm font-medium mb-1">Speed</label>
          //   <select
          //     value={speed}
          //     onChange={(e) => setSpeed(parseInt(e.target.value))}
          //     className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm"
          //   >
          //     <option value={1}>1x</option>
          //     <option value={2}>2x</option>
          //     <option value={3}>3x</option>
          //     <option value={4}>4x</option>
          //     <option value={5}>5x</option>
          //   </select>
          // </div> */}

          <button
            onClick={drawLine}
            disabled={isDrawing || isPlaying}
            className="mt-4 rounded bg-green-500 py-2 px-4 text-white shadow hover:bg-green-600 disabled:opacity-50"
          >
            Draw Route
          </button>

          <div className="flex mt-4 space-x-2">
            <button
              onClick={playAnimation}
              disabled={isPlaying}
              className="rounded bg-blue-500 py-2 px-4 text-white shadow hover:bg-blue-600 disabled:opacity-50"
            >
              Play
            </button>
            <button
              onClick={pauseAnimation}
              disabled={!isPlaying}
              className="rounded bg-yellow-500 py-2 px-4 text-white shadow hover:bg-yellow-600 disabled:opacity-50"
            >
              Pause
            </button>
            <button
              onClick={stopAnimation}
              className="rounded bg-red-500 py-2 px-4 text-white shadow hover:bg-red-600"
            >
              Stop
            </button>
          </div>

          <div className="flex mt-4 space-x-2">
            <button
              onClick={clearRoute}
              className="rounded bg-red-500 py-2 px-4 text-white shadow hover:bg-red-600"
            >
              Clear Route
            </button>
            <button
              onClick={resetInputs}
              className="rounded bg-gray-500 py-2 px-4 text-white shadow hover:bg-gray-600"
            >
              Reset
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="rounded bg-yellow-500 py-2 px-4 mt-5 mb-5 font-bold text-white shadow hover:bg-gray-600"
          >
            Logout
          </button>

          {distance && (
            <p className="mt-4 text-sm">
              <span className="font-medium">Distance:</span> {distance} km
            </p>
          )}
        </div>

        <div className="bg-black h-auto px-5 py-3 flex-1 rounded-xl w-auto">
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Emitter Type:
            </label>
            <div className="flex !flex-row !items-center gap-3 justify-between">
              <select
                className="mt-1 block flex-1 rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm"
                value={selectedEmitterType}
                onChange={(e) => setSelectedEmitterType(e.target.value)}
              >
                <option value="enemy">Enemy Emitter</option>
                <option value="friendly">Friendly Emitter</option>
              </select>

              <div className="bg-[#58a399] text-center flex-1 px-3 py-2 rounded-xl w-20">
                <button
                  onClick={() => {
                    addEmitterMarkerRandom(selectedEmitterType);
                  }}
                >
                  Add +
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <h1 className="font-bold">Enemy Emitters</h1>
            {manualEmitters.some((emitter) => emitter.type === "enemy") && (
              <div className="h-60 overflow-auto scrollbar-hide bg-white p-2 rounded">
                {manualEmitters
                  .filter((emitter) => emitter.type === "enemy")
                  .map((emitter, enemyIndex) => {
                    if (emitter.type === "enemy") {
                      return (
                        <div
                          key={enemyIndex}
                          className="flex justify-start items-center p-3 mt-2 rounded-md bg-gray-500"
                        >
                          <p className="text-white font-semibold">
                            ET: {enemyIndex + 1}
                          </p>
                          <div className="mx-auto">
                            <p className="text-white text-sm">
                              Lat: {emitter.lat}
                            </p>
                            <p className="text-white text-sm">
                              Lon: {emitter.lon}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
              </div>
            )}
          </div>

          <div className="mt-5">
            <h1 className="font-bold">Friendly Emitters</h1>
            {manualEmitters.some((emitter) => emitter.type === "friendly") && (
              <div className="h-60 overflow-auto scrollbar-hide bg-white p-2 rounded">
                {manualEmitters
                  .filter((emitter) => emitter.type === "friendly")
                  .map((emitter, frndIndex) => {
                    if (emitter.type === "friendly") {
                      return (
                        <div
                          key={frndIndex}
                          className="flex justify-start items-center p-3 mt-2 rounded-md bg-gray-500"
                        >
                          <p className="text-white font-semibold">
                            FT: {frndIndex + 1}
                          </p>
                          <div className="mx-auto">
                            <p className="text-white text-sm">
                              Lat: {emitter.lat}
                            </p>
                            <p className="text-white text-sm">
                              Lon: {emitter.lon}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteForm;
