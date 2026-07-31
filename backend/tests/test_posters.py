"""Backend tests for Event Posters (Iteration 7)."""
import io
import os
import pytest
import requests
from datetime import date, timedelta

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://beats-utem.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "ding.jiae@gmail.com"
ADMIN_PASSWORD = "Utem24Drum!"


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200
    return r.json()["session_token"]


def _tiny_png():
    # 1x1 red PNG
    import base64
    return base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
    )


class TestPostersPublic:
    def test_get_posters_public(self):
        r = requests.get(f"{API}/posters", timeout=30)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_get_posters_sorted_asc(self):
        r = requests.get(f"{API}/posters", timeout=30)
        assert r.status_code == 200
        items = r.json()
        dates = [(p.get("event_date") or "9999-12-31") for p in items]
        assert dates == sorted(dates), f"Not sorted asc: {dates}"

    def test_upcoming_filters_out_past(self):
        r = requests.get(f"{API}/posters", params={"upcoming": "true"}, timeout=30)
        assert r.status_code == 200
        today = date.today().isoformat()
        for p in r.json():
            assert (p.get("event_date") or "") >= today, f"past poster in upcoming: {p}"


class TestPostersAuth:
    def test_create_requires_auth(self):
        files = {"file": ("t.png", _tiny_png(), "image/png")}
        data = {"event_date": "2030-01-01"}
        r = requests.post(f"{API}/posters", files=files, data=data, timeout=30)
        assert r.status_code == 401

    def test_delete_requires_auth(self):
        r = requests.delete(f"{API}/posters/nope-id", timeout=30)
        assert r.status_code == 401


class TestPostersCRUD:
    created_id = None

    def test_create_poster(self, token):
        future_date = (date.today() + timedelta(days=30)).isoformat()
        files = {"file": ("test_poster.png", _tiny_png(), "image/png")}
        data = {
            "title_en": "TEST_Poster_UI",
            "title_zh": "测试海报",
            "event_date": future_date,
            "location": "TEST Venue",
            "event_link": "https://example.com/event",
        }
        r = requests.post(
            f"{API}/posters",
            files=files,
            data=data,
            headers={"Authorization": f"Bearer {token}"},
            timeout=60,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["id"].startswith("pos_")
        assert body["storage_path"]
        assert body["title_en"] == "TEST_Poster_UI"
        assert body["event_date"] == future_date
        assert body["is_active"] is True
        TestPostersCRUD.created_id = body["id"]

    def test_created_appears_in_upcoming(self, token):
        assert TestPostersCRUD.created_id
        r = requests.get(f"{API}/posters", params={"upcoming": "true"}, timeout=30)
        ids = [p["id"] for p in r.json()]
        assert TestPostersCRUD.created_id in ids

    def test_delete_soft_deletes(self, token):
        assert TestPostersCRUD.created_id
        r = requests.delete(
            f"{API}/posters/{TestPostersCRUD.created_id}",
            headers={"Authorization": f"Bearer {token}"},
            timeout=30,
        )
        assert r.status_code == 200
        # verify no longer in list
        r2 = requests.get(f"{API}/posters", timeout=30)
        ids = [p["id"] for p in r2.json()]
        assert TestPostersCRUD.created_id not in ids

    def test_delete_nonexistent_returns_404(self, token):
        r = requests.delete(
            f"{API}/posters/pos_does_not_exist",
            headers={"Authorization": f"Bearer {token}"},
            timeout=30,
        )
        assert r.status_code == 404
