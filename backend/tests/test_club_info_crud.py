"""Tests for PUT /api/club-info (admin) + GET persistence check."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://beats-utem.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_EMAIL = "ding.jiae@gmail.com"
ADMIN_PASSWORD = "Utem24Drum!"


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()["session_token"]


@pytest.fixture(scope="module")
def original():
    r = requests.get(f"{API}/club-info", timeout=30)
    assert r.status_code == 200
    return r.json()


def test_put_requires_auth():
    r = requests.put(f"{API}/club-info", json={"about_en": "x"}, timeout=30)
    assert r.status_code == 401


def test_put_and_persist(token, original):
    marker = f"TEST_CLUB_INFO_{int(time.time())}"
    payload = {
        "established_year": 2011,
        "performances_count": 42,
        "members_count": 77,
        "about_en": f"About EN {marker}",
        "about_zh": f"关于 {marker}",
        "mission_en": f"Mission EN {marker}",
        "mission_zh": f"使命 {marker}",
    }
    r = requests.put(
        f"{API}/club-info", json=payload,
        headers={"Authorization": f"Bearer {token}"}, timeout=30,
    )
    assert r.status_code == 200, r.text

    # GET back and verify persistence
    r2 = requests.get(f"{API}/club-info", timeout=30)
    assert r2.status_code == 200
    got = r2.json()
    for k, v in payload.items():
        assert got.get(k) == v, f"{k}: expected {v!r}, got {got.get(k)!r}"

    # Restore original values so preview UI isn't left with TEST data
    restore = {k: original.get(k, payload[k]) for k in payload}
    rr = requests.put(
        f"{API}/club-info", json=restore,
        headers={"Authorization": f"Bearer {token}"}, timeout=30,
    )
    assert rr.status_code == 200
