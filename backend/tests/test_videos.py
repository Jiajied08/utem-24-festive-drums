"""Backend tests for /api/videos endpoints (Iteration 6)."""
import os
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
def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


class TestVideos:
    def test_get_videos_public(self):
        r = requests.get(f"{API}/videos", timeout=30)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_post_videos_requires_auth(self):
        r = requests.post(f"{API}/videos", json={"video_url": "https://youtu.be/dQw4w9WgXcQ"}, timeout=30)
        assert r.status_code == 401

    def test_post_invalid_url(self, auth_headers):
        r = requests.post(f"{API}/videos", json={"video_url": "notavideo"}, headers=auth_headers, timeout=30)
        assert r.status_code == 400
        assert "Unsupported video URL" in r.json().get("detail", "")

    def test_post_valid_youtube_shortlink(self, auth_headers):
        r = requests.post(
            f"{API}/videos",
            json={"video_url": "https://youtu.be/dQw4w9WgXcQ", "title_en": "TEST_video"},
            headers=auth_headers,
            timeout=30,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["embed_url"] == "https://www.youtube.com/embed/dQw4w9WgXcQ"
        assert data["title_en"] == "TEST_video"
        assert "id" in data
        vid = data["id"]

        # verify persistence via GET
        lst = requests.get(f"{API}/videos", timeout=30).json()
        assert any(v["id"] == vid for v in lst)

        # delete (soft)
        dr = requests.delete(f"{API}/videos/{vid}", headers=auth_headers, timeout=30)
        assert dr.status_code == 200

        lst2 = requests.get(f"{API}/videos", timeout=30).json()
        assert not any(v["id"] == vid for v in lst2), "Soft-deleted video should not appear in GET"

    def test_delete_requires_auth(self):
        r = requests.delete(f"{API}/videos/nonexistent-id", timeout=30)
        assert r.status_code == 401


class TestAboutRelated:
    def test_history_endpoint_still_works(self):
        # About page fetches /api/history
        r = requests.get(f"{API}/history", timeout=30)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_club_info(self):
        r = requests.get(f"{API}/club-info", timeout=30)
        assert r.status_code == 200
