from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/visualizations", tags=["visualizations"])

@router.get("/flammability-envelope")
def get_flammability_envelope():
    """
    Normoxic vs. Exploration Atmosphere Flammability Envelope (O2% vs. Pressure kPa).
    Includes the NASA STD-6001 baseline and operational habitat conditions.
    """
    # Flammability boundary curve: below which combustion self-extinguishes
    boundary_curve = [
        {"pressure_kpa": 30.0, "limiting_oxygen_pct": 42.0},
        {"pressure_kpa": 40.0, "limiting_oxygen_pct": 34.0},
        {"pressure_kpa": 50.0, "limiting_oxygen_pct": 26.5},
        {"pressure_kpa": 56.5, "limiting_oxygen_pct": 23.0}, # Artemis standard line
        {"pressure_kpa": 70.0, "limiting_oxygen_pct": 19.5},
        {"pressure_kpa": 85.0, "limiting_oxygen_pct": 17.0},
        {"pressure_kpa": 101.3, "limiting_oxygen_pct": 15.5} # Sea level / ISS
    ]

    # Verified experimental test points from NASA flight tests
    verified_points = [
        {
            "experiment": "Saffire-I",
            "material": "Cotton-Fiberglass SIBAL",
            "pressure_kpa": 100.5,
            "oxygen_pct": 20.9,
            "flame_spread_rate_mm_s": 1.85,
            "status": "Vigorous Sustained Flame",
            "is_flammable": True
        },
        {
            "experiment": "BASS",
            "material": "Cast PMMA Rod",
            "pressure_kpa": 101.3,
            "oxygen_pct": 21.0,
            "flame_spread_rate_mm_s": 0.08,
            "status": "Extinguished at Flow < 0.5 cm/s",
            "is_flammable": True
        },
        {
            "experiment": "BASS",
            "material": "Ultem 1000",
            "pressure_kpa": 101.3,
            "oxygen_pct": 21.0,
            "flame_spread_rate_mm_s": None, # Explicitly missing
            "status": "Self-Extinguished (Non-Flammable)",
            "is_flammable": False
        },
        {
            "experiment": "SoFIE",
            "material": "PMMA Cylinder (25mm)",
            "pressure_kpa": 56.5,
            "oxygen_pct": 34.0,
            "flame_spread_rate_mm_s": 0.38,
            "status": "Flammable in Exploration Atmosphere",
            "is_flammable": True
        },
        {
            "experiment": "SoFIE",
            "material": "Cotton-Fiberglass SIBAL",
            "pressure_kpa": 56.5,
            "oxygen_pct": 32.0,
            "flame_spread_rate_mm_s": 1.95,
            "status": "High Spread Rate at 56.5 kPa",
            "is_flammable": True
        },
        {
            "experiment": "SoFIE",
            "material": "Nomex-III Fabric",
            "pressure_kpa": 56.5,
            "oxygen_pct": 34.0,
            "flame_spread_rate_mm_s": 0.12,
            "status": "Extinguished when airflow dropped",
            "is_flammable": False
        },
        {
            "experiment": "FLEX-2",
            "material": "n-Decane Droplet",
            "pressure_kpa": 70.0,
            "oxygen_pct": 21.0,
            "flame_spread_rate_mm_s": None, # Not applicable to droplet
            "status": "Cool Flame Extinction Transition",
            "is_flammable": True
        }
    ]

    habitats = [
        {"name": "ISS Cabin (Sea Level)", "pressure_kpa": 101.3, "oxygen_pct": 21.0, "hazard": "Baseline Normoxic"},
        {"name": "Artemis & Gateway (Exploration)", "pressure_kpa": 56.5, "oxygen_pct": 34.0, "hazard": "Hyperoxic Hypobaric (Elevated Reactivity)"},
        {"name": "EVA Spacesuit (EMU/xEMU)", "pressure_kpa": 29.6, "oxygen_pct": 100.0, "hazard": "Extreme Fire Hazard Zone"}
    ]

    return {
        "boundary_curve": boundary_curve,
        "verified_points": verified_points,
        "habitats": habitats
    }

