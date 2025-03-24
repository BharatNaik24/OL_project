import React, { useState, useEffect, useRef, useCallback } from "react";
import Map from "ol/Map.js";
import View from "ol/View.js";
import TileLayer from "ol/layer/Tile.js";
import OSM from "ol/source/OSM.js";
import { LineString, Point } from "ol/geom";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Feature } from "ol";
import { fromLonLat } from "ol/proj";
import { Style, Circle as CircleStyle, Fill, Stroke, Icon } from "ol/style";
import Overlay from "ol/Overlay.js";
import "ol/ol.css";
import RouteForm from "../forms/RouteForm";

const MapComponent = () => {
  const [startLat, setStartLat] = useState("");
  const [startLon, setStartLon] = useState("");
  const [endLat, setEndLat] = useState("");
  const [endLon, setEndLon] = useState("");
  const [curvature, setCurvature] = useState("-0.2");
  const [distance, setDistance] = useState(null);
  const [speed, setSpeed] = useState(1);
  const [map, setMap] = useState(null);
  const [vectorLayer, setVectorLayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationPath, setAnimationPath] = useState([]);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [selectedEmitters, setSelectedEmitters] = useState([]);

  const mapElement = useRef(null);
  const emitterLayerRef = useRef(null);
  const overlayRef = useRef(null);

  const animationFeatureRef = useRef(null);
  const animationFrameRef = useRef(null);
  const animationStartTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);
  const animationPlayingRef = useRef(false);
  const baseAnimationDuration = 90000;

  const iconSrc =
    "https://png.pngtree.com/png-vector/20230530/ourmid/pngtree-airplane-icon-vector-png-image_7114175.png";

  const getEmitterStyle = (type) => {
    const color = type === "friendly" ? "green" : "red";
    return new Style({
      image: new CircleStyle({
        radius: 8,
        fill: new Fill({ color }),
        stroke: new Stroke({ color: "white", width: 2 }),
      }),
    });
  };

  const addEmitterMarker = useCallback((coordinate, type) => {
    if (!emitterLayerRef.current) return;
    const marker = new Feature({
      geometry: new Point(coordinate),
    });
    marker.setStyle(getEmitterStyle(type));
    emitterLayerRef.current.getSource().addFeature(marker);
  }, []);

  const latLonToCoords = (lat, lon) => fromLonLat([lon, lat]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (val) => (val * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getCurvedLineCoordinates = (
    start,
    end,
    curvature = 0.2,
    numPoints = 100
  ) => {
    const [x1, y1] = start;
    const [x2, y2] = end;
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) return [start, end];
    const px = -dy / length;
    const py = dx / length;
    const controlX = midX + curvature * length * px;
    const controlY = midY + curvature * length * py;
    const coordinates = [];
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const x = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * controlX + t ** 2 * x2;
      const y = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * controlY + t ** 2 * y2;
      coordinates.push([x, y]);
    }
    return coordinates;
  };

  const clearRoute = () => {
    if (vectorLayer) {
      vectorLayer.getSource().clear();
    }
    setDistance(null);
    stopAnimation();
  };

  const drawLine = useCallback(() => {
    if (startLat && startLon && endLat && endLon) {
      const startLatNum = parseFloat(startLat);
      const startLonNum = parseFloat(startLon);
      const endLatNum = parseFloat(endLat);
      const endLonNum = parseFloat(endLon);
      const curvatureNum = parseFloat(curvature);

      if (
        !isNaN(startLatNum) &&
        !isNaN(startLonNum) &&
        !isNaN(endLatNum) &&
        !isNaN(endLonNum) &&
        !isNaN(curvatureNum)
      ) {
        const startCoords = latLonToCoords(startLatNum, startLonNum);
        const endCoords = latLonToCoords(endLatNum, endLonNum);
        const curvedCoordinates = getCurvedLineCoordinates(
          startCoords,
          endCoords,
          curvatureNum,
          100
        );
        setAnimationPath(curvedCoordinates);
        stopAnimation();
        const line = new LineString(curvedCoordinates);
        const lineFeature = new Feature({ geometry: line });

        const markerStyle = new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({ color: "blue" }),
            stroke: new Stroke({ color: "white", width: 2 }),
          }),
        });

        const startMarker = new Feature({
          geometry: new Point(startCoords),
        });
        startMarker.setStyle(markerStyle);
        const endMarker = new Feature({
          geometry: new Point(endCoords),
        });
        endMarker.setStyle(markerStyle);

        vectorLayer.getSource().clear();
        vectorLayer
          .getSource()
          .addFeatures([lineFeature, startMarker, endMarker]);

        const routeDistance = calculateDistance(
          startLatNum,
          startLonNum,
          endLatNum,
          endLonNum
        );
        setDistance(routeDistance.toFixed(2));
        if (map) {
          map.getView().fit(line.getExtent(), {
            duration: 1000,
            padding: [50, 50, 50, 50],
          });
        }
      }
    }
  }, [startLat, startLon, endLat, endLon, curvature, map, vectorLayer]);

  const animate = (timestamp) => {
    if (!animationStartTimeRef.current) {
      animationStartTimeRef.current = timestamp - pausedTimeRef.current;
    }
    const elapsed = timestamp - animationStartTimeRef.current;
    const fraction = Math.min((elapsed * speed) / baseAnimationDuration, 1);
    const index = Math.floor(fraction * (animationPath.length - 1));
    const newPos = animationPath[index];

    if (animationFeatureRef.current) {
      animationFeatureRef.current.setGeometry(new Point(newPos));

      if (index < animationPath.length - 1) {
        const nextPos = animationPath[index + 1];
        const dx = nextPos[0] - newPos[0];
        const dy = nextPos[1] - newPos[1];
        const angle = Math.atan2(dy, dx);

        const dynamicStyle = new Style({
          image: new Icon({
            src: iconSrc,
            scale: 0.09,
            rotateWithView: true,
            rotation: angle,
          }),
        });
        animationFeatureRef.current.setStyle(dynamicStyle);
      }
    }

    if (fraction < 1 && animationPlayingRef.current) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      animationPlayingRef.current = false;
      pausedTimeRef.current = 0;
      animationFrameRef.current = null;
      setIsPlaying(false);
    }
  };

  const playAnimation = () => {
    if (!animationPath.length) return;

    if (!animationFeatureRef.current) {
      const feature = new Feature({
        geometry: new Point(animationPath[0]),
      });

      const initStyle = new Style({
        image: new Icon({
          src: iconSrc,
          scale: 0.09,
          rotateWithView: false,
          rotation: 0,
        }),
      });
      feature.setStyle(initStyle);
      vectorLayer.getSource().addFeature(feature);
      animationFeatureRef.current = feature;
    }

    if (!animationPlayingRef.current) {
      animationPlayingRef.current = true;
      setIsPlaying(true);
      animationStartTimeRef.current = null;
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  };

  const pauseAnimation = () => {
    if (animationPlayingRef.current) {
      animationPlayingRef.current = false;
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (animationStartTimeRef.current) {
        pausedTimeRef.current =
          performance.now() - animationStartTimeRef.current;
      }
    }
  };

  const stopAnimation = () => {
    animationPlayingRef.current = false;
    setIsPlaying(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    pausedTimeRef.current = 0;
    animationStartTimeRef.current = null;

    if (animationFeatureRef.current) {
      vectorLayer.getSource().removeFeature(animationFeatureRef.current);
      animationFeatureRef.current = null;
    }
  };

  const resetInputs = () => {
    setStartLat("");
    setStartLon("");
    setEndLat("");
    setEndLon("");
    setCurvature("-0.2");
    setDistance(null);
    setFromLocation("");
    setToLocation("");
    stopAnimation();
    vectorLayer.getSource().clear();
  };

  const handleLocationSelect = (selectedLocation, type) => {
    const { lat, lon } = selectedLocation;
    if (type === "from") {
      setStartLat(lat);
      setStartLon(lon);
    } else if (type === "to") {
      setEndLat(lat);
      setEndLon(lon);
    }
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
  };

  useEffect(() => {
    if (startLat && endLat) {
      drawLine();
    }
  }, [startLat, endLat, drawLine]);

  const locations = [
    { name: "New York", lat: "40.712776", lon: "-74.005974" },
    { name: "Los Angeles", lat: "34.052235", lon: "-118.243683" },
    { name: "London", lat: "51.5074", lon: "-0.1278" },
    { name: "Paris", lat: "48.8566", lon: "2.3522" },
    { name: "Tokyo", lat: "35.6895", lon: "139.6917" },
    { name: "San Francisco", lat: "37.7749", lon: "-122.4194" },
  ];

  useEffect(() => {
    const vectorSrc = new VectorSource();
    const routeLayer = new VectorLayer({ source: vectorSrc });
    setVectorLayer(routeLayer);

    const emitterSrc = new VectorSource();
    const eLayer = new VectorLayer({ source: emitterSrc });
    emitterLayerRef.current = eLayer;

    const mapInstance = new Map({
      target: mapElement.current,
      layers: [new TileLayer({ source: new OSM() }), routeLayer, eLayer],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });
    setMap(mapInstance);

    const container = document.createElement("div");
    container.className = "popup";
    container.style.backgroundColor = "white";
    container.style.padding = "8px";
    container.style.border = "1px solid black";
    container.style.borderRadius = "4px";

    const overlay = new Overlay({
      element: container,
      autoPan: true,
      autoPanAnimation: { duration: 250 },
    });
    overlayRef.current = overlay;
    mapInstance.addOverlay(overlay);

    mapInstance.on("singleclick", function (event) {
      const coordinate = event.coordinate;
      overlay.setPosition(coordinate);
      container.innerHTML = `
      <div>
        <p style="margin:0 0 8px 0;">Select emitter type:</p>
        <button id="friendly-btn"
            style="background-color: green; color: white; margin-right:4px; padding: 8px 12px; border: none; border-radius: 4px;">
            Friendly Emitter
        </button>
        <button id="enemy-btn"
            style="background-color: red; color: white; padding: 8px 12px; border: none; border-radius: 4px;">
                Enemy Emitter
        </button>
      </div>`;

      setTimeout(() => {
        const friendlyBtn = document.getElementById("friendly-btn");
        const enemyBtn = document.getElementById("enemy-btn");
        if (friendlyBtn) {
          friendlyBtn.onclick = () => {
            addEmitterMarker(coordinate, "friendly");
            setSelectedEmitters((prevEmitters) => [
              ...prevEmitters,
              { lat: coordinate[1], lon: coordinate[0], type: "friendly" },
            ]);
            overlay.setPosition(undefined);
          };
        }
        if (enemyBtn) {
          enemyBtn.onclick = () => {
            addEmitterMarker(coordinate, "enemy");
            setSelectedEmitters((prevEmitters) => [
              ...prevEmitters,
              { lat: coordinate[1], lon: coordinate[0], type: "enemy" },
            ]);
            overlay.setPosition(undefined);
          };
        }
      }, 0);
    });

    const handleEscKeyPress = (event) => {
      if (event.key === "Escape") {
        overlay.setPosition(undefined);
      }
    };

    document.addEventListener("keydown", handleEscKeyPress);

    return () => {
      document.removeEventListener("keydown", handleEscKeyPress);
      mapInstance.setTarget(null);
    };
  }, [addEmitterMarker]);

  return (
    <div className="flex h-screen">
      <RouteForm
        startLat={startLat}
        startLon={startLon}
        endLat={endLat}
        endLon={endLon}
        curvature={curvature}
        setStartLat={setStartLat}
        setStartLon={setStartLon}
        setEndLat={setEndLat}
        setEndLon={setEndLon}
        setCurvature={setCurvature}
        drawLine={drawLine}
        playAnimation={playAnimation}
        pauseAnimation={pauseAnimation}
        stopAnimation={stopAnimation}
        isPlaying={isPlaying}
        clearRoute={clearRoute}
        distance={distance}
        resetInputs={resetInputs}
        locations={locations}
        handleLocationSelect={handleLocationSelect}
        handleSpeedChange={handleSpeedChange}
        fromLocation={fromLocation}
        setFromLocation={setFromLocation}
        toLocation={toLocation}
        setToLocation={setToLocation}
      />
      <div ref={mapElement} className="flex-1 h-screen bg-[#f0f0f0]"></div>

      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          padding: "10px",
          borderRadius: "5px",
          fontSize: "14px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          maxHeight: "300px",
          overflowY: "auto",
          width: "200px",
        }}
      >
        <p>
          <strong>Selected Emitters:</strong>
        </p>
        <div>
          {selectedEmitters.map((emitter, index) => (
            <div
              key={index}
              style={{
                backgroundColor:
                  emitter.type === "friendly"
                    ? "rgba(0, 255, 0, 0.3)"
                    : "rgba(255, 0, 0, 0.3)",
                margin: "5px 0",
                padding: "5px",
                borderRadius: "5px",
              }}
            >
              <p>Lat: {emitter.lat}</p>
              <p>Lon: {emitter.lon}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={drawLine}
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Draw_line_tool_icon.svg/1200px-Draw_line_tool_icon.svg.png"
          alt="Draw Line Icon"
          style={{ width: "30px", height: "30px" }}
        />
      </div>
    </div>
  );
};

export default MapComponent;
