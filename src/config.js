const fs = require('fs');
const path = require('path');
const os = require('os');

class ConfigManager {
  constructor() {
    this.configPath = path.join(os.homedir(), '.pr-automator');
    this.config = this.loadConfig();
  }

  /**
   * Load configuration from file
   * @returns {object} Configuration object
   */
  loadConfig() {
    const defaultConfig = {
      AI_PROVIDER: 'deepseek',
      API_KEY: '',
      MODEL: 'deepseek-chat'
    };

    try {
      if (fs.existsSync(this.configPath)) {
        const content = fs.readFileSync(this.configPath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        
        const config = { ...defaultConfig };
        lines.forEach(line => {
          const [key, ...valueParts] = line.split('=');
          if (key && valueParts.length > 0) {
            config[key.trim()] = valueParts.join('=').trim();
          }
        });
        
        return config;
      }
    } catch (error) {
      console.warn('⚠️ Could not load config file:', error.message);
    }
    
    return defaultConfig;
  }

  /**
   * Save configuration to file
   */
  saveConfig() {
    try {
      // Create config content
      const content = [
        '# PR Automator Configuration',
        '# This file contains your AI provider settings',
        '# Format: KEY=VALUE',
        '',
        `AI_PROVIDER=${this.config.AI_PROVIDER}`,
        `API_KEY=${this.config.API_KEY}`,
        `MODEL=${this.config.MODEL}`,
        ''
      ].join('\n');

      fs.writeFileSync(this.configPath, content, 'utf8');
    } catch (error) {
      console.error('❌ Could not save config file:', error.message);
    }
  }

  /**
   * Set a configuration value
   * @param {string} key - Configuration key
   * @param {string} value - Configuration value
   */
  set(key, value) {
    this.config[key] = value;
    this.saveConfig();
  }

  /**
   * Get a configuration value
   * @param {string} key - Configuration key
   * @returns {string} Configuration value
   */
  get(key) {
    return this.config[key] || '';
  }

  /**
   * Get all configuration values
   * @returns {object} All configuration values
   */
  getAll() {
    return {
      AI_PROVIDER: this.config.AI_PROVIDER,
      API_KEY: this.config.API_KEY,
      MODEL: this.config.MODEL
    };
  }

  /**
   * Delete a configuration value
   * @param {string} key - Configuration key to delete
   */
  delete(key) {
    delete this.config[key];
    this.saveConfig();
  }

  /**
   * Clear all configuration
   */
  clear() {
    this.config = {
      AI_PROVIDER: 'deepseek',
      API_KEY: '',
      MODEL: 'deepseek-chat'
    };
    this.saveConfig();
  }

  /**
   * Get configuration file path
   * @returns {string} Path to configuration file
   */
  getConfigPath() {
    return this.configPath;
  }

  /**
   * Check if configuration is complete
   * @returns {boolean} True if all required configs are set
   */
  isComplete() {
    const config = this.getAll();
    return config.API_KEY && config.AI_PROVIDER;
  }

  /**
   * Get environment variables for the application
   * @returns {object} Environment variables object
   */
  getEnvVars() {
    const config = this.getAll();
    return {
      AI_PROVIDER: config.AI_PROVIDER,
      API_KEY: config.API_KEY,
      MODEL: config.MODEL
    };
  }
}

module.exports = ConfigManager; 