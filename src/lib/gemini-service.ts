
const GEMINI_API_KEY = 'AIzaSyCSdE-kAUQdB73f8dKn5uKOb0qaZrh3OJA';

interface SuggestionResponse {
  frequency: number;
  presetName: string;
  youtubeQuery: string;
  ambient?: string;
  explanation: string;
}

export async function getMoodSuggestion(userPrompt: string): Promise<SuggestionResponse> {
  try {
    const systemPrompt = `You are an AI that helps users find the perfect combination of music and binaural beats for their needs.
    Based on the user's input, suggest:
    1. A binaural beat frequency (between 1 and 40Hz)
    2. A preset name (Sleep, Focus, Relaxation, Meditation, Energy)
    3. A YouTube search query for compatible music
    4. Optional: An ambient sound (Rain, Ocean, Forest, White Noise)
    5. A brief 1-sentence explanation of your recommendation.
    Format your response as a valid JSON object with the following keys: frequency, presetName, youtubeQuery, ambient, explanation.
    Do not include any text outside the JSON.`;

    const prompt = `User mood or request: "${userPrompt}"`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt },
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get AI suggestion');
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    
    // Extract the JSON part from the response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error getting AI suggestion:', error);
    
    // Return fallback suggestion if AI fails
    return {
      frequency: 7.83,
      presetName: "Relaxation",
      youtubeQuery: "ambient relaxation music",
      ambient: "Rain",
      explanation: "This is a fallback suggestion as we couldn't process your request."
    };
  }
}
