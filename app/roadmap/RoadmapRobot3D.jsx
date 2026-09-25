'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import { useRef, useState, Suspense } from 'react'
import * as THREE from 'three'

// 6-Wheel Rocker-Bogie positions [x, y, z] matching NASA Mars Exploration Rover layout
// Rover coordinates: +X is right, +Y is up, +Z is forward
const WHEEL_DATA = [
  { id: 'FL', pos: [-0.94, -0.58, 0.70], isSteering: true },   // Front Left
  { id: 'ML', pos: [-0.92, -0.58, -0.04], isSteering: false }, // Middle Left
  { id: 'RL', pos: [-0.94, -0.58, -0.76], isSteering: true },  // Rear Left
  { id: 'FR', pos: [0.94, -0.58, 0.70], isSteering: true },    // Front Right
  { id: 'MR', pos: [0.92, -0.58, -0.04], isSteering: false },  // Middle Right
  { id: 'RR', pos: [0.94, -0.58, -0.76], isSteering: true },   // Rear Right
]

// Pre-computed static wheel coordinate arrays (zero runtime allocation)
const CLEAT_DATA = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2
  return {
    y: Math.sin(angle) * 0.265,
    z: Math.cos(angle) * 0.265,
    rot: angle,
  }
})

const SPOKE_DATA = Array.from({ length: 6 }, (_, i) => (i / 6) * Math.PI * 2)

/* ══════════════════════════════════════════════════════════════════
   SHARED GEOMETRIES (Allocated once at module scope — instant GPU load)
   ══════════════════════════════════════════════════════════════════ */
const GEO_WHEEL_DRUM = new THREE.CylinderGeometry(0.265, 0.265, 0.22, 22)
const GEO_RIM_OUTER = new THREE.CylinderGeometry(0.272, 0.272, 0.02, 22)
const GEO_RIM_INNER = new THREE.CylinderGeometry(0.272, 0.272, 0.02, 22)
const GEO_CLEAT = new THREE.BoxGeometry(0.21, 0.014, 0.032)
const GEO_HUB_DISC = new THREE.CylinderGeometry(0.13, 0.13, 0.18, 16)
const GEO_SPOKE = new THREE.BoxGeometry(0.012, 0.11, 0.022)
const GEO_HUB_CAP = new THREE.CylinderGeometry(0.062, 0.062, 0.024, 16)
const GEO_HUB_NUT = new THREE.CylinderGeometry(0.03, 0.03, 0.012, 6)
const GEO_KINGPIN = new THREE.CylinderGeometry(0.07, 0.075, 0.18, 14)
const GEO_KINGPIN_CAP = new THREE.CylinderGeometry(0.082, 0.082, 0.035, 14)
const GEO_KNUCKLE_BRACKET = new THREE.BoxGeometry(0.06, 0.14, 0.08)

// Suspension geometries
const GEO_PIVOT_JOINT = new THREE.CylinderGeometry(0.07, 0.07, 0.15, 14)
const GEO_FRONT_STRUT = new THREE.BoxGeometry(0.05, 0.08, 0.80)
const GEO_REAR_STRUT = new THREE.BoxGeometry(0.05, 0.075, 0.65)
const GEO_BOGIE_PIVOT = new THREE.CylinderGeometry(0.058, 0.058, 0.12, 14)
const GEO_BOGIE_BRIDGE = new THREE.BoxGeometry(0.048, 0.07, 0.76)
const GEO_TRANSVERSE_BAR = new THREE.CylinderGeometry(0.035, 0.035, 1.58, 14)

// Chassis geometries
const GEO_CHASSIS_HULL = new THREE.BoxGeometry(1.30, 0.36, 1.44)
const GEO_CHASSIS_BELLY = new THREE.BoxGeometry(1.05, 0.13, 1.24)
const GEO_NOSE_BAY = new THREE.BoxGeometry(0.80, 0.23, 0.12)
const GEO_NOSE_RIB = new THREE.BoxGeometry(0.038, 0.17, 0.025)
const GEO_HAZCAM_BARREL = new THREE.CylinderGeometry(0.04, 0.04, 0.055, 14)
const GEO_HAZCAM_LENS = new THREE.SphereGeometry(0.024, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.5)
const GEO_FOIL_SEAM = new THREE.BoxGeometry(0.018, 0.365, 1.445)
const GEO_REAR_BAY = new THREE.BoxGeometry(0.90, 0.25, 0.11)
const GEO_REAR_HAZCAM = new THREE.CylinderGeometry(0.032, 0.032, 0.038, 12)

// Solar array geometries
const GEO_SOLAR_DECK = new THREE.BoxGeometry(1.42, 0.03, 1.40)
const GEO_SOLAR_TILE_CENTER = new THREE.BoxGeometry(0.21, 0.005, 1.32)
const GEO_SOLAR_BUSBAR = new THREE.BoxGeometry(1.34, 0.003, 0.012)
const GEO_SOLAR_WING = new THREE.BoxGeometry(0.60, 0.026, 1.30)
const GEO_SOLAR_TILE_WING = new THREE.BoxGeometry(0.23, 0.005, 1.22)
const GEO_SOLAR_TRIM = new THREE.BoxGeometry(0.018, 0.032, 1.31)
const GEO_SOLAR_FLAP = new THREE.BoxGeometry(1.18, 0.024, 0.36)
const GEO_SOLAR_TILE_FLAP = new THREE.BoxGeometry(1.10, 0.005, 0.30)
const GEO_SUNDIAL_BASE = new THREE.CylinderGeometry(0.06, 0.06, 0.014, 16)
const GEO_SUNDIAL_PIN = new THREE.CylinderGeometry(0.007, 0.01, 0.07, 10)
const GEO_SUNDIAL_RING = new THREE.RingGeometry(0.025, 0.05, 16)

