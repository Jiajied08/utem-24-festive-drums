"""Backend tests for UTeM 24FD - auth (email/password JWT-style) and public endpoints."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://beats-utem.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "ding.jiae@gmail.com"
ADMIN_PASSWORD = "Utem24Drum!"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "session_token" in data and isinstance(data["session_token"], str) and len(data["session_token"]) > 20
    assert data["user"]["email"] == ADMIN_EMAIL
    return data["session_token"]


# ---- Auth ----
class TestAuth:
    def test_login_success(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        assert "password_hash" not in data["user"]

    def test_login_wrong_password(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong-pass"}, timeout=30)
        assert r.status_code == 401
        assert "Invalid" in r.json().get("detail", "")

    def test_login_unknown_email(self, session):
        r = session.post(f"{API}/auth/login", json={"email": "nobody@example.com", "password": "x"}, timeout=30)
        assert r.status_code == 401

    def test_login_case_insensitive_email(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL.upper(), "password": ADMIN_PASSWORD}, timeout=30)
        assert r.status_code == 200

    def test_auth_me_with_token(self, session, token):
        r = session.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"}, timeout=30)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_auth_me_without_token(self, session):
        r = requests.get(f"{API}/auth/me", timeout=30)
        assert r.status_code == 401

    def test_auth_me_invalid_token(self, session):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": "Bearer nope-invalid"}, timeout=30)
        assert r.status_code == 401


# ---- Public endpoints (no auth) ----
class TestPublicEndpoints:
    @pytest.mark.parametrize("path", [
        "/settings", "/club-info", "/history", "/gallery",
        "/packages", "/achievements", "/team", "/instagram-posts", "/hero-images",
    ])
    def test_public_get(self, path):
        r = requests.get(f"{API}{path}", timeout=30)
        assert r.status_code == 200, f"{path} -> {r.status_code}: {r.text[:200]}"
        # All list endpoints return list; settings/club-info return object
        body = r.json()
        assert body is not None


# ---- Protected endpoints require auth ----
class TestProtected:
    @pytest.mark.parametrize("path", ["/enquiries", "/join-us"])
    def test_requires_auth(self, path):
        r = requests.get(f"{API}{path}", timeout=30)
        assert r.status_code == 401

    def test_enquiries_with_token(self, token):
        r = requests.get(f"{API}/enquiries", headers={"Authorization": f"Bearer {token}"}, timeout=30)
        assert r.status_code == 200
        assert isinstance(r.json(), list)
