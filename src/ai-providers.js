const AI_CONFIG = {
  deepseek: {
    name: 'DeepSeek',
    url: 'https://api.deepseek.com/v1/chat/completions',
    buildHeaders: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }),
    buildPayload: (model, messages) => ({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 2048,
      stream: false,
    }),
    extractContent: (response) => response.data.choices[0].message.content,
    defaultModel: 'deepseek-chat',
    description: 'DeepSeek AI - Fast and reliable AI service'
  },
  openai: {
    name: 'OpenAI',
    url: 'https://api.openai.com/v1/chat/completions',
    buildHeaders: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }),
    buildPayload: (model, messages) => ({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 2048,
      stream: false,
    }),
    extractContent: (response) => response.data.choices[0].message.content,
    defaultModel: 'gpt-4-turbo',
    description: 'OpenAI GPT - Industry leading AI models'
  },
  openrouter: {
    name: 'OpenRouter',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    buildHeaders: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/your-repo/pr-automator',
      'X-Title': 'PR Automator',
    }),
    buildPayload: (model, messages) => ({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
    extractContent: (response) => response.data.choices[0].message.content,
    defaultModel: 'google/gemini-pro',
    description: 'OpenRouter - Access to multiple AI providers'
  },
  gemini: {
    name: 'Google Gemini',
    url: (model, apiKey) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    buildHeaders: () => ({
      'Content-Type': 'application/json',
    }),
    buildPayload: (model, messages) => {
      const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
      const userPrompt = messages.find(m => m.role === 'user')?.content || '';
      
      return {
        contents: [{
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      };
    },
    extractContent: (response) => response.data.candidates[0].content.parts[0].text,
    defaultModel: 'gemini-pro',
    description: 'Google Gemini - Advanced AI from Google'
  },
};

/**
 * Get available AI providers
 * @returns {object} Available providers
 */
function getAvailableProviders() {
  return AI_CONFIG;
}

/**
 * Get provider configuration
 * @param {string} provider - Provider name
 * @returns {object|null} Provider configuration
 */
function getProviderConfig(provider) {
  return AI_CONFIG[provider] || null;
}

/**
 * Validate provider
 * @param {string} provider - Provider name
 * @returns {boolean} True if provider is valid
 */
function isValidProvider(provider) {
  return provider in AI_CONFIG;
}

/**
 * Get provider names for display
 * @returns {string[]} List of provider names
 */
function getProviderNames() {
  return Object.keys(AI_CONFIG);
}

module.exports = {
  AI_CONFIG,
  getAvailableProviders,
  getProviderConfig,
  isValidProvider,
  getProviderNames
}; 