// Mast geometries
const GEO_MAST_BASE = new THREE.CylinderGeometry(0.10, 0.12, 0.08, 16)
const GEO_MAST_COLUMN = new THREE.CylinderGeometry(0.055, 0.062, 1.02, 16)
const GEO_MAST_COLLAR = new THREE.CylinderGeometry(0.068, 0.068, 0.07, 16)
const GEO_MAST_WIRING = new THREE.BoxGeometry(0.03, 0.10, 0.04)
const GEO_MOTOR_HOUSING = new THREE.CylinderGeometry(0.078, 0.070, 0.14, 16)
const GEO_MOTOR_TRANSVERSE = new THREE.CylinderGeometry(0.055, 0.055, 0.16, 14)
const GEO_CAMERA_BAR = new THREE.BoxGeometry(0.50, 0.11, 0.14)
const GEO_PANCAM_POD = new THREE.BoxGeometry(0.10, 0.12, 0.12)
const GEO_LENS_HOOD = new THREE.CylinderGeometry(0.040, 0.046, 0.08, 16)
const GEO_OPTICAL_LENS = new THREE.SphereGeometry(0.026, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.5)
const GEO_NAVCAM_BODY = new THREE.CylinderGeometry(0.020, 0.024, 0.05, 12)
const GEO_NAVCAM_LENS = new THREE.SphereGeometry(0.013, 12, 12)
const GEO_SUN_SIGHT = new THREE.CylinderGeometry(0.022, 0.026, 0.06, 12)

// Antenna geometries
const GEO_DISH_PEDESTAL = new THREE.CylinderGeometry(0.055, 0.070, 0.14, 14)
const GEO_DISH_ARM = new THREE.BoxGeometry(0.045, 0.16, 0.045)
const GEO_PARABOLIC_DISH = new THREE.SphereGeometry(0.24, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.44)
const GEO_DISH_RIM = new THREE.TorusGeometry(0.236, 0.012, 8, 24)
const GEO_FEED_HORN = new THREE.CylinderGeometry(0.014, 0.028, 0.16, 12)
const GEO_FEED_TIP = new THREE.SphereGeometry(0.030, 14, 14)
const GEO_LGA_BASE = new THREE.CylinderGeometry(0.04, 0.05, 0.10, 12)
const GEO_LGA_MAST = new THREE.CylinderGeometry(0.012, 0.018, 0.74, 10)
const GEO_LGA_TIP = new THREE.SphereGeometry(0.022, 10, 10)

// Arm geometries
const GEO_SHOULDER_A = new THREE.CylinderGeometry(0.07, 0.07, 0.12, 14)
const GEO_SHOULDER_B = new THREE.CylinderGeometry(0.05, 0.05, 0.13, 12)
const GEO_UPPER_ARM = new THREE.BoxGeometry(0.05, 0.06, 0.40)
const GEO_ELBOW = new THREE.CylinderGeometry(0.045, 0.045, 0.10, 12)
const GEO_FOREARM = new THREE.BoxGeometry(0.045, 0.05, 0.32)
const GEO_TURRET_HOUSING = new THREE.CylinderGeometry(0.068, 0.068, 0.10, 16)
const GEO_RAT_HEAD = new THREE.CylinderGeometry(0.034, 0.038, 0.07, 14)
const GEO_APXS = new THREE.CylinderGeometry(0.028, 0.028, 0.06, 12)
const GEO_MICROSCOPE = new THREE.CylinderGeometry(0.022, 0.026, 0.05, 10)

/* ══════════════════════════════════════════════════════════════════
   SHARED MATERIALS (Shared shader programs — instant GPU compilation)
   ══════════════════════════════════════════════════════════════════ */
const MAT_WHEEL_DRUM = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.88, roughness: 0.32 })
const MAT_ALUM_RIM = new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.96, roughness: 0.12 })
const MAT_SLATE_FLANGE = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.92, roughness: 0.22 })
const MAT_CLEAT = new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.92, roughness: 0.28 })
const MAT_HUB_DISC = new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.92, roughness: 0.25 })
const MAT_SPOKE = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.96, roughness: 0.14 })
const MAT_GOLD_HUB = new THREE.MeshStandardMaterial({ color: '#d97706', metalness: 0.94, roughness: 0.2 })
const MAT_AMBER_NUT = new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.98, roughness: 0.1 })
const MAT_SLATE_ACTUATOR = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.92, roughness: 0.22 })
const MAT_DARK_ACTUATOR = new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.95, roughness: 0.15 })
const MAT_KNUCKLE_BRACKET = new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.92, roughness: 0.2 })

const MAT_STRUT_GREY = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.94, roughness: 0.18 })
const MAT_SLATE_PIVOT = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.92, roughness: 0.2 })
const MAT_DARK_PIVOT = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.95, roughness: 0.15 })
const MAT_DIFF_BAR = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.95, roughness: 0.2 })

