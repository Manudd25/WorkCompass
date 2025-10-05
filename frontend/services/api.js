const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

// Helper function to get auth headers
const getAuthHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token && { Authorization: `Bearer ${token}` })
});

// Auth endpoints
export async function signup(userData) {
  const response = await fetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Signup failed');
  }
  
  return response.json();
}

export async function login(credentials) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  
  return response.json();
}

export async function googleAuth(idToken) {
  const response = await fetch(`${API_BASE}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Google authentication failed');
  }
  
  return response.json();
}

// Profile endpoints
export async function getProfile(token) {
  const response = await fetch(`${API_BASE}/api/auth/profile`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get profile');
  }
  
  return response.json();
}

export async function updateProfile(profileData, token) {
  const response = await fetch(`${API_BASE}/api/auth/profile`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(profileData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update profile');
  }
  
  return response.json();
}

export async function changePassword(passwordData, token) {
  const response = await fetch(`${API_BASE}/api/auth/password`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(passwordData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to change password');
  }
  
  return response.json();
}

export async function deleteAccount(token) {
  const response = await fetch(`${API_BASE}/api/auth/profile`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete account');
  }
  
  return response.json();
}

// Application endpoints
export async function getApplications(token, candidateId = null) {
  const url = candidateId 
    ? `${API_BASE}/api/applications?candidateId=${encodeURIComponent(candidateId)}`
    : `${API_BASE}/api/applications`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get applications');
  }
  
  return response.json();
}

export async function createApplication(applicationData, token) {
  const response = await fetch(`${API_BASE}/api/applications`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(applicationData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create application');
  }
  
  return response.json();
}

export async function updateApplication(applicationId, applicationData, token) {
  const response = await fetch(`${API_BASE}/api/applications/${encodeURIComponent(applicationId)}`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(applicationData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update application');
  }
  
  return response.json();
}

export async function deleteApplication(applicationId, token) {
  const response = await fetch(`${API_BASE}/api/applications/${encodeURIComponent(applicationId)}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete application');
  }
  
  return response.json();
}

// Candidate management endpoints (recruiter only)
export async function createCandidate(candidateData, token) {
  const response = await fetch(`${API_BASE}/api/auth/candidates`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(candidateData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create candidate');
  }
  
  return response.json();
}

export async function getCandidates(token) {
  const response = await fetch(`${API_BASE}/api/auth/candidates`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get candidates');
  }
  
  return response.json();
}

export async function updateCandidate(candidateId, candidateData, token) {
  const response = await fetch(`${API_BASE}/api/auth/candidates/${encodeURIComponent(candidateId)}`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(candidateData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update candidate');
  }
  
  return response.json();
}

export async function deleteCandidate(candidateId, token) {
  const response = await fetch(`${API_BASE}/api/auth/candidates/${encodeURIComponent(candidateId)}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete candidate');
  }
  
  return response.json();
}
