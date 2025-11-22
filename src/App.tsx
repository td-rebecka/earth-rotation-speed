import { useState, useMemo, useEffect } from "react";
import DeckGL from "@deck.gl/react";
import {
  COORDINATE_SYSTEM,
  _GlobeView as GlobeView,
  LightingEffect,
  AmbientLight,
  _SunLight as SunLight,
  type Color,
} from "@deck.gl/core";

import { GeoJsonLayer, LineLayer } from "@deck.gl/layers";
import { SimpleMeshLayer } from "@deck.gl/mesh-layers";
import { SphereGeometry } from "@luma.gl/engine";

const EARTH_RADIUS = 6371000;

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 0.6,
});
const sunLight = new SunLight({
  color: [255, 255, 255],
  intensity: 2.0,
  timestamp: Date.now(),
});
const lightingEffect = new LightingEffect({ ambientLight, sunLight });

export default function App() {
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 0,
  });

  const [rotationSpeed, setRotationSpeed] = useState(0);
  const [latClicked, setLatClicked] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const bands = useMemo(() => {
    const layers: LineLayer<any>[] = [];
    for (let lat = -80; lat <= 80; lat += 5) {
      const v = 465 * Math.cos((lat * Math.PI) / 180);
      const color: Color = [Math.min(255, v), 40, 180 - Math.floor(v / 2)];
      const pts: number[][] = [];
      for (let lon = -180; lon <= 180; lon += 5) pts.push([lon, lat]);

      layers.push(
        new LineLayer({
          id: `band-${lat}`,
          data: pts,
          getSourcePosition: (d: number[]) => d as [number, number],
          getTargetPosition: (_: number[], { index }: { index: number }) =>
            (index < pts.length - 1 ? pts[index + 1] : pts[index]) as [
              number,
              number
            ],

          getColor: () => color,
          getWidth: () => 2,
        })
      );
    }
    return layers;
  }, []);

  const particles = useMemo(() => {
    const arr: { source: number[]; target: number[]; v: number }[] = [];

    for (let lat = -80; lat <= 80; lat += 10) {
      for (let lon = -180; lon <= 180; lon += 10) {
        const v = 465 * Math.cos((lat * Math.PI) / 180);
        const lon2 = lon + v / 150;
        arr.push({ source: [lon, lat], target: [lon2, lat], v });
      }
    }

    return new LineLayer({
      id: "particles",
      data: arr,
      getSourcePosition: (d: any) => d.source,
      getTargetPosition: (d: any) => d.target,
      getColor: (d: any): Color => [d.v, 40, 255 - d.v],
      getWidth: () => 1,
    });
  }, []);

  const clickedLayer = useMemo(() => {
    if (latClicked === null) return null;

    const pts: number[][] = [];
    for (let lon = -180; lon <= 180; lon += 1) pts.push([lon, latClicked]);

    return new LineLayer({
      id: "clicked-lat",
      data: pts,
      getSourcePosition: (d) => d,
      getTargetPosition: (_: number[], { index }: { index: number }) =>
        (index < pts.length - 1 ? pts[index + 1] : pts[index]) as [
          number,
          number
        ],
      getColor: () => [255, 220, 0], // GUL markering
      getWidth: () => 4, // Tydligare
      pickable: false, // Inget klick här
    });
  }, [latClicked]);

  const earth = useMemo(
    () => [
      new SimpleMeshLayer({
        id: "earth-sphere",
        data: [0],
        mesh: new SphereGeometry({ radius: EARTH_RADIUS, nlat: 18, nlong: 36 }),
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        getPosition: () => [0, 0, 0],
        getColor: () => [255, 255, 255],
      }),
      new GeoJsonLayer({
        id: "land",
        data: "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_land.geojson",
        stroked: false,
        filled: true,
        opacity: 0.15,
        getFillColor: () => [20, 80, 120],
      }),
    ],
    []
  );

  const washerSpeed = 2 * Math.PI * 0.125 * (1400 / 60);
  const currentSpeed =
    latClicked !== null ? 465 * Math.cos((latClicked * Math.PI) / 180) : null;

  useEffect(() => {
    let frame: number;

    const animate = () => {
      setViewState((vs) => ({
        ...vs,
        longitude: vs.longitude + rotationSpeed,
      }));
      frame = requestAnimationFrame(animate);
    };

    if (rotationSpeed !== 0) {
      frame = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(frame);
  }, [rotationSpeed]);

  return (
    <>
      {showHint && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "20px",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.65)",
            color: "white",
            padding: "10px 16px",
            borderRadius: 8,
            fontSize: 14,
            textAlign: "center",
            zIndex: 200,
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            maxWidth: "80%",
          }}
        >
          Tryck på en latitud-linje
        </div>
      )}

      <DeckGL
        views={new GlobeView()}
        controller={true}
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs)}
        effects={[lightingEffect]}
        layers={[...earth, ...bands, particles, clickedLayer]}
        onClick={(info) => {
          if (info.coordinate) {
            setShowHint(false);

            const lat = info.coordinate[1] as number;
            setLatClicked(lat);

            const v = 465 * Math.cos((lat * Math.PI) / 180);
            const speed = (v / 465) * 1;
            setRotationSpeed(speed);
          }
        }}
      />

      {/* Knapp som alltid finns */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: "absolute",
          right: 12,
          top: 12,
          zIndex: 200,
          padding: "6px 10px",
          borderRadius: 6,
          background: "rgba(0,0,0,0.6)",
          color: "white",
          border: "1px solid rgba(255,255,255,0.2)",
          fontSize: 12,
          backdropFilter: "blur(3px)",
        }}
      >
        {collapsed ? "Visa info" : "Dölj"}
      </button>

      {/* Själva infoboxen */}
      {!collapsed && latClicked !== null && currentSpeed !== null && (
        <div
          style={{
            position: "absolute",
            right: 12,
            top: 12,
            width: 200,
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "12px 14px",
            borderRadius: 10,
            fontSize: 13,
            lineHeight: 1.3,
            backdropFilter: "blur(4px)",
            boxShadow: "0 0 12px rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600 }}>
            🌍 Jordens rotation
          </div>

          <div style={{ opacity: 0.8 }}>
            Latitud: <b>{latClicked.toFixed(2)}°</b>
          </div>

          <div style={{ fontSize: 20, fontWeight: 700, color: "#4dd0ff" }}>
            {currentSpeed.toFixed(1)} m/s
          </div>

          <div style={{ marginTop: 6, fontSize: 17 }}>🧼 Tvättmaskin</div>

          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#ffc34d",
              marginTop: 2,
            }}
          >
            {washerSpeed.toFixed(1)} m/s
          </div>

          <div
            style={{
              marginTop: 6,
              padding: "8px 10px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: 6,
              fontSize: 14,
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            {(currentSpeed / washerSpeed).toFixed(1)}× snabbare
          </div>
        </div>
      )}
    </>
  );
}