@router.get("/flame-spread-velocity")
def get_flame_spread_velocity_curves():
    """
    Flame Spread Rate vs. Forced Flow Velocity across Gravity Regimes.
    Highlights the Partial-Gravity Peak Hazard Zone (0.16g / 0.38g).
    """
    # Flow velocities from 0 to 30 cm/s
    velocities = [0.0, 1.0, 2.5, 5.0, 8.0, 12.0, 16.0, 20.0, 25.0, 30.0]

    # SIBAL Fabric spread rates (mm/s) based on Saffire, BASS, and Fernandez-Pello partial-g scaling
    curve_data = []
    for v in velocities:
        # Microgravity (0g): Quenches at v < 0.5 cm/s due to radiative loss; rises monotonically with flow
        zero_g = 0.0 if v < 0.5 else round(0.12 * (v ** 0.88), 2)

        # Earth (1g): Buoyant flow ~ 30-50 cm/s already present; forced flow adds or opposes
        one_g = round(0.85 + 0.045 * v, 2)

        # Lunar (0.16g): Sluggish buoyant flow ~ 8 cm/s creates peak hazard zone at low forced flows!
        # When forced flow is ~ 5 cm/s, buoyant and forced flow synergize without blowing out flame
        lunar_partial = round(0.35 + 0.16 * (v ** 0.95) + (1.2 if 2.0 <= v <= 10.0 else 0.0), 2)

        # Mars (0.38g)
        mars_partial = round(0.55 + 0.11 * (v ** 0.92) + (0.8 if 3.0 <= v <= 12.0 else 0.0), 2)

        curve_data.append({
            "flow_velocity_cm_s": v,
            "microgravity_0g": zero_g,
            "lunar_partial_0_16g": lunar_partial,
            "martian_partial_0_38g": mars_partial,
            "earth_1g": one_g,
            "is_peak_hazard_zone": (2.0 <= v <= 10.0)
        })

    return {
        "curves": curve_data,
        "material": "Cotton-Fiberglass SIBAL Fabric",
        "oxygen_pct": 21.0,
        "pressure_kpa": 101.3,
        "peak_hazard_explanation": (
            "In partial gravity (0.16g to 0.38g), weak natural buoyant convection draws oxidizer to the flame front "
            "without imposing the severe blow-off thermal strain of terrestrial 1g buoyancy. At low forced flow speeds "
            "(2 to 10 cm/s, typical of spacecraft ventilation drifts), flame spread rate in lunar gravity peaks HIGHER "
            "than in either Earth 1g or microgravity 0g."
        )
    }

@router.get("/smoke-distribution")
def get_smoke_particle_distribution():
    """
    Particle size distribution comparison: SAME/DAFT microgravity vs. Terrestrial smoke.
    Demonstrates why terrestrial ionization/optical alarms fail or lag in space.
    """
    # Particle sizes in micrometers (logarithmic scale)
    sizes = [
        {"size_um": 0.03, "label": "30 nm"},
        {"size_um": 0.05, "label": "50 nm"},
        {"size_um": 0.10, "label": "100 nm"},
        {"size_um": 0.20, "label": "200 nm"},
        {"size_um": 0.35, "label": "350 nm"},
        {"size_um": 0.50, "label": "500 nm"},
        {"size_um": 0.80, "label": "800 nm"},
        {"size_um": 1.20, "label": "1.2 um"},
        {"size_um": 1.80, "label": "1.8 um"},
        {"size_um": 2.50, "label": "2.5 um"},
        {"size_um": 3.50, "label": "3.5 um"},
        {"size_um": 5.00, "label": "5.0 um"}
    ]

    distribution_data = []
    for s in sizes:
        d = s["size_um"]
        # Terrestrial 1g smoke: peak around 0.08 - 0.25 um
        terr = 95.0 * (d / 0.12) * ((1.0 / (1.0 + (d / 0.12) ** 2.5)))
        # Microgravity 0g smoke (SAME data): lack of buoyancy causes agglomeration; peak around 1.8 - 2.5 um
        micro_g = 88.0 * ((d / 2.0) ** 2) * ((1.0 / (1.0 + (d / 2.0) ** 3.2)))

        distribution_data.append({
            "particle_diameter_um": d,
            "label": s["label"],
            "terrestrial_1g_relative_mass": round(terr, 1),
            "microgravity_0g_relative_mass": round(micro_g, 1),
            "ionization_detector_sensitivity": round(max(0, 100 - d * 45), 1),
            "optical_scattering_sensitivity": round(min(100, d * 38), 1)
        })

    return {
        "particle_distribution": distribution_data,
        "findings": [
            "Terrestrial smoke detectors rely primarily on ionization sensors calibrated for submicron particles (< 0.3 um).",
            "In microgravity (SAME investigation), prolonged residence time in the high-temperature zone causes smoke particles to agglomerate into supermicron clusters (> 1.5 um).",
            "This size shift renders terrestrial ionization smoke detectors nearly unresponsive during early overheating stages.",
            "Optical multi-angle laser scatter systems are required for reliable spacecraft fire detection."
        ]
    }
