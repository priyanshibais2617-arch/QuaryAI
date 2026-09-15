def test_get_catalog_images(client):
    response = client.get("/api/v1/catalog/images")
    assert response.status_code == 200
    data = response.json()

    assert "images" in data
    assert "total" in data
    assert data["total"] == 6
    assert len(data["images"]) == 6

    # Verify first image attributes
    first = data["images"][0]
    assert first["id"] == "img-001"
    assert first["filename"] == "Delhi_NCR_UrbanExpansion_2024.tif"
    assert first["fileType"] == "GeoTIFF"
    assert first["modality"] == "Optical"
    assert first["sensor"] == "Sentinel-2 L2A"
    assert first["date"] == "2024-03-15"
    assert "status" in first

def test_catalog_images_modalities(client):
    response = client.get("/api/v1/catalog/images")
    assert response.status_code == 200
    images = response.json()["images"]

    modalities = {img["modality"] for img in images}
    assert "Optical" in modalities
    assert "SAR" in modalities
    assert "Multispectral" in modalities
