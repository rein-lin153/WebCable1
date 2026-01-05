// src/services/api.js

// 假设后端运行在本地，生产环境需替换为真实域名
const API_BASE_URL = "http://localhost:8000"; 

export const calculateCable = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/calculate/sizing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Calculation failed");
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const checkFakeCable = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/check/fake`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Verification failed");
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};