const MAT_GOLD_MLI = new THREE.MeshStandardMaterial({ color: '#d99b26', metalness: 0.90, roughness: 0.32, envMapIntensity: 1.5 })
const MAT_GOLD_TAPER = new THREE.MeshStandardMaterial({ color: '#b47818', metalness: 0.88, roughness: 0.38 })
const MAT_DARK_BAY = new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.92, roughness: 0.2 })
const MAT_RIB_GREY = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.96, roughness: 0.16 })
const MAT_CAM_BARREL = new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.95, roughness: 0.1 })
const MAT_HAZCAM_LENS = new THREE.MeshStandardMaterial({ color: '#0284c7', emissive: '#0369a1', emissiveIntensity: 0.7 })
const MAT_GOLD_SEAM = new THREE.MeshStandardMaterial({ color: '#ca8a04', metalness: 0.94, roughness: 0.25 })
const MAT_REAR_BAY = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.9, roughness: 0.25 })
const MAT_REAR_HAZCAM = new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.95, roughness: 0.15 })

const MAT_SOLAR_DECK = new THREE.MeshStandardMaterial({ color: '#071424', metalness: 0.90, roughness: 0.16 })
const MAT_SOLAR_CELL = new THREE.MeshStandardMaterial({ color: '#0b1b36', metalness: 0.92, roughness: 0.12, envMapIntensity: 1.8 })
const MAT_BUSBAR = new THREE.MeshStandardMaterial({ color: '#38bdf8', emissive: '#0ea5e9', emissiveIntensity: 0.5 })
const MAT_GOLD_TRIM = new THREE.MeshStandardMaterial({ color: '#d99b26', metalness: 0.94, roughness: 0.28 })
const MAT_SUNDIAL_BASE = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.6, roughness: 0.4 })
const MAT_SUNDIAL_PIN = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.95, roughness: 0.15 })
const MAT_SUNDIAL_RING = new THREE.MeshStandardMaterial({ color: '#ca8a04', metalness: 0.7, roughness: 0.3 })

const MAT_MAST_BASE = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.88, roughness: 0.2 })
const MAT_MAST_WHITE = new THREE.MeshStandardMaterial({ color: '#f8fafc', metalness: 0.5, roughness: 0.3 })
const MAT_MAST_COLLAR = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.95, roughness: 0.15 })
const MAT_MAST_GOLD_BOX = new THREE.MeshStandardMaterial({ color: '#d97706', metalness: 0.90, roughness: 0.25 })
const MAT_MOTOR_HEAD = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.85, roughness: 0.22 })
const MAT_CAM_BAR = new THREE.MeshStandardMaterial({ color: '#f8fafc', metalness: 0.65, roughness: 0.28 })
const MAT_OPTICAL_LENS = new THREE.MeshStandardMaterial({
  color: '#38bdf8',
  emissive: '#0284c7',
  emissiveIntensity: 1.4,
  metalness: 0.98,
  roughness: 0.05,
})
const MAT_NAVCAM_LENS = new THREE.MeshStandardMaterial({
  color: '#fbbf24',
  emissive: '#f59e0b',
  emissiveIntensity: 1.5,
})
const MAT_SUN_SIGHT = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.95, roughness: 0.15 })

const MAT_DISH_PEDESTAL = new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.92, roughness: 0.18 })
const MAT_DISH_ARM = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.94, roughness: 0.16 })
const MAT_PARABOLIC_GOLD = new THREE.MeshStandardMaterial({
  color: '#d97706',
  metalness: 0.95,
  roughness: 0.20,
  side: THREE.DoubleSide,
})
const MAT_DISH_LIP = new THREE.MeshStandardMaterial({ color: '#f8fafc', metalness: 0.88, roughness: 0.2 })
const MAT_FEED_HORN = new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.96, roughness: 0.12 })
const MAT_FEED_TIP = new THREE.MeshStandardMaterial({
  color: '#ffedd5',
  emissive: '#ff9f1c',
  emissiveIntensity: 1.4,
  metalness: 0.92,
  roughness: 0.12,
})
const MAT_LGA_BASE = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.92, roughness: 0.2 })
const MAT_LGA_TIP = new THREE.MeshStandardMaterial({ color: '#d97706', emissive: '#f59e0b', emissiveIntensity: 0.8 })

const MAT_ARM_GREEN = new THREE.MeshStandardMaterial({ color: '#9cb3a8', metalness: 0.7, roughness: 0.4 })
const MAT_TURRET_GOLD = new THREE.MeshStandardMaterial({ color: '#d99b26', metalness: 0.90, roughness: 0.28 })
const MAT_RAT_HEAD = new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.96, roughness: 0.1 })
const MAT_APXS = new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.94, roughness: 0.18 })
const MAT_MICROSCOPE = new THREE.MeshStandardMaterial({ color: '#0284c7', emissive: '#0369a1', emissiveIntensity: 0.8 })

/* ══════════════════════════════════════════════════════════════════
   1. SOLID MACHINED ROVER WHEEL WITH SPIRAL FLEXURES & INTEGRATED TREADS
   ══════════════════════════════════════════════════════════════════ */
