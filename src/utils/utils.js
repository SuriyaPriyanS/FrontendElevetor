// src/utils/utils.js
export const generateUUID = () => crypto.randomUUID();

export const withExponentialBackoff = async (fn, retries = 5, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i < retries - 1) {
        console.warn(`Retry ${i + 1}/${retries}. Waiting ${delay}ms...`, error.message);
        await new Promise(res => setTimeout(res, delay));
        delay *= 2;
      } else {
        throw error;
      }
    }
  }
};