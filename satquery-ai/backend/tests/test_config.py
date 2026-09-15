import pytest
from app.clients.openai_client import OpenAIClientWrapper


def test_get_config_status_unconfigured(client):
    """Test that GET /api/v1/config/status returns booleans and provider name only."""
    response = client.get("/api/v1/config/status")
    assert response.status_code == 200
    data = response.json()

    assert "openai_configured" in data
    assert isinstance(data["openai_configured"], bool)
    assert data["openai_configured"] is False

    assert "planetary_computer_configured" in data
    assert isinstance(data["planetary_computer_configured"], bool)
    assert data["planetary_computer_configured"] is False

    assert "satellite_provider" in data
    assert data["satellite_provider"] == "planetary_computer"

    # Security check: verify no key-like string appears anywhere in the response text
    raw_text = response.text.lower()
    for forbidden in ["sk-", "key-", "secret", "bearer"]:
        assert forbidden not in raw_text


def test_openai_client_wrapper_unconfigured_error():
    """Verify wrapper raises clear ValueError when called without an API key."""
    wrapper = OpenAIClientWrapper(api_key=None)
    assert wrapper.is_configured is False

    with pytest.raises(ValueError) as exc_info:
        wrapper.get_client()

    assert "OpenAI API key is not configured" in str(exc_info.value)
    assert "OPENAI_API_KEY" in str(exc_info.value)


def test_openai_client_wrapper_configured_check():
    """Verify wrapper reports is_configured=True when key is provided without invoking API."""
    wrapper = OpenAIClientWrapper(api_key="mock-placeholder-key")
    assert wrapper.is_configured is True
