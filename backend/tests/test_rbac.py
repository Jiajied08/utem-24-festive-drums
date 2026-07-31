"""RBAC + password change + admin management + transfer-master tests."""
import os
import pytest
import requests
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://beats-utem.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

MASTER_EMAIL = "ding.jiae@gmail.com"
MASTER_PASSWORD = "Utem24Drum!"


def _login(email, password):
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=30)
    return r


@pytest.fixture(scope="module")
def master_token():
    r = _login(MASTER_EMAIL, MASTER_PASSWORD)
    assert r.status_code == 200, f"master login failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["user"]["role"] == "master", f"seeded admin should be master, got {data['user'].get('role')}"
    return data["session_token"]


@pytest.fixture(scope="module")
def master_headers(master_token):
    return {"Authorization": f"Bearer {master_token}"}


# --- 1) Login / me returns role ---
class TestAuthRole:
    def test_login_returns_role(self):
        r = _login(MASTER_EMAIL, MASTER_PASSWORD)
        assert r.status_code == 200
        u = r.json()["user"]
        assert u["email"] == MASTER_EMAIL
        assert u["role"] == "master"

    def test_me_returns_role(self, master_headers):
        r = requests.get(f"{API}/auth/me", headers=master_headers, timeout=30)
        assert r.status_code == 200
        assert r.json()["role"] == "master"