function RoverWheel({ position, wheelRef, isSteering, side }) {
  return (
    <group position={position}>
      {/* Steering Kingpin Knuckle Actuator for Corner Wheels */}
      {isSteering && (
        <group position={[side * -0.04, 0.20, 0]}>
          <mesh geometry={GEO_KINGPIN} material={MAT_SLATE_ACTUATOR} />
          <mesh geometry={GEO_KINGPIN_CAP} material={MAT_DARK_ACTUATOR} position={[0, 0.1, 0]} />
          <mesh geometry={GEO_KNUCKLE_BRACKET} material={MAT_KNUCKLE_BRACKET} position={[side * 0.04, -0.08, 0]} />
        </group>
      )}

      {/* Rotating Wheel Hub & Rim */}
      <group ref={wheelRef}>
        {/* Main Solid Aluminum Wheel Drum */}
        <mesh geometry={GEO_WHEEL_DRUM} material={MAT_WHEEL_DRUM} rotation={[0, 0, Math.PI / 2]} />

        {/* Machined Outer Wheel Rim Flange */}
        <mesh geometry={GEO_RIM_OUTER} material={MAT_ALUM_RIM} position={[side * 0.108, 0, 0]} rotation={[0, 0, Math.PI / 2]} />

        {/* Machined Inner Wheel Rim Flange */}
        <mesh geometry={GEO_RIM_INNER} material={MAT_SLATE_FLANGE} position={[side * -0.108, 0, 0]} rotation={[0, 0, Math.PI / 2]} />

        {/* Integrated Cleat Treads on Outer Tire Drum */}
        {CLEAT_DATA.map((c, idx) => (
          <mesh key={idx} geometry={GEO_CLEAT} material={MAT_CLEAT} position={[0, c.y, c.z]} rotation={[c.rot, 0, 0]} />
        ))}

        {/* Recessed Center Spoke Hub Disc */}
        <mesh geometry={GEO_HUB_DISC} material={MAT_HUB_DISC} position={[side * 0.03, 0, 0]} rotation={[0, 0, Math.PI / 2]} />

        {/* Spiral Curved Flexure Hub Spokes */}
        {SPOKE_DATA.map((angle, idx) => (
          <mesh
            key={idx}
            geometry={GEO_SPOKE}
            material={MAT_SPOKE}
            position={[side * 0.095, Math.sin(angle) * 0.16, Math.cos(angle) * 0.16]}
            rotation={[angle + 0.38, 0, 0]}
          />
        ))}

        {/* Central Bronze/Gold Hub Cap & Nut */}
        <mesh geometry={GEO_HUB_CAP} material={MAT_GOLD_HUB} position={[side * 0.118, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
        <mesh geometry={GEO_HUB_NUT} material={MAT_AMBER_NUT} position={[side * 0.132, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
      </group>
    </group>
  )
}

/* ══════════════════════════════════════════════════════════════════
   2. ROCKER-BOGIE SUSPENSION MECHANISM STRUTS
   ══════════════════════════════════════════════════════════════════ */
function RockerBogieSuspension() {
  return (
    <group>
      {[-1, 1].map((side) => {
        const x = side * 0.80
        return (
          <group key={side} position={[x, 0, 0]}>
            {/* Main Rocker Differential Pivot Joint */}
            <mesh geometry={GEO_PIVOT_JOINT} material={MAT_SLATE_PIVOT} position={[0, -0.14, 0]} rotation={[0, 0, Math.PI / 2]} />

            {/* Front Rocker Strut to Front Wheel */}
            <mesh
              geometry={GEO_FRONT_STRUT}
              material={MAT_STRUT_GREY}
              position={[side * 0.05, -0.34, 0.35]}
              rotation={[-0.62, 0, side * 0.07]}
            />

            {/* Rear Rocker Strut to Bogie Pivot */}
            <mesh
              geometry={GEO_REAR_STRUT}
              material={MAT_STRUT_GREY}
              position={[side * 0.04, -0.26, -0.30]}
              rotation={[0.42, 0, side * -0.05]}
            />

            {/* Rear Bogie Pivot Joint */}
            <mesh geometry={GEO_BOGIE_PIVOT} material={MAT_DARK_PIVOT} position={[side * 0.05, -0.38, -0.40]} rotation={[0, 0, Math.PI / 2]} />

            {/* Rear Bogie Bridge Bar */}
            <mesh
              geometry={GEO_BOGIE_BRIDGE}
              material={MAT_ALUM_RIM}
              position={[side * 0.07, -0.47, -0.40]}
              rotation={[0.02, 0, side * -0.03]}
            />
          </group>
        )
      })}

      {/* Transverse Top Differential Bar Across Chassis */}
      <mesh geometry={GEO_TRANSVERSE_BAR} material={MAT_DIFF_BAR} position={[0, 0.02, -0.08]} rotation={[0, 0, Math.PI / 2]} />
    </group>
  )
}

/* ══════════════════════════════════════════════════════════════════
   3. WARM ELECTRONICS BOX (WEB) IN KAPTON MLI GOLD THERMAL FOIL
   ══════════════════════════════════════════════════════════════════ */
function WarmElectronicsBox() {
  return (
    <group position={[0, -0.16, 0]}>
      {/* Main Faceted WEB Chassis Hull */}
      <mesh geometry={GEO_CHASSIS_HULL} material={MAT_GOLD_MLI} position={[0, 0.04, 0]} />

      {/* Tapered Chassis Underbelly */}
      <mesh geometry={GEO_CHASSIS_BELLY} material={MAT_GOLD_TAPER} position={[0, -0.16, 0.04]} />

      {/* Front Equipment Nose Bay with Structural Framing */}
      <group position={[0, 0.05, 0.74]}>
        <mesh geometry={GEO_NOSE_BAY} material={MAT_DARK_BAY} />
        {/* Front Structural Ribs / Ducts */}
        {[-0.25, -0.08, 0.08, 0.25].map((x) => (
          <mesh key={x} geometry={GEO_NOSE_RIB} material={MAT_RIB_GREY} position={[x, 0, 0.065]} />
        ))}
        {/* Front Hazcam Stereo Cameras */}
        {[-0.27, 0.27].map((x) => (
          <group key={x} position={[x, 0.05, 0.07]}>
            <mesh geometry={GEO_HAZCAM_BARREL} material={MAT_CAM_BARREL} rotation={[Math.PI / 2, 0, 0]} />
            <mesh geometry={GEO_HAZCAM_LENS} material={MAT_HAZCAM_LENS} position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]} />
          </group>
        ))}
      </group>

      {/* Gold Foil Panel Seams */}
      {[-0.46, 0, 0.46].map((x) => (
        <mesh key={x} geometry={GEO_FOIL_SEAM} material={MAT_GOLD_SEAM} position={[x, 0.04, 0]} />
      ))}

      {/* Rear Equipment Bay & Thermal Radiator Panel */}
      <group position={[0, 0.05, -0.74]}>
        <mesh geometry={GEO_REAR_BAY} material={MAT_REAR_BAY} />
        {/* Rear Hazcams */}
        {[-0.22, 0.22].map((x) => (
          <mesh key={x} geometry={GEO_REAR_HAZCAM} material={MAT_REAR_HAZCAM} position={[x, 0.04, -0.065]} rotation={[-Math.PI / 2, 0, 0]} />
        ))}
      </group>
    </group>
  )
}

/* ══════════════════════════════════════════════════════════════════
   4. FACETED SOLAR ARRAY WINGS (MER WING-SPAN DESIGN)
   ══════════════════════════════════════════════════════════════════ */
function SolarArrayDeck() {
  return (
    <group position={[0, 0.10, 0]}>
      {/* Central Solar Deck */}
      <mesh geometry={GEO_SOLAR_DECK} material={MAT_SOLAR_DECK} position={[0, 0, 0.07]} />

      {/* Photovoltaic Dark Blue Cell Tiles */}
      {[-0.50, -0.25, 0, 0.25, 0.50].map((x) => (
        <mesh key={x} geometry={GEO_SOLAR_TILE_CENTER} material={MAT_SOLAR_CELL} position={[x, 0.016, 0.07]} />
      ))}

      {/* Silver Trace Busbars */}
      {[-0.42, -0.14, 0.14, 0.42].map((z) => (
        <mesh key={z} geometry={GEO_SOLAR_BUSBAR} material={MAT_BUSBAR} position={[0, 0.019, z]} />
      ))}

      {/* Left Solar Wing Panel */}
      <group position={[-1.00, 0.01, 0.04]} rotation={[0, 0, 0.04]}>
        <mesh geometry={GEO_SOLAR_WING} material={MAT_SOLAR_DECK} />
        {[-0.15, 0.11].map((x) => (
          <mesh key={x} geometry={GEO_SOLAR_TILE_WING} material={MAT_SOLAR_CELL} position={[x, 0.014, 0]} />
        ))}
        {/* Gold Trim Edge */}
        <mesh geometry={GEO_SOLAR_TRIM} material={MAT_GOLD_TRIM} position={[-0.305, -0.004, 0]} />
      </group>

      {/* Right Solar Wing Panel */}
      <group position={[1.00, 0.01, 0.04]} rotation={[0, 0, -0.04]}>
        <mesh geometry={GEO_SOLAR_WING} material={MAT_SOLAR_DECK} />
        {[-0.11, 0.15].map((x) => (
          <mesh key={x} geometry={GEO_SOLAR_TILE_WING} material={MAT_SOLAR_CELL} position={[x, 0.014, 0]} />
        ))}
        {/* Gold Trim Edge */}
        <mesh geometry={GEO_SOLAR_TRIM} material={MAT_GOLD_TRIM} position={[0.305, -0.004, 0]} />
      </group>

      {/* Rear Solar Wing Flap */}
      <group position={[0, -0.004, -0.76]} rotation={[-0.05, 0, 0]}>
        <mesh geometry={GEO_SOLAR_FLAP} material={MAT_SOLAR_DECK} />
        <mesh geometry={GEO_SOLAR_TILE_FLAP} material={MAT_SOLAR_CELL} position={[0, 0.013, 0]} />
      </group>

      {/* Mars Sundial / Solar Color Calibration Target */}
      <group position={[0.32, 0.022, 0.42]}>
        <mesh geometry={GEO_SUNDIAL_BASE} material={MAT_SUNDIAL_BASE} />
        <mesh geometry={GEO_SUNDIAL_PIN} material={MAT_SUNDIAL_PIN} position={[0, 0.035, 0]} />
        <mesh geometry={GEO_SUNDIAL_RING} material={MAT_SUNDIAL_RING} position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]} />
      </group>
    </group>
  )
}

