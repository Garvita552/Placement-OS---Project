function getAuthToken() {
  return localStorage.getItem("authToken");
}

function requireAuth() {
  const token = getAuthToken();
  if (!token) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
  window.location.href = "login.html";
}

function setAuthUI() {
  const username = localStorage.getItem("authUser");
  const el = document.getElementById("usernameLabel");
  if (el && username) el.textContent = username;
}