# --- 2) Admin management (master-only) ---
class TestAdminCRUD:
    created_id = None
    created_email = f"test_admin_{uuid.uuid4().hex[:8]}@example.com"
    created_password = "TestPass123!"

    def test_list_admins_requires_auth(self):
        r = requests.get(f"{API}/admins", timeout=30)
        assert r.status_code == 401

    def test_list_admins_as_master(self, master_headers):
        r = requests.get(f"{API}/admins", headers=master_headers, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert any(u["email"] == MASTER_EMAIL and u["role"] == "master" for u in data)

    def test_create_admin_rejects_short_password(self, master_headers):
        r = requests.post(f"{API}/admins", headers=master_headers,
                          json={"email": f"short_{uuid.uuid4().hex[:6]}@x.com", "password": "short", "name": "S"},
                          timeout=30)
        assert r.status_code == 400

    def test_create_admin_success(self, master_headers):
        r = requests.post(f"{API}/admins", headers=master_headers,
                          json={"email": TestAdminCRUD.created_email,
                                "password": TestAdminCRUD.created_password,
                                "name": "TEST_Admin"},
                          timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == TestAdminCRUD.created_email
        assert data["role"] == "admin"
        assert "user_id" in data
        TestAdminCRUD.created_id = data["user_id"]

    def test_create_admin_duplicate(self, master_headers):
        r = requests.post(f"{API}/admins", headers=master_headers,
                          json={"email": TestAdminCRUD.created_email,
                                "password": TestAdminCRUD.created_password, "name": "dup"},
                          timeout=30)
        assert r.status_code == 409

    def test_non_master_forbidden(self):
        # login as the newly-created admin
        r = _login(TestAdminCRUD.created_email, TestAdminCRUD.created_password)
        assert r.status_code == 200
        assert r.json()["user"]["role"] == "admin"
        tok = r.json()["session_token"]
        h = {"Authorization": f"Bearer {tok}"}
        # list admins
        assert requests.get(f"{API}/admins", headers=h, timeout=30).status_code == 403
        # create admin
        assert requests.post(f"{API}/admins", headers=h,
                             json={"email": "z@z.com", "password": "12345678"}, timeout=30).status_code == 403

    def test_master_cannot_delete_self(self, master_headers):
        me = requests.get(f"{API}/auth/me", headers=master_headers).json()
        r = requests.delete(f"{API}/admins/{me['user_id']}", headers=master_headers, timeout=30)
        assert r.status_code == 400

    def test_delete_unknown_returns_404(self, master_headers):
        r = requests.delete(f"{API}/admins/user_nonexistent_xyz", headers=master_headers, timeout=30)
        assert r.status_code == 404

    def test_delete_admin_success(self, master_headers):
        assert TestAdminCRUD.created_id
        r = requests.delete(f"{API}/admins/{TestAdminCRUD.created_id}", headers=master_headers, timeout=30)
        assert r.status_code == 200
        # verify gone
        listing = requests.get(f"{API}/admins", headers=master_headers).json()
        assert not any(u["user_id"] == TestAdminCRUD.created_id for u in listing)


# --- 3) Password change ---
class TestPasswordChange:
    tmp_email = f"pwd_test_{uuid.uuid4().hex[:8]}@example.com"
    tmp_pw = "InitialPass1!"
    new_pw = "ChangedPass1!"
    tmp_id = None

    def test_setup_create_admin(self, master_headers):
        r = requests.post(f"{API}/admins", headers=master_headers,
                          json={"email": self.tmp_email, "password": self.tmp_pw, "name": "TEST_pwd"},
                          timeout=30)
        assert r.status_code == 200
        TestPasswordChange.tmp_id = r.json()["user_id"]

    def test_change_password_requires_auth(self):
        r = requests.post(f"{API}/auth/change-password",
                          json={"old_password": "x", "new_password": "yyyyyyyy"}, timeout=30)
        assert r.status_code == 401

    def test_change_password_wrong_old(self):
        tok = _login(self.tmp_email, self.tmp_pw).json()["session_token"]
        r = requests.post(f"{API}/auth/change-password",
                          headers={"Authorization": f"Bearer {tok}"},
                          json={"old_password": "wrong!!!", "new_password": "abcdefgh"}, timeout=30)
        assert r.status_code == 401

    def test_change_password_short_new(self):
        tok = _login(self.tmp_email, self.tmp_pw).json()["session_token"]
        r = requests.post(f"{API}/auth/change-password",
                          headers={"Authorization": f"Bearer {tok}"},
                          json={"old_password": self.tmp_pw, "new_password": "short"}, timeout=30)
        assert r.status_code == 400

    def test_change_password_success_and_invalidates_other_sessions(self):
        # login twice — two tokens
        tok_a = _login(self.tmp_email, self.tmp_pw).json()["session_token"]
        tok_b = _login(self.tmp_email, self.tmp_pw).json()["session_token"]
        assert tok_a != tok_b

        # change password using tok_b
        r = requests.post(f"{API}/auth/change-password",
                          headers={"Authorization": f"Bearer {tok_b}"},
                          json={"old_password": self.tmp_pw, "new_password": self.new_pw}, timeout=30)
        assert r.status_code == 200

        # tok_a should be invalid
        r_a = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {tok_a}"})
        assert r_a.status_code == 401
        # tok_b (current) still works
        r_b = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {tok_b}"})
        assert r_b.status_code == 200

        # new password logs in
        r_new = _login(self.tmp_email, self.new_pw)
        assert r_new.status_code == 200
        # old password does not
        assert _login(self.tmp_email, self.tmp_pw).status_code == 401

    def test_cleanup(self, master_headers):
        if TestPasswordChange.tmp_id:
            requests.delete(f"{API}/admins/{TestPasswordChange.tmp_id}", headers=master_headers)


# --- 4) Transfer master ---
class TestTransferMaster:
    target_email = f"transfer_target_{uuid.uuid4().hex[:8]}@example.com"
    target_pw = "TargetPass1!"
    target_id = None

    def test_setup_create_target(self, master_headers):
        r = requests.post(f"{API}/admins", headers=master_headers,
                          json={"email": self.target_email, "password": self.target_pw, "name": "TEST_target"},
                          timeout=30)
        assert r.status_code == 200
        TestTransferMaster.target_id = r.json()["user_id"]

    def test_non_master_forbidden(self):
        tok = _login(self.target_email, self.target_pw).json()["session_token"]
        r = requests.post(f"{API}/admins/{self.target_id}/transfer-master",
                          headers={"Authorization": f"Bearer {tok}"},
                          json={"password": self.target_pw}, timeout=30)
        assert r.status_code == 403

    def test_wrong_master_password(self, master_headers):
        r = requests.post(f"{API}/admins/{self.target_id}/transfer-master",
                          headers=master_headers, json={"password": "WRONG!!!"}, timeout=30)
        assert r.status_code == 401

    def test_transfer_and_verify(self, master_headers):
        # transfer to target
        r = requests.post(f"{API}/admins/{self.target_id}/transfer-master",
                          headers=master_headers, json={"password": MASTER_PASSWORD}, timeout=30)
        assert r.status_code == 200, r.text

        # login as new master
        r_tgt = _login(self.target_email, self.target_pw)
        assert r_tgt.status_code == 200
        assert r_tgt.json()["user"]["role"] == "master"
        new_master_tok = r_tgt.json()["session_token"]

        # listing: exactly one master (the target), previous master now 'admin'
        listing = requests.get(f"{API}/admins",
                               headers={"Authorization": f"Bearer {new_master_tok}"}).json()
        masters = [u for u in listing if u["role"] == "master"]
        assert len(masters) == 1
        assert masters[0]["email"] == self.target_email
        prev = next(u for u in listing if u["email"] == MASTER_EMAIL)
        assert prev["role"] == "admin"

        # transfer back
        prev_id = prev["user_id"]
        r_back = requests.post(f"{API}/admins/{prev_id}/transfer-master",
                               headers={"Authorization": f"Bearer {new_master_tok}"},
                               json={"password": self.target_pw}, timeout=30)
        assert r_back.status_code == 200

        # confirm master restored
        r_login = _login(MASTER_EMAIL, MASTER_PASSWORD)
        assert r_login.status_code == 200
        assert r_login.json()["user"]["role"] == "master"

    def test_cleanup(self, master_headers):
        # re-login as master to make sure we have fresh token
        tok = _login(MASTER_EMAIL, MASTER_PASSWORD).json()["session_token"]
        h = {"Authorization": f"Bearer {tok}"}
        if TestTransferMaster.target_id:
            requests.delete(f"{API}/admins/{TestTransferMaster.target_id}", headers=h)