/* ══════════════════════════════════════════════════════════════════
   5. PANCAM MAST ASSEMBLY (PMA) & STEREO CAMERA HEAD ("THE EYES")
   ══════════════════════════════════════════════════════════════════ */
function PancamMast({ mastRef }) {
  return (
    <group ref={mastRef} position={[-0.18, 0.12, 0.44]}>
      {/* Mast Deck Flange Base */}
      <mesh geometry={GEO_MAST_BASE} material={MAT_MAST_BASE} position={[0, 0.04, 0]} />

      {/* Main Tall White Mast Column */}
      <mesh geometry={GEO_MAST_COLUMN} material={MAT_MAST_WHITE} position={[0, 0.58, 0]} />

      {/* Mid-Mast Wiring Collar */}
      <mesh geometry={GEO_MAST_COLLAR} material={MAT_MAST_COLLAR} position={[0, 0.48, 0]} />
      <mesh geometry={GEO_MAST_WIRING} material={MAT_MAST_GOLD_BOX} position={[0.045, 0.48, 0.02]} />

      {/* Top Elevation/Azimuth Motor Drive Housing */}
      <group position={[0, 1.14, 0]}>
        <mesh geometry={GEO_MOTOR_HOUSING} material={MAT_MOTOR_HEAD} />
        <mesh geometry={GEO_MOTOR_TRANSVERSE} material={MAT_SLATE_ACTUATOR} position={[0, 0.07, 0]} rotation={[0, 0, Math.PI / 2]} />

        {/* ── Stereo Camera Bar Head ("The Eyes of the Rover") ── */}
        <group position={[0, 0.15, 0.06]}>
          {/* Main Transverse White Camera Bar */}
          <mesh geometry={GEO_CAMERA_BAR} material={MAT_CAM_BAR} />

          {/* Left Panoramic Camera (Pancam) Pod */}
          <group position={[-0.19, 0.01, 0.06]}>
            <mesh geometry={GEO_PANCAM_POD} material={MAT_DARK_ACTUATOR} />
            <mesh geometry={GEO_LENS_HOOD} material={MAT_CAM_BARREL} position={[0, 0, 0.075]} rotation={[Math.PI / 2, 0, 0]} />
            <mesh geometry={GEO_OPTICAL_LENS} material={MAT_OPTICAL_LENS} position={[0, 0, 0.118]} rotation={[Math.PI / 2, 0, 0]} />
          </group>

          {/* Right Panoramic Camera (Pancam) Pod */}
          <group position={[0.19, 0.01, 0.06]}>
            <mesh geometry={GEO_PANCAM_POD} material={MAT_DARK_ACTUATOR} />
            <mesh geometry={GEO_LENS_HOOD} material={MAT_CAM_BARREL} position={[0, 0, 0.075]} rotation={[Math.PI / 2, 0, 0]} />
            <mesh geometry={GEO_OPTICAL_LENS} material={MAT_OPTICAL_LENS} position={[0, 0, 0.118]} rotation={[Math.PI / 2, 0, 0]} />
          </group>

          {/* Center Dual Navcams */}
          {[-0.055, 0.055].map((x) => (
            <group key={x} position={[x, -0.035, 0.06]}>
              <mesh geometry={GEO_NAVCAM_BODY} material={MAT_DARK_ACTUATOR} rotation={[Math.PI / 2, 0, 0]} />
              <mesh geometry={GEO_NAVCAM_LENS} material={MAT_NAVCAM_LENS} position={[0, 0, 0.028]} rotation={[Math.PI / 2, 0, 0]} />
            </group>
          ))}

          {/* Top Sun Sight Indicator */}
          <mesh geometry={GEO_SUN_SIGHT} material={MAT_SUN_SIGHT} position={[0, 0.085, 0]} />
        </group>
      </group>
    </group>
  )
}

