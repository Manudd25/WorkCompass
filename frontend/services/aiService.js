import { API_BASE } from "./apiBase.js";

// Helper function to get auth headers
const getAuthHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token && { Authorization: `Bearer ${token}` })
});

// Generate application insights
export async function generateApplicationInsights(applicationId, token) {
  const response = await fetch(`${API_BASE}/api/ai/insights/${encodeURIComponent(applicationId)}`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate insights');
  }
  
  return response.json();
}

// Generate interview preparation
export async function generateInterviewPrep(applicationId, token) {
  const response = await fetch(`${API_BASE}/api/ai/interview-prep/${encodeURIComponent(applicationId)}`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate interview prep');
  }
  
  return response.json();
}

// AI Chat (authenticated users)
export async function aiChat(message, context, token) {
  const response = await fetch(`${API_BASE}/api/ai/chat`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ message, context }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'AI chat failed');
  }
  
  return response.json();
}

// Guest AI Chat (no authentication required)
export async function guestChat(message) {
  const response = await fetch(`${API_BASE}/api/ai/guest-chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Guest AI chat failed');
  }
  
  return response.json();
}

