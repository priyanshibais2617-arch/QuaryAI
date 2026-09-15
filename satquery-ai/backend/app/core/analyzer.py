"""SatQuery AI - Deterministic Input Analyzer (Ported from src/ai/inputAnalyzer.js)"""
from typing import List, Dict, Any

def analyze_input(inputs: List[Any] = None, options: Dict[str, Any] = None) -> Dict[str, Any]:
    if inputs is None:
        inputs = []
    if options is None:
        options = {}

    image_count = len(inputs) if isinstance(inputs, list) else 0

    modalities: List[str] = []
    for idx, img in enumerate(inputs):
        if isinstance(img, str):
            lower = img.lower()
            if "sar" in lower or "sentinel-1" in lower or "radar" in lower:
                modalities.append("SAR")
            elif "landsat" in lower or "multispectral" in lower:
                modalities.append("Multispectral")
            else:
                modalities.append("Optical")
            continue

        if isinstance(img, dict):
            mod = img.get("modality")
            if mod and isinstance(mod, str):
                lower_mod = mod.lower()
                if "sar" in lower_mod or "radar" in lower_mod:
                    modalities.append("SAR")
                    continue
                if "multispectral" in lower_mod:
                    modalities.append("Multispectral")
                    continue
                modalities.append("Optical")
                continue

            name = img.get("name") or img.get("filename")
            if name and isinstance(name, str):
                lower_name = name.lower()
                if "sar" in lower_name or "sentinel-1" in lower_name or "radar" in lower_name:
                    modalities.append("SAR")
                    continue
                if "landsat" in lower_name or "multispectral" in lower_name:
                    modalities.append("Multispectral")
                    continue
                modalities.append("Optical")
                continue

            if idx == 1 and options.get("pairType") == "optical_sar":
                modalities.append("SAR")
            else:
                modalities.append("Optical")
        else:
            modalities.append("Optical")

    has_optical = any(m == "Optical" or m == "Multispectral" for m in modalities)
    has_sar = any(m == "SAR" for m in modalities)
    is_cross_modal = has_optical and has_sar

    is_temporal = False
    if image_count == 2 and not is_cross_modal:
        is_temporal = True
    elif options.get("temporal") is True or options.get("analysisType") == "bitemporal":
        is_temporal = True

    if image_count == 1:
        input_type = "single"
    elif image_count == 2:
        if is_cross_modal:
            input_type = "cross_modal_pair"
        else:
            input_type = "bitemporal_pair"
    elif image_count > 2:
        input_type = "multi_image_stack"
    else:
        input_type = "empty"

    detected_modality_summary = "Optical"
    if is_cross_modal:
        detected_modality_summary = "Optical + SAR"
    elif len(modalities) > 0:
        detected_modality_summary = ", ".join(modalities)

    return {
        "imageCount": image_count,
        "modalities": modalities,
        "modalitySummary": detected_modality_summary,
        "temporal": is_temporal,
        "crossModal": is_cross_modal,
        "inputType": input_type,
        "compatible": image_count > 0,
        "hasOptical": has_optical,
        "hasSAR": has_sar,
        "rawInputs": inputs,
    }
