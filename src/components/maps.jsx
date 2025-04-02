import React, { useState, useEffect, useRef, useCallback } from "react";
import Map from "ol/Map.js";
import View from "ol/View.js";
import TileLayer from "ol/layer/Tile.js";
import OSM from "ol/source/OSM.js";
import { Circle, LineString, Point } from "ol/geom";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Feature } from "ol";
import { Style, Circle as CircleStyle, Fill, Stroke, Icon } from "ol/style";
import Overlay from "ol/Overlay.js";
import "ol/ol.css";
import { toLonLat, fromLonLat } from "ol/proj";
import { Modify } from "ol/interaction";
import RouteForm from "../forms/RouteForm";
import Select from "react-select";

const options = [
  {
    value: 1,
    icon: "https://img.freepik.com/premium-vector/plane-top-view-aircraft-flight-airport-vehicle-isolated-white-background_80590-19966.jpg?w=740",
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
    icon: "https://static.vecteezy.com/system/resources/previews/015/242/306/non_2x/aircraft-or-airplane-on-top-view-png.png",
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
    icon: "https://www.clipartbest.com/cliparts/4c9/6bg/4c96bg5yi.png",
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

const MapComponent = () => {
  const [startLat, setStartLat] = useState("");
  const [startLon, setStartLon] = useState("");
  const [endLat, setEndLat] = useState("");
  const [endLon, setEndLon] = useState("");
  const [curvature, setCurvature] = useState("-0.2");
  const [distance, setDistance] = useState(null);
  const [speed, setSpeed] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationPath, setAnimationPath] = useState([]);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [selectedEmitters, setSelectedEmitters] = useState([]);
  const [manualEmitters, setManualEmitters] = useState([]);
  const [flightPath, setFlightPath] = useState([]);
  const [vectorLayer, setVectorLayer] = useState(null);
  const [map, setMap] = useState(null);
  const [selectedIcon, setSelectedIcon] = useState(options[0].icon);

  const mapElement = useRef(null);
  const emitterLayerRef = useRef(null);
  const overlayRef = useRef(null);

  // Curved line animation refs and constants
  const animationFeatureRef = useRef(null);
  const animationFrameRef = useRef(null);
  const animationStartTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);
  const animationPlayingRef = useRef(false);
  const baseAnimationDuration = 50000;
  const iconSrc =
    "https://png.pngtree.com/png-vector/20230530/ourmid/pngtree-airplane-icon-vector-png-image_7114175.png";

  // Flight (single-click) animation refs
  const flightAnimationFrame = useRef(null);
  const flightAnimationStartTime = useRef(null);
  const flightPausedTime = useRef(0);
  const isFlightAnimationPlaying = useRef(false);
  const animationFeatureFlight = useRef(null);

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
    const markerType = type === "enemy" ? "enemy" : "friendly";
    const marker = new Feature({
      geometry: new Point(coordinate),
    });
    marker.set("type", markerType);
    marker.setStyle(getEmitterStyle(markerType));
    emitterLayerRef.current.getSource().addFeature(marker);
  }, []);

  const generateRandomCoordinates = () => {
    const randomLat = (Math.random() * 180 - 90).toFixed(6);
    const randomLon = (Math.random() * 360 - 180).toFixed(6);
    return [parseFloat(randomLon), parseFloat(randomLat)];
  };

  const addEmitterMarkerRandom = useCallback((type) => {
    if (!emitterLayerRef.current) return;
    const randomCoordinates = generateRandomCoordinates();
    const markerType = type === "enemy" ? "enemy" : "friendly";
    const marker = new Feature({
      geometry: new Point(randomCoordinates),
    });
    marker.set("type", markerType);
    marker.setStyle(getEmitterStyle(markerType));
    emitterLayerRef.current.getSource().addFeature(marker);
    setManualEmitters((prevEmitters) => [
      ...prevEmitters,
      { lat: randomCoordinates[1], lon: randomCoordinates[0], type },
    ]);
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

  // ----------------- Curved Line Animation -----------------
  const stopAnimation = useCallback(() => {
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
  }, [vectorLayer]);

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

        const startMarker = new Feature({ geometry: new Point(startCoords) });
        startMarker.setStyle(markerStyle);
        const endMarker = new Feature({ geometry: new Point(endCoords) });
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
  }, [
    startLat,
    startLon,
    endLat,
    endLon,
    curvature,
    vectorLayer,
    stopAnimation,
    map,
  ]);

  const calculateAngle = (point1, point2) => {
    const dx = point2[1] - point1[1];
    const dy = point2[0] - point1[0];
    return Math.atan2(dy, dx);
  };

  const animate = (timestamp) => {
    if (!animationStartTimeRef.current) {
      animationStartTimeRef.current = timestamp - pausedTimeRef.current;
    }
    const elapsed = timestamp - animationStartTimeRef.current;
    const fraction = Math.min((elapsed * speed) / baseAnimationDuration, 1);
    const index = Math.floor(fraction * (animationPath.length - 1));
    const t = fraction * (animationPath.length - 1) - index;
    const startPoint = animationPath[index];
    const endPoint = animationPath[index + 1];

    const interpolatedX = startPoint[0] + t * (endPoint[0] - startPoint[0]);
    const interpolatedY = startPoint[1] + t * (endPoint[1] - startPoint[1]);
    const newPos = [interpolatedX, interpolatedY];

    if (animationFeatureRef.current) {
      animationFeatureRef.current.setGeometry(new Point(newPos));

      if (index < animationPath.length - 1) {
        const nextPos = animationPath[index + 1];
        const angle = calculateAngle(newPos, nextPos);
        const dynamicStyle = [
          new Style({
            image: new CircleStyle({
              radius: 35,
              stroke: new Stroke({ color: "#00ff00", width: 2 }),
              fill: new Fill({ color: "rgba(0, 255, 0, 0.5)" }),
            }),
          }),
          new Style({
            image: new Icon({
              src: iconSrc,
              scale: 0.09,
              rotateWithView: true,
              rotation: angle,
            }),
          }),
        ];
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

    const flightSource = new VectorSource();
    const flightLayer = new VectorLayer({ source: flightSource });

    const emitterSrc = new VectorSource();
    const emitterLayer = new VectorLayer({ source: emitterSrc });
    emitterLayerRef.current = emitterLayer;

    const mapInstance = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        routeLayer,
        flightLayer,
        emitterLayer,
      ],
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

    let selectedPoints = [];
    let longPressTimeout = null;
    let isDrawing = true;
    let isLongPress = false;

    mapInstance.on("singleclick", function (event) {
      if (!isDrawing || isLongPress) return;
      const coordinate = event.coordinate;
      selectedPoints.push(coordinate);
      if (selectedPoints.length > 1) {
        const line = new LineString(selectedPoints);
        const lineFeature = new Feature({ geometry: line });
        flightSource.clear();
        flightSource.addFeature(lineFeature);
        const updatedPath = selectedPoints.map((point) => {
          const [lon, lat] = toLonLat(point);
          return { lat, lon };
        });
        setFlightPath(updatedPath);
        console.log("Updated Flight Path:", updatedPath);
      }
    });

    mapInstance.on("pointerdown", function (event) {
      isLongPress = false;
      longPressTimeout = setTimeout(() => {
        isLongPress = true;
        const coordinate = event.coordinate;
        const [lon, lat] = toLonLat(coordinate);
        overlay.setPosition(coordinate);
        container.innerHTML =
          "<div>" +
          '<p style="margin:0 0 8px 0;">Select emitter type:</p>' +
          '<button id="friendly-btn" style="background-color: green; color: white; margin-right:4px; padding: 8px 12px; border: none; border-radius: 4px;">Friendly Emitter</button>' +
          '<button id="enemy-btn" style="background-color: red; color: white; padding: 8px 12px; border: none; border-radius: 4px;">Enemy Emitter</button>' +
          "</div>";
        setTimeout(() => {
          document.getElementById("friendly-btn").onclick = () => {
            addEmitterMarker(coordinate, "friendly");
            setSelectedEmitters((prev) => [
              ...prev,
              { lat, lon, type: "friendly" },
            ]);
            overlay.setPosition(undefined);
          };
          document.getElementById("enemy-btn").onclick = () => {
            addEmitterMarker(coordinate, "enemy");
            setSelectedEmitters((prev) => [
              ...prev,
              { lat, lon, type: "enemy" },
            ]);
            overlay.setPosition(undefined);
          };
        }, 0);
      }, 1000);
    });

    mapInstance.on("pointerup", function () {
      clearTimeout(longPressTimeout);
    });

    mapInstance.on("pointermove", function () {
      clearTimeout(longPressTimeout);
    });

    const modifyInteraction = new Modify({ source: emitterSrc });
    mapInstance.addInteraction(modifyInteraction);
    modifyInteraction.on("modifyend", () => {
      const updatedEmitters = emitterLayerRef.current
        .getSource()
        .getFeatures()
        .map((feature) => {
          const newCoords = toLonLat(feature.getGeometry().getCoordinates());
          const type = feature.get("type") || "friendly";
          return {
            lat: newCoords[1],
            lon: newCoords[0],
            type: type === "enemy" ? "enemy" : "friendly",
          };
        });
      setSelectedEmitters(updatedEmitters);
    });

    const handleKeyPress = (event) => {
      if (event.key === "Escape") {
        overlay.setPosition(undefined);
      } else if (event.key === "Enter") {
        isDrawing = false;
        alert("Flight Path finalized!");
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      mapInstance.removeInteraction(modifyInteraction);
      mapInstance.setTarget(null);
    };
  }, [addEmitterMarker]);

  // ----------------- Flight Animation (Single-Click) Functions -----------------

  const animateFlightPath = (timestamp, flightCoordinates) => {
    if (!flightAnimationStartTime.current) {
      flightAnimationStartTime.current = timestamp - flightPausedTime.current;
    }
    const elapsed = timestamp - flightAnimationStartTime.current;
    const totalDuration = 10000;
    const totalSegments = flightCoordinates.length - 1;
    const segmentDuration = totalDuration / totalSegments;
    let currentSegmentIndex = Math.floor(elapsed / segmentDuration);
    if (currentSegmentIndex >= totalSegments) {
      if (animationFeatureFlight.current) {
        animationFeatureFlight.current.setGeometry(
          new Point(flightCoordinates[flightCoordinates.length - 1])
        );
      }
      cancelAnimationFrame(flightAnimationFrame.current);
      flightAnimationFrame.current = null;
      isFlightAnimationPlaying.current = false;
      setIsPlaying(false);
      return;
    }

    const segmentElapsed = elapsed - currentSegmentIndex * segmentDuration;
    const fraction = segmentElapsed / segmentDuration;
    const startCoord = flightCoordinates[currentSegmentIndex];
    const endCoord = flightCoordinates[currentSegmentIndex + 1];
    const interpolatedX =
      startCoord[0] + fraction * (endCoord[0] - startCoord[0]);
    const interpolatedY =
      startCoord[1] + fraction * (endCoord[1] - startCoord[1]);
    const newCoord = [interpolatedX, interpolatedY];

    if (animationFeatureFlight.current) {
      animationFeatureFlight.current.setGeometry(new Point(newCoord));

      const angle = calculateAngle(newCoord, endCoord);

      animationFeatureFlight.current.setStyle(
        new Style({
          image: new Icon({
            src: selectedIcon,
            scale: 0.09,
            rotateWithView: true,
            rotation: angle,
          }),
          zIndex: 10,
        })
      );
    }

    flightAnimationFrame.current = requestAnimationFrame((newTimestamp) =>
      animateFlightPath(newTimestamp, flightCoordinates)
    );
  };

  // const animateFlightPath = (timestamp, flightCoordinates) => {
  //   if (!flightAnimationStartTime.current) {
  //     flightAnimationStartTime.current = timestamp - flightPausedTime.current;
  //   }
  //   const elapsed = timestamp - flightAnimationStartTime.current;
  //   const totalDuration = 10000;
  //   const totalSegments = flightCoordinates.length - 1;
  //   const segmentDuration = totalDuration / totalSegments;
  //   let currentSegmentIndex = Math.floor(elapsed / segmentDuration);
  //   if (currentSegmentIndex >= totalSegments) {
  //     if (animationFeatureFlight.current) {
  //       animationFeatureFlight.current.setGeometry(
  //         new Point(flightCoordinates[flightCoordinates.length - 1])
  //       );
  //     }
  //     cancelAnimationFrame(flightAnimationFrame.current);
  //     flightAnimationFrame.current = null;
  //     isFlightAnimationPlaying.current = false;
  //     setIsPlaying(false);
  //     return;
  //   }

  //   const segmentElapsed = elapsed - currentSegmentIndex * segmentDuration;
  //   const fraction = segmentElapsed / segmentDuration;
  //   const startCoord = flightCoordinates[currentSegmentIndex];
  //   const endCoord = flightCoordinates[currentSegmentIndex + 1];
  //   const interpolatedX =
  //     startCoord[0] + fraction * (endCoord[0] - startCoord[0]);
  //   const interpolatedY =
  //     startCoord[1] + fraction * (endCoord[1] - startCoord[1]);
  //   const newCoord = [interpolatedX, interpolatedY];

  //   if (animationFeatureFlight.current) {
  //     animationFeatureFlight.current.setGeometry(new Point(newCoord));

  //     const angle = calculateAngle(newCoord, endCoord);

  //     animationFeatureFlight.current.setStyle(
  //       new Style({
  //         image: new Icon({
  //           src: selectedIcon,
  //           scale: 0.09,
  //           rotateWithView: true,
  //           rotation: angle,
  //         }),
  //       })
  //     );
  //   }
  //   flightAnimationFrame.current = requestAnimationFrame((newTimestamp) =>
  //     animateFlightPath(newTimestamp, flightCoordinates)
  //   );
  // };

  const playFlightAnimation = () => {
    if (flightPath.length < 2) {
      console.warn("Need at least two points for flight animation");
      return;
    }
    if (!vectorLayer) {
      console.warn("Vector layer is not ready");
      return;
    }
    console.log("Flight path state:", flightPath);
    const flightCoordinates = flightPath.map((point) =>
      fromLonLat([parseFloat(point.lon), parseFloat(point.lat)])
    );
    console.log("Converted flight coordinates:", flightCoordinates);

    // if (!animationFeatureFlight.current) {
    //   const feature = new Feature({
    //     geometry: new Point(flightCoordinates[0]),
    //   });

    //   feature.setStyle(
    //     new Style({
    //       image: new Icon({
    //         src: selectedIcon,
    //         scale: 0.09,
    //         rotateWithView: false,
    //       }),
    //     })
    //   );
    //   vectorLayer.getSource().addFeature(feature);
    //   animationFeatureFlight.current = feature;
    // }

    if (!animationFeatureFlight.current) {
      const feature = new Feature({
        geometry: new Point(flightCoordinates[0]),
      });

      feature.setStyle(
        new Style({
          image: new Icon({
            src: selectedIcon,
            scale: 0.09,
            rotateWithView: true,
            rotation: 0, // Initial rotation can be 0
          }),
          zIndex: 10, // Ensures the icon is rendered above the line
        })
      );
      vectorLayer.getSource().addFeature(feature);
      animationFeatureFlight.current = feature;
    }

    if (!isFlightAnimationPlaying.current) {
      isFlightAnimationPlaying.current = true;
      flightAnimationStartTime.current = null;
      flightAnimationFrame.current = requestAnimationFrame((timestamp) =>
        animateFlightPath(timestamp, flightCoordinates)
      );
      setIsPlaying(true);
    }
  };

  const pauseFlightAnimation = () => {
    if (isFlightAnimationPlaying.current) {
      isFlightAnimationPlaying.current = false;
      if (flightAnimationFrame.current) {
        cancelAnimationFrame(flightAnimationFrame.current);
        flightAnimationFrame.current = null;
      }
      if (flightAnimationStartTime.current) {
        flightPausedTime.current =
          performance.now() - flightAnimationStartTime.current;
      }
      setIsPlaying(false);
    }
  };

  const stopFlightAnimation = () => {
    if (flightAnimationFrame.current) {
      cancelAnimationFrame(flightAnimationFrame.current);
      flightAnimationFrame.current = null;
    }
    isFlightAnimationPlaying.current = false;
    flightAnimationStartTime.current = null;
    flightPausedTime.current = 0;
    setIsPlaying(false);
    if (animationFeatureFlight.current) {
      vectorLayer.getSource().removeFeature(animationFeatureFlight.current);
      animationFeatureFlight.current = null;
    }
  };

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
        selectedEmitters={selectedEmitters}
        addEmitterMarkerRandom={addEmitterMarkerRandom}
        manualEmitters={manualEmitters}
        flightPath={flightPath}
        playFlightAnimation={playFlightAnimation}
        pauseFlightAnimation={pauseFlightAnimation}
        stopFlightAnimation={stopFlightAnimation}
      />
      <div
        ref={mapElement}
        className="flex-1 !h-[100%] !w-[100%] bg-[#f0f0f0] border-5"
      ></div>
      <div
        className="scrollbar-hide"
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
        <p className="flex flex-row items-center justify-center">
          <strong>Selected Emitters: {selectedEmitters.length}</strong>
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
              <p className="bg-pink-50">Marker No: {index + 1}</p>
              <p>Type: {emitter.type}</p>
              <p>Lat: {emitter.lat}</p>
              <p>Lon: {emitter.lon}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="scrollbar-hide"
        style={{
          position: "absolute",
          top: "10px",
          right: "20px",
          backgroundColor: "transparent",
          padding: "10px",
          borderRadius: "5px",
          fontSize: "14px",
          width: "250px",
        }}
      >
        <label className="block text-sm font-medium mb-2">Flight Type: </label>
        <Select
          options={options}
          defaultValue={options[0]}
          onChange={(selectedOption) => setSelectedIcon(selectedOption.icon)}
          styles={{
            option: (provided) => ({
              ...provided,
              display: "flex",
              alignItems: "center",
              color: "black",
            }),
            menu: (provided) => ({
              ...provided,
              maxHeight: "auto",
            }),
          }}
        />
      </div>
    </div>
  );
};

export default MapComponent;
