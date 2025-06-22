const { execSync } = require('child_process');
const fs = require('fs');
const axios = require('axios');
const { getProviderConfig } = require('./ai-providers');

/**
 * Build detailed instructions (Prompt) for AI
 * @param {string[]} files - List of changed files
 * @param {object} changes - Specific diff content for each file
 * @returns {string} - Constructed system prompt
 */
function buildAIPrompt(files, changes) {
  return `
You are an expert software developer and a master at writing clear, concise, and professional Pull Request descriptions.
Your task is to analyze the provided code changes (git diff) and generate a comprehensive PR description.

**Output Format Requirements:**
Please generate the content in Markdown format, strictly following this structure:

---
**Title:** A conventional commit style title (e.g., "feat:", "fix:", "docs:", "style:", "refactor:", "perf:", "test:"). Start with a relevant emoji.
**Overview:** A brief, high-level summary of what this PR accomplishes.
**Key Features Implemented:**
- 🌟 [Emoji] A bullet point list describing each major feature or change.
- 🐛 [Emoji] Highlight bug fixes.
- 🛠️ [Emoji] Detail refactoring or technical improvements.
**Technical Details:**
- Explain the "how" behind the changes. Mention specific files, functions, algorithms, or architectural decisions.
- If there are important dependencies or configuration changes, note them here.
**Future Enhancements:**
- (Optional) Suggest potential future improvements, next steps, or open questions related to these changes.
---

**Code Changes to Analyze:**
- **Files Changed:** ${files.join(', ')}
- **Detailed Diff:**
\`\`\`diff
${JSON.stringify(changes, null, 2)}
\`\`\`

Now, generate the PR description based on the changes provided.
`;
}

/**
 * Analyze code changes using a configured AI provider
 * @param {string[]} files - List of changed files
 * @param {object} changes - Specific diff content for each file
 * @param {string} aiProvider - AI provider name
 * @param {string} apiKey - API key
 * @param {string} model - Model name
 * @returns {Promise<string|null>} - AI-generated PR description or null
 */
async function analyzeChangesWithAI(files, changes, aiProvider, apiKey, model) {
  const providerConfig = getProviderConfig(aiProvider);
  if (!providerConfig) {
    console.error(`❌ Error: AI provider "${aiProvider}" is not configured.`);
    return null;
  }

  const systemPrompt = buildAIPrompt(files, changes);
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: "Please generate the PR description based on the provided context." }
  ];

  const url = typeof providerConfig.url === 'function' 
    ? providerConfig.url(model, apiKey) 
    : providerConfig.url;
    
  const headers = providerConfig.buildHeaders(apiKey);
  const payload = providerConfig.buildPayload(model, messages);

  try {
    console.log(`🔄 Contacting ${providerConfig.name} with model ${model}...`);
    const response = await axios.post(url, payload, { headers });
    return providerConfig.extractContent(response);
  } catch (error) {
    const errorMessage = error.response ? JSON.stringify(error.response.data, null, 2) : error.message;
    console.error(`❌ AI analysis with ${providerConfig.name} failed: ${errorMessage}`);
    return null;
  }
}

/**
 * Generate PR title and body
 * @param {string[]} files - List of changed files
 * @param {string} aiProvider - AI provider name
 * @param {string} apiKey - API key
 * @param {string} model - Model name
 * @returns {Promise<{title: string, body: string}|null>}
 */
async function generatePRDetails(files, aiProvider, apiKey, model) {
  console.log('🔄 Analyzing changes and generating PR details...');
  const changes = {};
  
  for (const file of files) {
    try {
      changes[file] = execSync(`git diff origin/main -- ${file}`).toString();
      console.log(`✅ Analyzed ${file}`);
    } catch (error) {
      console.log(`⚠️ Could not analyze ${file}: ${error.message}`);
      changes[file] = 'File changed but diff not available';
    }
  }
  
  const aiResponse = await analyzeChangesWithAI(files, changes, aiProvider, apiKey, model);
  if (aiResponse) {
    const lines = aiResponse.split('\n');
    let title = `feat: Default AI Generated Title`;
    let bodyStartIndex = 0;
    
    // Find the title, ignoring the '---' separators
    const titleLineIndex = lines.findIndex(line => line.toLowerCase().startsWith('**title:**'));
    
    if (titleLineIndex !== -1) {
      title = lines[titleLineIndex].substring('**title:**'.length).trim();
      bodyStartIndex = titleLineIndex + 1;
    } else {
      // Fallback for older format
      const oldTitleIndex = lines.findIndex(line => line.toLowerCase().startsWith('title:'));
      if (oldTitleIndex !== -1) {
        title = lines[oldTitleIndex].substring('title:'.length).trim();
        bodyStartIndex = oldTitleIndex + 1;
      }
    }
    
    const body = lines.slice(bodyStartIndex).join('\n').trim().replace(/^---\n/, '').replace(/\n---$/, '').trim();
    
    console.log('✅ AI analysis successful!');
    return { title, body };
  }

  console.error('❌ Could not generate PR details from AI. Aborting.');
  return null;
}

/**
 * Create PR using GitHub CLI
 * @param {{title: string, body: string}} prDetails - PR title and body
 */
function createPR({ title, body }) {
  try {
    // Write body to temporary file to avoid command injection and length limit issues
    const bodyFilePath = './pr_body.md';
    fs.writeFileSync(bodyFilePath, body);

    console.log('🚀 Creating PR on GitHub...');
    // Use --author flag to ensure correct attribution
    execSync(`gh pr create --title "${title}" --body-file "${bodyFilePath}"`, { stdio: 'inherit' });
    
    fs.unlinkSync(bodyFilePath); // Delete temporary file
    console.log('✅ PR created successfully!');
  } catch (error) {
    console.log('⚠️ PR creation failed. It might already exist. Checking...');
    try {
      // Check if current branch already has a PR
      const prUrl = execSync('gh pr view --json url --jq .url').toString().trim();
      console.log(`✅ An existing PR was found for this branch: ${prUrl}`);
    } catch {
      console.error('❌ Failed to create or find an existing PR. Please check your permissions and branch status.');
    }
  }
}

/**
 * Get changed files from git
 * @returns {string[]} List of changed files
 */
function getChangedFiles() {
  try {
    const files = execSync('git diff --name-only origin/main HEAD')
      .toString()
      .trim()
      .split('\n')
      .filter(Boolean);
    
    return files;
  } catch (error) {
    console.error('❌ Error getting changed files:', error.message);
    return [];
  }
}

/**
 * Check if git and gh CLI are available
 * @returns {boolean} True if both are available
 */
function checkDependencies() {
  try {
    execSync('git --version', { stdio: 'ignore' });
    execSync('gh --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Cleanup temporary files
 */
function cleanup() {
  try {
    if (fs.existsSync('./pr_body.md')) {
      fs.unlinkSync('./pr_body.md');
      console.log('🧹 Cleaned up temporary files');
    }
  } catch (cleanupError) {
    console.error('⚠️ Could not clean up temporary files:', cleanupError.message);
  }
}

module.exports = {
  generatePRDetails,
  createPR,
  getChangedFiles,
  checkDependencies,
  cleanup
}; 