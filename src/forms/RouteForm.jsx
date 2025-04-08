import React, { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RadarComponent from "../components/radar";
import { FaPlay } from "react-icons/fa";
import { FaPause } from "react-icons/fa";
import { FaStop } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { MdRoute } from "react-icons/md";
import { TbRouteOff } from "react-icons/tb";
import { FaCirclePlay } from "react-icons/fa6";
import { FaCirclePause } from "react-icons/fa6";
import { FaCircleStop } from "react-icons/fa6";
import { BiReset } from "react-icons/bi";
import { Controller, useForm } from "react-hook-form";

const RouteForm = ({
  startLat,
  startLon,
  endLat,
  endLon,
  curvature,
  setStartLat,
  setStartLon,
  setEndLat,
  setEndLon,
  setCurvature,
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
  playFlightAnimation,
  pauseFlightAnimation,
  stopFlightAnimation,
}) => {
  const navigate = useNavigate();
  const [showRadar, setShowRadar] = useState(false);
  const [selectedEmitterType, setSelectedEmitterType] = useState("enemy");

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, touchedFields },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      latitude: startLat || "",
      longitude: startLon || "",
      latitudeEnd: endLat || "",
      longitudeEnd: endLon || "",
      curvature: curvature || "",
    },
  });

  useEffect(() => {
    setValue("latitude", startLat, { shouldValidate: true });
    setValue("longitude", startLon, { shouldValidate: true });
  }, [startLat, startLon, setValue]);

  useEffect(() => {
    setValue("latitudeEnd", endLat, { shouldValidate: true });
    setValue("longitudeEnd", endLon, { shouldValidate: true });
  }, [endLat, endLon, setValue]);

  useEffect(() => {
    setValue("curvature", curvature, { shouldValidate: true });
  }, [curvature, setValue]);

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
    <div className="w-100 bg-[#34495e] text-white p-5 flex flex-col overflow-auto scrollbar-hide">
      <div className="bg-transparent">
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            <Typography component="span">
              Multi Line Flight Controls & Details
            </Typography>
          </AccordionSummary>
          <AccordionDetails className="p-0">
            <div className="bg-black px-5 py-3 mb-5 rounded-xl">
              <h1 className="font-bold text-xl text-white mb-3">
                Flight Controls
              </h1>
              <div className="flex flex-row items-center justify-around flex-wrap">
                <div>
                  <button
                    onClick={playFlightAnimation}
                    className="bg-[#58a399] py-3 rounded-lg px-8 mb-5"
                  >
                    <FaPlay className="text-white text-2xl" />
                  </button>
                </div>
                <div>
                  <button
                    onClick={pauseFlightAnimation}
                    className="bg-[#58a399] py-3 rounded-lg px-8 mb-5"
                  >
                    <FaPause className="text-white text-2xl" />
                  </button>
                </div>
                <div>
                  <button
                    onClick={stopFlightAnimation}
                    className="bg-[#58a399] py-3 rounded-lg px-8 mb-5"
                  >
                    <FaStop className="text-white text-2xl" />
                  </button>
                </div>
              </div>
              <h2 className="bg-white rounded text-black mb-3 font-bold py-2 text-center">
                Flight Path Coordinates
              </h2>
              <ul className="max-h-40 min-h-auto bg-white rounded overflow-auto scrollbar-hide">
                {flightPath.length === 0 ? (
                  <p className="text-black px-5 font-black">
                    No flight path drawn yet.
                  </p>
                ) : (
                  flightPath.map((point, index) => (
                    <li key={index} className="mt-2 text-black px-5">
                      <span>{index + 1}. </span>
                      <span className="font-bold">Lat</span>: {point.lat},{" "}
                      <span className="font-bold">Lon</span>: {point.lon}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </AccordionDetails>
        </Accordion>

        {/* Accordion 2: Flight Route Planner */}
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2-content"
            id="panel2-header"
            className="bg-green-500"
          >
            <Typography component="span">Flight Route Planner</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <form onSubmit={handleSubmit(drawLine)}>
              <div className="bg-black px-5 py-3 rounded-xl gap-5">
                <h2 className="text-2xl font-bold mb-4 text-white">
                  Route Planner
                </h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-white">
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

                        setValue("latitude", selectedLocation.lat, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        setValue("longitude", selectedLocation.lon, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        setStartLat(selectedLocation.lat);
                        setStartLon(selectedLocation.lon);
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
                  <label className="block text-sm font-medium mb-1 text-white">
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

                        setValue("latitudeEnd", selectedLocation.lat, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        setValue("longitudeEnd", selectedLocation.lon, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        setEndLat(selectedLocation.lat);
                        setEndLon(selectedLocation.lon);
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

                {/* From Location Coordinates */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-white">
                    From Location Coordinates
                  </label>
                  <Controller
                    name="latitude"
                    control={control}
                    rules={{ required: "Latitude value is required" }}
                    render={({ field }) => (
                      <input
                        id="latitude"
                        type="text"
                        placeholder="Enter your latitude"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setStartLat(e.target.value);
                        }}
                        className="w-full p-4 mt-2 rounded-lg border-2 border-teal-500 bg-gray-800 text-white focus:ring-2 focus:ring-teal-400 focus:border-transparent transition duration-300"
                      />
                    )}
                  />
                  {errors.latitude && touchedFields.latitude && (
                    <span className="text-red-500 text-sm">
                      {errors.latitude.message}
                    </span>
                  )}
                  <Controller
                    name="longitude"
                    control={control}
                    rules={{ required: "Longitude value is required" }}
                    render={({ field }) => (
                      <input
                        id="longitude"
                        type="text"
                        placeholder="Enter your longitude"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setStartLon(e.target.value);
                        }}
                        className="w-full p-4 mt-2 rounded-lg border-2 border-teal-500 bg-gray-800 text-white focus:ring-2 focus:ring-teal-400 focus:border-transparent transition duration-300"
                      />
                    )}
                  />
                  {errors.longitude && touchedFields.longitude && (
                    <span className="text-red-500 text-sm">
                      {errors.longitude.message}
                    </span>
                  )}
                </div>

                {/* To Location Coordinates */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-white">
                    To Location Coordinates
                  </label>
                  <Controller
                    name="latitudeEnd"
                    control={control}
                    rules={{ required: "Latitude (end) value is required" }}
                    render={({ field }) => (
                      <input
                        id="latitudeEnd"
                        type="text"
                        placeholder="Enter your latitude"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setEndLat(e.target.value);
                        }}
                        className="w-full p-4 mt-2 rounded-lg border-2 border-teal-500 bg-gray-800 text-white focus:ring-2 focus:ring-teal-400 focus:border-transparent transition duration-300"
                      />
                    )}
                  />
                  {errors.latitudeEnd && touchedFields.latitudeEnd && (
                    <span className="text-red-500 text-sm">
                      {errors.latitudeEnd.message}
                    </span>
                  )}
                  <Controller
                    name="longitudeEnd"
                    control={control}
                    rules={{ required: "Longitude (end) value is required" }}
                    render={({ field }) => (
                      <input
                        id="longitudeEnd"
                        type="text"
                        placeholder="Enter your End Longitude"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setEndLon(e.target.value);
                        }}
                        className="w-full p-4 mt-2 rounded-lg border-2 border-teal-500 bg-gray-800 text-white focus:ring-2 focus:ring-teal-400 focus:border-transparent transition duration-300"
                      />
                    )}
                  />
                  {errors.longitudeEnd && touchedFields.longitudeEnd && (
                    <span className="text-red-500 text-sm">
                      {errors.longitudeEnd.message}
                    </span>
                  )}
                </div>

                {/* Curvature Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-white">
                    Curvature
                  </label>
                  <Controller
                    name="curvature"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Curvature"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setCurvature(e.target.value);
                        }}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm"
                      />
                    )}
                  />
                </div>

                <div className="flex flex-row gap-1 items-center justify-between">
                  <button
                    type="submit"
                    disabled={isDrawing || isPlaying}
                    className="mt-4 flex-1 rounded flex flex-row items-center gap-2 bg-green-500 py-2 px-4 text-white shadow hover:bg-green-600 disabled:opacity-50"
                  >
                    <MdRoute />
                    Draw Route
                  </button>
                  <button
                    onClick={clearRoute}
                    type="button"
                    className="mt-4 flex-1 rounded flex flex-row items-center gap-2 bg-red-500 py-2 px-4 text-white shadow hover:bg-red-600 disabled:opacity-50"
                  >
                    <TbRouteOff />
                    Clear Route
                  </button>
                </div>
                <div className="flex mt-4 space-x-2">
                  <button
                    onClick={playAnimation}
                    disabled={isPlaying}
                    type="button"
                    className="rounded bg-blue-500 py-2 flex-1 px-4 text-white shadow hover:bg-blue-600 disabled:opacity-50"
                  >
                    <FaCirclePlay size={30} className="mx-auto" />
                  </button>
                  <button
                    onClick={pauseAnimation}
                    disabled={!isPlaying}
                    type="button"
                    className="rounded bg-yellow-500 flex-1 py-2 px-4 text-white shadow hover:bg-yellow-600 disabled:opacity-50"
                  >
                    <FaCirclePause size={30} className="mx-auto" />
                  </button>
                  <button
                    onClick={stopAnimation}
                    type="button"
                    className="rounded bg-red-500 flex-1 py-2 px-4 text-white shadow hover:bg-red-600"
                  >
                    <FaCircleStop size={30} className="mx-auto" />
                  </button>
                </div>

                <div className="mt-4">
                  <button
                    onClick={resetInputs}
                    type="button"
                    className="rounded flex-1 flex w-auto items-center gap-1 bg-gray-500 py-2 px-4 text-white shadow hover:bg-gray-600"
                  >
                    <BiReset />
                    Reset
                  </button>
                </div>

                {distance && (
                  <p className="mt-4 text-sm text-white">
                    <span className="font-medium text-white">Distance:</span>{" "}
                    {distance} km
                  </p>
                )}
              </div>
            </form>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel3-content"
            id="panel3-header"
          >
            <Typography component="span">Emitter Actions</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className="bg-black h-auto px-5 py-3 flex-1 rounded-xl w-auto">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">
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
                      className="text-white font-bold"
                      onClick={() =>
                        addEmitterMarkerRandom(selectedEmitterType)
                      }
                    >
                      Add +
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <h1 className="font-bold text-white">Enemy Emitters</h1>
                {manualEmitters.some((emitter) => emitter.type === "enemy") && (
                  <div className="h-60 overflow-auto scrollbar-hide bg-white p-2 rounded">
                    {manualEmitters
                      .filter((emitter) => emitter.type === "enemy")
                      .map((emitter, enemyIndex) => (
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
                      ))}
                  </div>
                )}
              </div>

              <div className="mt-5">
                <h1 className="font-bold text-white">Friendly Emitters</h1>
                {manualEmitters.some(
                  (emitter) => emitter.type === "friendly"
                ) && (
                  <div className="h-60 overflow-auto scrollbar-hide bg-white p-2 rounded">
                    {manualEmitters
                      .filter((emitter) => emitter.type === "friendly")
                      .map((emitter, frndIndex) => (
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
                      ))}
                  </div>
                )}
              </div>
            </div>
          </AccordionDetails>
        </Accordion>
      </div>

      <div className="flex flex-row items-center gap-2 mb-3 mt-3">
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

      <button
        onClick={handleLogout}
        className="rounded bg-yellow-500 py-2 px-4 mt-5 mb-5 font-bold text-white shadow hover:bg-gray-600"
      >
        Logout
      </button>
    </div>
  );
};

export default RouteForm;
