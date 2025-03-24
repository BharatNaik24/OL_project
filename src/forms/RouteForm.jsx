import React from "react";

const RouteForm = ({
  startLat,
  startLon,
  endLat,
  endLon,
  curvature,
  speed,
  setStartLat,
  setStartLon,
  setEndLat,
  setEndLon,
  setCurvature,
  setSpeed,
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
}) => {
  return (
    <div className="w-80 bg-[#34495e] text-white p-5 flex flex-col">
      <h2 className="text-2xl font-bold mb-4">Route Planner</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">From Location</label>
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
        <label className="block text-sm font-medium mb-1">To Location</label>
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
        <label className="block text-sm font-medium mb-1">From Location</label>
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
        <label className="block text-sm font-medium mb-1">To Location</label>
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

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Speed</label>
        <select
          value={speed}
          onChange={(e) => setSpeed(parseInt(e.target.value))}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm"
        >
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={3}>3x</option>
          <option value={4}>4x</option>
          <option value={5}>5x</option>
        </select>
      </div>

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

      {distance && (
        <p className="mt-4 text-sm">
          <span className="font-medium">Distance:</span> {distance} km
        </p>
      )}
    </div>
  );
};

export default RouteForm;