/* ══════════════════════════════════════════════════════════════════
   6. STEERABLE HIGH-GAIN DISH (HGA) & LOW-GAIN MAST (LGA)
   ══════════════════════════════════════════════════════════════════ */
function AntennaSystem({ dishRef }) {
  return (
    <group>
      {/* Steerable High-Gain Parabolic Dish (HGA) on Right Rear Deck */}
      <group ref={dishRef} position={[0.46, 0.20, -0.40]}>
        {/* Gimbal Pedestal Base */}
        <mesh geometry={GEO_DISH_PEDESTAL} material={MAT_DISH_PEDESTAL} position={[0, 0.07, 0]} />
        <mesh geometry={GEO_DISH_ARM} material={MAT_DISH_ARM} position={[0, 0.17, 0]} rotation={[0.42, 0, 0]} />

        {/* Tilted Open Parabolic Reflector Dish */}
        <group position={[0, 0.28, 0.04]} rotation={[-0.70, 0.22, 0]}>
          {/* Inner Gold Concave Dish */}
          <mesh geometry={GEO_PARABOLIC_DISH} material={MAT_PARABOLIC_GOLD} rotation={[Math.PI / 2, 0, 0]} />
          {/* Outer White Dish Lip Rim */}
          <mesh geometry={GEO_DISH_RIM} material={MAT_DISH_LIP} rotation={[Math.PI / 2, 0, 0]} />
          {/* Center Sub-Reflector Feed Horn & Feed Tip */}
          <mesh geometry={GEO_FEED_HORN} material={MAT_FEED_HORN} position={[0, 0, 0.09]} rotation={[Math.PI / 2, 0, 0]} />
          <mesh geometry={GEO_FEED_TIP} material={MAT_FEED_TIP} position={[0, 0, 0.17]} />
        </group>
      </group>

      {/* Low-Gain Omni-Directional Antenna Mast (LGA) */}
      <group position={[0.16, 0.18, -0.14]}>
        <mesh geometry={GEO_LGA_BASE} material={MAT_LGA_BASE} position={[0, 0.05, 0]} />
        <mesh geometry={GEO_LGA_MAST} material={MAT_MAST_WHITE} position={[0, 0.46, 0]} />
        <mesh geometry={GEO_LGA_TIP} material={MAT_LGA_TIP} position={[0, 0.84, 0]} />
      </group>
    </group>
  )
}

