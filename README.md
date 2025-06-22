# PR Automator 🤖

> AI-powered Pull Request description generator with multi-provider support

Automatically generate professional Pull Request descriptions using AI. Supports multiple AI providers including DeepSeek, OpenAI, OpenRouter, and Google Gemini.

## ✨ Features

- 🤖 **Multi-AI Provider Support**: DeepSeek, OpenAI, OpenRouter, Google Gemini
- 📝 **Smart PR Generation**: Analyzes git diffs and generates comprehensive PR descriptions
- ⚙️ **Easy Configuration**: Simple CLI commands for setup and management
- 🔒 **Secure**: API keys stored securely in user configuration
- 🎯 **Conventional Commits**: Generates titles following conventional commit standards
- 🚀 **GitHub Integration**: Seamless integration with GitHub CLI

## 🚀 Quick Start

### Installation

```bash
# Install globally
npm install -g pr-automator

# Or install locally
npm install pr-automator
```

### Prerequisites

- Node.js 14+ 
- Git
- GitHub CLI (`gh`)

#### Installing GitHub CLI

**macOS:**
```bash
# 使用Homebrew安装
brew install gh

# 或使用官方安装脚本
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update && sudo apt install gh
```

**Windows:**
```bash
# 使用winget
winget install GitHub.cli

# 或使用Chocolatey
choco install gh

# 或使用Scoop
scoop install gh
```

**Linux:**
```bash
# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update && sudo apt install gh

# CentOS/RHEL/Fedora
sudo dnf install gh

# 或使用官方安装脚本
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update && sudo apt install gh
```

**验证安装:**
```bash
gh --version
```

**首次使用需要认证:**
```bash
gh auth login
```

### Setup

1. **Configure your AI provider:**
   ```bash
   prc config
   ```
   This will start an interactive setup process.

2. **Or configure manually:**
   ```bash
   prc config AI_PROVIDER "deepseek"
   prc config API_KEY "your-api-key-here"
   prc config MODEL "deepseek-chat"
   ```

3. **Check your configuration:**
   ```bash
   prc status
   ```

### Usage

```bash
# Create a PR with AI-generated description
prc create

# Preview PR description without creating (dry run)
prc create --dry-run
```

## 📋 Commands

### `prc config [key] [value]`

Configure AI provider settings.

```bash
# Interactive configuration
prc config

# Set specific values
prc config AI_PROVIDER "openai"
prc config API_KEY "sk-..."
prc config MODEL "gpt-4-turbo"

# View specific config
prc config AI_PROVIDER
```

### `prc list-providers`

List all available AI providers with descriptions.

```bash
prc list-providers
```

### `prc status`

Show current configuration status and readiness.

```bash
prc status
```

### `prc create [options]`

Create a Pull Request with AI-generated description.

```bash
# Create PR
prc create

# Dry run (preview without creating)
prc create --dry-run
```

## 🤖 Supported AI Providers

| Provider | Description | Default Model |
|----------|-------------|---------------|
| `deepseek` | DeepSeek AI - Fast and reliable AI service | `deepseek-chat` |
| `openai` | OpenAI GPT - Industry leading AI models | `gpt-4-turbo` |
| `openrouter` | OpenRouter - Access to multiple AI providers | `google/gemini-pro` |
| `gemini` | Google Gemini - Advanced AI from Google | `gemini-pro` |

## 🔧 Configuration

Configuration is stored in `~/.pr-automator` (i.e. `$HOME/.pr-automator`) as a simple text file with KEY=VALUE format.

Example configuration file:
```
# PR Automator Configuration
# This file contains your AI provider settings
# Format: KEY=VALUE

AI_PROVIDER=deepseek
API_KEY=your-api-key-here
MODEL=deepseek-chat
```

### Environment Variables

You can also use environment variables instead of the config command:

```bash
export AI_PROVIDER="deepseek"
export API_KEY="your-api-key"
export MODEL="deepseek-chat"
```

## 📝 Generated PR Format

The tool generates PR descriptions in the following format:

```markdown
**Title:** 🚀 feat: Add user authentication system

**Overview:** Implement comprehensive user authentication with JWT tokens and role-based access control.

**Key Features Implemented:**
- 🔐 JWT-based authentication system
- 👥 Role-based access control (RBAC)
- 🔒 Password hashing with bcrypt
- 📧 Email verification flow
- 🛡️ Rate limiting for login attempts

**Technical Details:**
- Added authentication middleware using Express.js
- Implemented JWT token generation and validation
- Created user model with Mongoose schema
- Added bcrypt password hashing for security
- Integrated email service for verification

**Future Enhancements:**
- Add OAuth integration (Google, GitHub)
- Implement password reset functionality
- Add session management
```

## 🛠️ Development

### Project Structure

```
pr-automator/
├── src/
│   ├── cli.js          # Command-line interface
│   ├── config.js       # Configuration management
│   ├── ai-providers.js # AI provider configurations
│   ├── pr-generator.js # Core PR generation logic
│   └── index.js        # Module exports
├── package.json
└── README.md
```

### Local Development

```bash
# Clone the repository
git clone https://github.com/vincentqyw/pr-automator.git
cd pr-automator

# Install dependencies
npm install

# Link for local development
npm link

# Run the tool
prc --help
```

## 🔑 API Keys

### DeepSeek
1. Visit [DeepSeek Console](https://platform.deepseek.com/)
2. Create an account and get your API key
3. Configure: `prc config AI_PROVIDER "deepseek"`

### OpenAI
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an API key
3. Configure: `prc config AI_PROVIDER "openai"`

### OpenRouter
1. Visit [OpenRouter](https://openrouter.ai/)
2. Get your API key
3. Configure: `prc config AI_PROVIDER "openrouter"`

### Google Gemini
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Configure: `prc config AI_PROVIDER "gemini"`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**"Missing critical dependencies"**
- Ensure Git and GitHub CLI are installed
- Run `git --version` and `gh --version` to verify

**"Configuration is incomplete"**
- Run `prc config` to set up your AI provider
- Check `prc status` for current configuration

**"API analysis failed"**
- Verify your API key is correct
- Check your AI provider's service status
- Ensure you have sufficient API credits

**"No changes detected"**
- Make sure you're on a feature branch
- Ensure you have commits ahead of `origin/main`

### Getting Help

- Check the status: `prc status`
- List available providers: `prc list-providers`
- View help: `prc --help`

## 🙏 Acknowledgments

- Built with [Commander.js](https://github.com/tj/commander.js) for CLI
- Interactive prompts with [Inquirer.js](https://github.com/SBoudrias/Inquirer.js)
- Beautiful CLI output with [Chalk](https://github.com/chalk/chalk)

---

Made with ❤️ for developers who love clean, professional Pull Requests. 