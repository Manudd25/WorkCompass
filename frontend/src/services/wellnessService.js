import { API_BASE } from "../../services/apiBase.js";

// Get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Mood Entry API calls
export const getMoodEntries = async () => {
  const response = await fetch(`${API_BASE}/api/wellness/mood-entries`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch mood entries');
  }

  return response.json();
};

export const createMoodEntry = async (entryData) => {
  const response = await fetch(`${API_BASE}/api/wellness/mood-entries`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(entryData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create mood entry');
  }

  return response.json();
};

export const updateMoodEntry = async (id, entryData) => {
  const response = await fetch(`${API_BASE}/api/wellness/mood-entries/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(entryData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update mood entry');
  }

  return response.json();
};

export const deleteMoodEntry = async (id) => {
  const response = await fetch(`${API_BASE}/api/wellness/mood-entries/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete mood entry');
  }

  return response.json();
};

// Wellness Assessment API calls
export const getWellnessAssessments = async () => {
  const response = await fetch(`${API_BASE}/api/wellness/assessments`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch wellness assessments');
  }

  return response.json();
};

export const createWellnessAssessment = async (assessmentData) => {
  const response = await fetch(`${API_BASE}/api/wellness/assessments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(assessmentData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create wellness assessment');
  }

  return response.json();
};

export const updateWellnessAssessment = async (id, assessmentData) => {
  const response = await fetch(`${API_BASE}/api/wellness/assessments/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(assessmentData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update wellness assessment');
  }

  return response.json();
};

export const deleteWellnessAssessment = async (id) => {
  const response = await fetch(`${API_BASE}/api/wellness/assessments/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete wellness assessment');
  }

  return response.json();
};