/* ══════════════════════════════════════════════════════════════════
   7. ARTICULATED ROBOTIC ARM (INSTRUMENT DEPLOYMENT DEVICE - IDD)
   ══════════════════════════════════════════════════════════════════ */
function RoboticArm({ armRef }) {
  return (
    <group ref={armRef} position={[-0.32, -0.16, 0.70]}>
      {/* Shoulder Azimuth/Elevation Joint */}
      <mesh geometry={GEO_SHOULDER_A} material={MAT_SLATE_ACTUATOR} />
      <mesh geometry={GEO_SHOULDER_B} material={MAT_DARK_PIVOT} position={[0, 0.07, 0]} rotation={[0, 0, Math.PI / 2]} />

      {/* Upper Arm Segment */}
      <group position={[0.02, -0.10, 0.16]} rotation={[0.42, -0.26, 0]}>
        <mesh geometry={GEO_UPPER_ARM} material={MAT_ARM_GREEN} />

        {/* Elbow Joint */}
        <group position={[0, 0, 0.22]}>
          <mesh geometry={GEO_ELBOW} material={MAT_DARK_PIVOT} rotation={[0, 0, Math.PI / 2]} />

          {/* Forearm Segment */}
          <group position={[-0.03, -0.12, 0.14]} rotation={[-0.65, 0.32, -0.18]}>
            <mesh geometry={GEO_FOREARM} material={MAT_ARM_GREEN} />

            {/* Wrist Sensor Turret */}
            <group position={[0, 0, 0.18]}>
              <mesh geometry={GEO_TURRET_HOUSING} material={MAT_TURRET_GOLD} rotation={[Math.PI / 2, 0, 0]} />
              <mesh geometry={GEO_RAT_HEAD} material={MAT_RAT_HEAD} position={[0.05, 0.035, 0.05]} rotation={[0, 0.35, 0]} />
              <mesh geometry={GEO_APXS} material={MAT_APXS} position={[-0.05, -0.02, 0.05]} rotation={[0.25, -0.35, 0]} />
              <mesh geometry={GEO_MICROSCOPE} material={MAT_MICROSCOPE} position={[0, -0.05, 0.06]} />
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

/* ══════════════════════════════════════════════════════════════════
   8. COMPLETE MARS EXPLORATION ROVER ASSEMBLY (SPIRIT / OPPORTUNITY)
   ══════════════════════════════════════════════════════════════════ */
function MarsExplorationRover({ progressRef, reducedMotion }) {
  const rig = useRef()
  const mast = useRef()
  const dish = useRef()
  const arm = useRef()
  const wheels = useRef([])
  const previousProgress = useRef(0)
  const facingDirection = useRef(1) // 1 = facing right (+X), -1 = facing left (-X)
  const currentYaw = useRef(Math.PI / 2 - 0.15)
  const wheelRoll = useRef(0)

  useFrame((state) => {
    if (reducedMotion) return

    const time = state.clock.getElapsedTime()
    const progress = progressRef.current || 0
    const travelDelta = progress - previousProgress.current
    previousProgress.current = progress

    // Detect scroll direction change with deadzone to prevent micro-jitter
    if (travelDelta < -0.0006) {
      facingDirection.current = -1
    } else if (travelDelta > 0.0006) {
      facingDirection.current = 1
    }

    const YAW_RIGHT = Math.PI / 2 - 0.15
    const YAW_LEFT = YAW_RIGHT + Math.PI // 180-degree turn to face left
    const targetYaw = facingDirection.current === 1 ? YAW_RIGHT : YAW_LEFT

    // Smooth lerp transition for cinematic 180-degree U-turn rotation
    currentYaw.current = THREE.MathUtils.lerp(currentYaw.current, targetYaw, 0.075)

    // Martian terrain: vertical bounce + pitch/roll/yaw to simulate active driving & turning
    if (rig.current) {
      // Vertical bounce — rover drives over rocky Martian terrain
      rig.current.position.y = -0.136 + Math.sin(time * 2.4) * 0.022 + Math.sin(time * 1.1) * 0.012
      // Pitch (nose up/down) from terrain undulation
      rig.current.rotation.x = 0.04 + Math.cos(time * 1.6) * 0.018
      // Smooth Y rotation for 180° turn when reversing direction
      rig.current.rotation.y = currentYaw.current
      // Roll side-to-side — subtle suspension flex
      rig.current.rotation.z = Math.sin(time * 1.0) * 0.016
    }

    // Pancam Mast: scans horizon ahead in current direction of travel
    if (mast.current) {
      const mastBias = facingDirection.current === 1 ? 0.18 : -0.18
      mast.current.rotation.y = mastBias + Math.sin(time * 0.55) * 0.20
      mast.current.rotation.x = -0.08 + Math.sin(time * 0.70) * 0.028
    }

    // High Gain Antenna slow Earth-tracking rotation
    if (dish.current) {
      dish.current.rotation.y = time * 0.18 + progress * 0.5
    }

    // Robotic Arm micro-flex while in transit
    if (arm.current) {
      arm.current.rotation.z = Math.sin(time * 0.45) * 0.020
      arm.current.rotation.x = Math.cos(time * 0.55) * 0.014
    }

    // Continuously roll all 6 wheels forward in travel direction
    const speed = Math.abs(travelDelta) * 35 + (Math.abs(travelDelta) > 0.0001 ? 0.03 : 0.015)
    wheelRoll.current += speed
    const baseRoll = time * 1.85 + wheelRoll.current

    wheels.current.forEach((wheel) => {
      if (wheel) {
        wheel.rotation.x = -baseRoll
      }
    })
  })

  return (
    <group
      ref={rig}
      scale={0.92}
      // Side-profile: rover faces LEFT in 3D space so camera sees the RIGHT side
      // Y rotation of Math.PI/2 points the rover's nose out of screen-right
      rotation={[0.04, Math.PI / 2 - 0.15, 0]}
      position={[0, -0.136, 0]}
    >
      {/* 1. Rocker-Bogie Suspension Linkages */}
      <RockerBogieSuspension />

      {/* 2. Six Machined Aluminum Cleated Wheels */}
      {WHEEL_DATA.map((wheel, index) => {
        const side = wheel.pos[0] > 0 ? 1 : -1
        return (
          <RoverWheel
            key={wheel.id}
            position={wheel.pos}
            isSteering={wheel.isSteering}
            side={side}
            wheelRef={(element) => {
              wheels.current[index] = element
            }}
          />
        )
      })}

      {/* 3. Central Chassis WEB with Kapton MLI Gold Thermal Blanket */}
      <WarmElectronicsBox />

      {/* 4. MER Faceted Solar Array Wing Deck */}
      <SolarArrayDeck />

      {/* 5. Pancam Mast Assembly (PMA) with Stereo Camera Eyes */}
      <PancamMast mastRef={mast} />

      {/* 6. Steerable High Gain Dish & Low Gain Antenna */}
      <AntennaSystem dishRef={dish} />

      {/* 7. Front-Left Robotic Arm (IDD) & Instrument Turret */}
      <RoboticArm armRef={arm} />
    </group>
  )
}

/* ══════════════════════════════════════════════════════════════════
   9. MAIN 3D ROADMAP CANVAS COMPONENT WITH ZERO-NETWORK MARS LIGHTING
   ══════════════════════════════════════════════════════════════════ */
export default function RoadmapRobot3D({ progressRef, reducedMotion = false }) {
  const [ready, setReady] = useState(false)

  return (
    <div
      className={`h-full w-full transition-opacity duration-300 ${ready ? 'opacity-100' : 'opacity-0'}`}
      aria-label="3D NASA Mars Exploration Rover tracking roadmap progress"
      role="img"
    >
      <Canvas
        camera={{ position: [0.5, 0.55, 4.8], fov: 40 }}
        dpr={[1, 1.5]}
        shadows={false}
        frameloop={reducedMotion ? 'demand' : 'always'}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
          setReady(true)
        }}
      >
        <Suspense fallback={null}>
          {/* Ambient fill — warm Martian sky */}
          <ambientLight intensity={0.65} color="#ffe8c8" />

          {/* Main Martian sun: high-angle key light from upper-left */}
          <directionalLight
            position={[-5.0, 7.0, 3.0]}
            intensity={4.0}
            color="#fff3d0"
          />

          {/* Warm fill from front-right: illuminates rover flank facing camera */}
          <pointLight position={[3.5, 1.5, 4.5]} intensity={2.8} color="#f59e0b" distance={9} />

          {/* Rust-red bounce from ground — Martian regolith glow */}
          <pointLight position={[0, -1.5, 1.0]} intensity={1.8} color="#c05c28" distance={5} />

          {/* Cool backlight from behind */}
          <pointLight position={[-2, 2.0, -3.0]} intensity={1.0} color="#94a3b8" distance={8} />

          {/* 
            ZERO-NETWORK PROCEDURAL MARS ENVIRONMENT
            Replaces the external 1.7MB GitHub HDR download with instant local GPU lightformers.
            Resolution 128 + frames 1 bakes in ~1ms on the GPU with 0 bytes downloaded over network.
          */}
          <Environment resolution={128} frames={1}>
            <Lightformer
              form="ring"
              intensity={2.8}
              color="#ffe0a0"
              scale={12}
              position={[0, 6, 2]}
              target={[0, 0, 0]}
            />
            <Lightformer
              form="rect"
              intensity={4.5}
              color="#fff5dd"
              scale={[5, 5]}
              position={[-5, 7, 3]}
              target={[0, 0, 0]}
            />
            <Lightformer
              form="rect"
              intensity={2.2}
              color="#c05c28"
              scale={[12, 12]}
              position={[0, -6, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            />
            <Lightformer
              form="rect"
              intensity={1.2}
              color="#94a3b8"
              scale={[8, 3]}
              position={[4, 2, -4]}
              target={[0, 0, 0]}
            />
          </Environment>

          {/* Mars Exploration Rover 3D Assembly */}
          <MarsExplorationRover progressRef={progressRef} reducedMotion={reducedMotion} />

          {/* Ground Contact Shadows — baked in 1 single frame at 256 resolution for instant init */}
          <ContactShadows
            position={[0, -0.92, 0]}
            opacity={0.55}
            scale={5.0}
            blur={2.4}
            far={2.8}
            resolution={256}
            frames={1}
            color="#3d1a08"
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
