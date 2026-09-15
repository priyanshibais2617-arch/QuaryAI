"""Microsoft Planetary Computer STAC Satellite Imagery Client.

Wrapper around pystac-client and planetary-computer for searching satellite imagery
catalogs (e.g. Sentinel-2 L2A).
"""
from typing import Optional, List, Dict, Any
from app.config import settings

PLANETARY_COMPUTER_STAC_URL = "https://planetarycomputer.microsoft.com/api/stac/v1"


class PlanetaryComputerClient:
    """Client wrapper for Microsoft Planetary Computer STAC API."""

    def __init__(
        self,
        subscription_key: Optional[str] = None,
        stac_url: str = PLANETARY_COMPUTER_STAC_URL,
    ):
        self.stac_url = stac_url
        self._subscription_key = subscription_key or settings.PLANETARY_COMPUTER_SUBSCRIPTION_KEY

    @property
    def is_authenticated(self) -> bool:
        """Returns True if a subscription key is configured."""
        return bool(self._subscription_key)

    def search_sentinel2(
        self,
        bbox: List[float],
        date_range: str,
        max_items: int = 5,
        collections: Optional[List[str]] = None,
        query: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """Search Sentinel-2 L2A imagery metadata on Planetary Computer.
        
        Args:
            bbox: Bounding box in [min_lon, min_lat, max_lon, max_lat] coordinates.
            date_range: ISO-8601 interval, e.g. "2024-01-01/2024-01-15" or single date.
            max_items: Maximum number of STAC items to return (scaffolding metadata only).
            collections: STAC collection list (defaults to ['sentinel-2-l2a']).
            query: Optional STAC attribute filters (e.g. {'eo:cloud_cover': {'lt': 20}}).
            
        Returns:
            List of structured metadata dictionaries containing item id, datetime,
            bbox, properties, and available asset keys.
            (Assets are NOT downloaded or signed in this scaffolding phase).
        """
        import pystac_client
        import planetary_computer as pc

        modifier = pc.sign_inplace if self._subscription_key else None
        
        headers = {}
        if self._subscription_key:
            headers["Ocp-Apim-Subscription-Key"] = self._subscription_key

        catalog = pystac_client.Client.open(
            self.stac_url,
            headers=headers if headers else None,
            modifier=modifier,
        )

        search = catalog.search(
            collections=collections or ["sentinel-2-l2a"],
            bbox=bbox,
            datetime=date_range,
            max_items=max_items,
            query=query,
        )

        results = []
        for item in search.items():
            results.append({
                "id": item.id,
                "datetime": item.datetime.isoformat() if item.datetime else None,
                "bbox": item.bbox,
                "collection": item.collection_id,
                "properties": {
                    "datetime": item.properties.get("datetime"),
                    "platform": item.properties.get("platform"),
                    "cloud_cover": item.properties.get("eo:cloud_cover"),
                    "constellation": item.properties.get("constellation"),
                },
                "assets": list(item.assets.keys()),
            })

        return results


def get_satellite_client(subscription_key: Optional[str] = None) -> PlanetaryComputerClient:
    """Convenience getter for PlanetaryComputerClient."""
    return PlanetaryComputerClient(subscription_key=subscription_key)
