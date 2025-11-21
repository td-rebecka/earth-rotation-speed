import { useState, useMemo } from "react";
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
  const [latClicked, setLatClicked] = useState<number | null>(null);

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

    for (let lon = -180; lon <= 180; lon += 2) pts.push([lon, latClicked]);

    return new LineLayer({
      id: "clicked-lat",
      data: pts,
      getSourcePosition: (d) => d,
      getTargetPosition: (_: number[], { index }: { index: number }) =>
        (index < pts.length - 1 ? pts[index + 1] : pts[index]) as [
          number,
          number
        ],
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

  return (
    <>
      <DeckGL
        views={new GlobeView()}
        initialViewState={{ longitude: 0, latitude: 20, zoom: 0 }}
        controller={true}
        effects={[lightingEffect]}
        layers={[...earth, ...bands, particles, clickedLayer]}
        onClick={(info) => {
          if (info.coordinate) {
            setLatClicked(info.coordinate[1] as number);
          }
        }}
      />

      {latClicked !== null && currentSpeed !== null && (
        <div
          style={{
            position: "absolute",
            right: 20,
            top: 20,
            width: 280,
            background: "rgba(0,0,0,0.75)",
            color: "white",
            padding: "18px 20px",
            borderRadius: 12,
            fontSize: 15,
            backdropFilter: "blur(6px)",
            boxShadow: "0 0 20px rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 600 }}>
            🌍 Jordens rotation
          </div>

          <div style={{ opacity: 0.8 }}>
            Latitud: <b>{latClicked.toFixed(2)}°</b>
          </div>

          <div style={{ fontSize: 26, fontWeight: 700, color: "#4dd0ff" }}>
            {currentSpeed.toFixed(1)} m/s
          </div>

          <div style={{ marginTop: 6, fontSize: 17 }}>🧼 Tvättmaskin</div>

          <div style={{ fontSize: 24, fontWeight: 700, color: "#ffc34d" }}>
            {washerSpeed.toFixed(1)} m/s
          </div>

          <div
            style={{
              marginTop: 10,
              padding: "10px 12px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: 8,
              fontSize: 16,
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            Jorden är {(currentSpeed / washerSpeed).toFixed(1)}× snabbare
          </div>
        </div>
      )}
    </>
  );
}
