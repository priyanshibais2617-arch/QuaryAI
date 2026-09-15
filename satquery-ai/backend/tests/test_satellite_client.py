import pytest
from app.clients.satellite_client import PlanetaryComputerClient, get_satellite_client


def test_satellite_client_initialization():
    """Verify satellite client initialization and authentication flag."""
    client_anon = PlanetaryComputerClient(subscription_key=None)
    assert client_anon.is_authenticated is False
    assert "planetarycomputer.microsoft.com" in client_anon.stac_url

    client_auth = PlanetaryComputerClient(subscription_key="mock-test-key")
    assert client_auth.is_authenticated is True


@pytest.mark.network
def test_planetary_computer_stac_search_real_catalog():
    """Test STAC search against the real Microsoft Planetary Computer public catalog.
    
    Marked with @pytest.mark.network so it can be skipped in offline/CI environments.
    """
    client = get_satellite_client()

    # Bounding box around Mumbai coastal region
    bbox = [72.80, 18.90, 73.00, 19.10]
    date_range = "2024-01-01/2024-01-31"

    results = client.search_sentinel2(bbox=bbox, date_range=date_range, max_items=2)

    assert isinstance(results, list)
    assert len(results) > 0, "Expected at least one Sentinel-2 scene from public STAC catalog"

    item = results[0]
    assert "id" in item
    assert "datetime" in item
    assert "bbox" in item
    assert item["collection"] == "sentinel-2-l2a"
    assert "properties" in item
    assert "assets" in item
    assert len(item["assets"]) > 0

    # Verify no local raster file was downloaded
    assert not hasattr(item, "data")
