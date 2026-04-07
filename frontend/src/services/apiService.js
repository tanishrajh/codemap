const API_URL = 'http://localhost:3000/api';

/**
 * Sends a repository analysis request to the backend.
 * Handles both GitHub URLs and local ZIP file uploads via FormData.
 * 
 * @param {FormData} formData - Contains 'type', 'goal', and either 'repoUrl' or 'file'
 * @returns {Promise<Object>} - The analysis result graph or an error object.
 */
export async function processRepository(formData) {
    try {
        const response = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { error: errorData.message || 'Analysis failed. Please check the URL or file and try again.' };
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return { error: 'Unable to connect to the analysis engine. Ensure the backend is running on port 3000.' };
    }
}
