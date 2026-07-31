"""Backend tests for Team Alumni Wall / Farewell feature (iteration 8)."""
import os
import io
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "ding.jiae@gmail.com"
ADMIN_PASSWORD = "Utem24Drum!"


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200
    return r.json()["session_token"]


@pytest.fixture(scope="module")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


class TestFarewellPatch:
    def test_patch_requires_auth(self):
        r = requests.patch(f"{API}/team/mem_captain/farewell",
                           json={"farewell_en": "x", "farewell_zh": "y"}, timeout=30)
        assert r.status_code == 401

    def test_patch_not_found(self, auth_headers):
        r = requests.patch(f"{API}/team/does_not_exist_xyz/farewell",
                           json={"farewell_en": "x", "farewell_zh": "y"},
                           headers=auth_headers, timeout=30)
        assert r.status_code == 404

    def test_patch_updates_both_fields(self, auth_headers):
        # Update captain
        payload = {"farewell_en": "Farewell EN test", "farewell_zh": "毕业寄语测试"}
        r = requests.patch(f"{API}/team/mem_captain/farewell", json=payload,
                           headers=auth_headers, timeout=30)
        assert r.status_code == 200
        doc = r.json()
        assert doc["farewell_en"] == payload["farewell_en"]
        assert doc["farewell_zh"] == payload["farewell_zh"]
        assert doc["id"] == "mem_captain"
        assert "_id" not in doc

        # Verify via GET /api/team
        r2 = requests.get(f"{API}/team", timeout=30)
        assert r2.status_code == 200
        members = r2.json()
        cap = next((m for m in members if m["id"] == "mem_captain"), None)
        assert cap is not None
        assert cap["farewell_en"] == payload["farewell_en"]
        assert cap["farewell_zh"] == payload["farewell_zh"]

    def test_get_team_has_farewell_fields(self):
        r = requests.get(f"{API}/team", timeout=30)
        assert r.status_code == 200
        members = r.json()
        assert isinstance(members, list) and len(members) > 0
        # At least captain must have farewell fields populated
        cap = next((m for m in members if m["id"] == "mem_captain"), None)
        assert cap is not None
        assert "farewell_en" in cap and "farewell_zh" in cap


class TestTeamCreateWithFarewell:
    created_id = None

    def test_post_team_with_farewell(self, token):
        # Create a member via multipart with farewell fields, no image
        files = {}
        data = {
            "name_en": "TEST_FAREWELL_MEMBER",
            "name_zh": "测试成员",
            "position_en": "Test",
            "position_zh": "测试",
            "session": "2025/2026",
            "order": "999",
            "farewell_en": "Bye friends",
            "farewell_zh": "再见朋友",
        }
        r = requests.post(f"{API}/team", data=data, files=files,
                          headers={"Authorization": f"Bearer {token}"}, timeout=30)
        # Accept 200 or 201
        assert r.status_code in (200, 201), r.text
        body = r.json()
        assert body["farewell_en"] == "Bye friends"
        assert body["farewell_zh"] == "再见朋友"
        assert body["name_en"] == "TEST_FAREWELL_MEMBER"
        TestTeamCreateWithFarewell.created_id = body["id"]

        # verify via GET
        r2 = requests.get(f"{API}/team", timeout=30)
        member = next((m for m in r2.json() if m["id"] == body["id"]), None)
        assert member is not None
        assert member["farewell_en"] == "Bye friends"
        assert member["farewell_zh"] == "再见朋友"

    def test_cleanup_delete(self, auth_headers):
        if TestTeamCreateWithFarewell.created_id:
            r = requests.delete(f"{API}/team/{TestTeamCreateWithFarewell.created_id}",
                                headers=auth_headers, timeout=30)
            assert r.status_code == 200
