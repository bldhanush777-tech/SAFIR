from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/earth-applications", tags=["earth-applications"])

@router.get("")
def get_earth_applications():
    return [
        {
            "id": "app-cool-flames",
            "title": "Clean Low-Temperature Internal Combustion & HCCI Engines",
            "microgravity_origin": "FLEX & FLEX-2 (Flame Extinguishment Experiment)",
            "facility": "ISS Combustion Integrated Rack",
            "terrestrial_domain": "Automotive & Aerospace Propulsion",
            "technology_readiness_level": "TRL 6",
            "summary": "FLEX's discovery of sustained low-temperature quasi-steady 'cool flames' (~600K) without soot generation provided empirical chemical kinetic rates for Homogeneous Charge Compression Ignition (HCCI) engines. This enables ultra-clean automotive engines with 25% higher thermal efficiency and near-zero NOx and particulate emissions.",
            "patents_and_impact": "Adopted in kinetic mechanisms by Lawrence Livermore National Laboratory (LLNL) and commercial engine CFD combustion models.",
            "metrics": {
                "efficiency_gain": "+22% to +28%",
                "nox_reduction": "-90%",
                "soot_suppression": "Near-Zero"
            }
        },
        {
            "id": "app-early-smoke-detectors",
            "title": "Ultra-Early Wildfire & Industrial Warehouse Multi-Angle Aerosol Detectors",
            "microgravity_origin": "SAME, SAME-R & DAFT (Smoke Aerosol Measurement)",
            "facility": "ISS Microgravity Science Glovebox",
            "terrestrial_domain": "Industrial Fire Safety & Forest Wildfire Sentry",
            "technology_readiness_level": "TRL 8",
            "summary": "Data from SAME and DAFT on coagulation dynamics and optical extinction across wide particle distributions led to the development of dual-wavelength polarimetric laser detectors capable of discriminating smoldering vegetation smoke from airborne dust and water vapor, drastically cutting false alarms.",
            "patents_and_impact": "Commercialized in advanced optical fire detectors installed in data centers, cleanrooms, and wildland-urban interface monitoring towers.",
            "metrics": {
                "false_alarm_reduction": "-75%",
                "detection_lead_time": "15-20 min faster",
                "particle_resolution": "0.05 to 5.0 um"
            }
        },
        {
            "id": "app-fire-retardant-polymers",
            "title": "Self-Extinguishing Aircraft Interiors & Architectural Composites",
            "microgravity_origin": "BASS, BASS-II & Saffire Program",
            "facility": "ISS MSG & Cygnus Resupply Vehicle",
            "terrestrial_domain": "Commercial Aviation & High-Rise Building Materials",
            "technology_readiness_level": "TRL 7",
            "summary": "By isolating purely diffusive and low-convection flammability limits in microgravity, BASS and Saffire revealed how solid fuel thermal degradation char layers fail under radiant heat flux. This led to novel halogen-free intumescent fire-retardant coatings and lightweight aircraft composite paneling.",
            "patents_and_impact": "Informed updated FAA aircraft cabin flammability criteria and advanced building facade fire barriers.",
            "metrics": {
                "flame_spread_retardation": "4.5x slower",
                "toxic_gas_suppression": "-60% CO/HCN",
                "weight_savings": "-18% vs traditional firewalls"
            }
        },
        {
            "id": "app-electric-flame-control",
            "title": "Electric Field Flame Stabilization for Industrial Furnaces & Gas Turbines",
            "microgravity_origin": "ACME (E-FIELD & CLEEN Experiments)",
            "facility": "ISS Combustion Integrated Rack",
            "terrestrial_domain": "Power Generation & Steel Manufacturing",
            "technology_readiness_level": "TRL 5",
            "summary": "ACME examined how external high-voltage electric fields interact with charged chemi-ions inside spherical diffusion flames without buoyancy interference. Earth applications include active electrical field steering to stabilize lean burner flames, reduce acoustic vibrations in gas turbines, and minimize fuel consumption.",
            "patents_and_impact": "Active R&D in electric flame management for low-carbon hydrogen/natural gas blend burners.",
            "metrics": {
                "co2_emissions_savings": "Up to -12%",
                "combustion_stability_margin": "+40%",
                "flame_blowout_resistance": "3x higher"
            }
        }
    ]
