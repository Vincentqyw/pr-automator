#!/usr/bin/env node

const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ConfigManager = require('./config');
const { getAvailableProviders, getProviderNames, isValidProvider } = require('./ai-providers');
const { generatePRDetails, createPR, getChangedFiles, checkDependencies, cleanup } = require('./pr-generator');

const program = new Command();
const config = new ConfigManager();

// Set up environment variables from config
function setupEnvVars() {
  const envVars = config.getEnvVars();
  Object.assign(process.env, envVars);
}

// Configuration commands
program
  .name('prc')
  .description('AI-powered Pull Request description generator')
  .version('1.0.0');

program
  .command('config')
  .description('Configure AI provider settings')
  .argument('[key]', 'Configuration key (AI_PROVIDER, API_KEY, MODEL)')
  .argument('[value]', 'Configuration value')
  .action(async (key, value) => {
    if (!key) {
      // Interactive configuration
      await interactiveConfig();
    } else if (!value) {
      // Show specific config value
      const configValue = config.get(key);
      if (configValue) {
        console.log(chalk.green(`${key}: ${configValue}`));
      } else {
        console.log(chalk.red(`Configuration key "${key}" not found.`));
      }
    } else {
      // Set specific config value
      if (key === 'AI_PROVIDER' && !isValidProvider(value)) {
        console.log(chalk.red(`Invalid AI provider: ${value}`));
        console.log(chalk.yellow('Available providers:'), getProviderNames().join(', '));
        return;
      }
      config.set(key, value);
      console.log(chalk.green(`✅ ${key} set to: ${value}`));
    }
  });

program
  .command('list-providers')
  .description('List available AI providers')
  .action(() => {
    const providers = getAvailableProviders();
    console.log(chalk.blue('🤖 Available AI Providers:\n'));
    
    Object.entries(providers).forEach(([key, provider]) => {
      console.log(chalk.cyan(`${key}:`));
      console.log(`  Name: ${provider.name}`);
      console.log(`  Description: ${provider.description}`);
      console.log(`  Default Model: ${provider.defaultModel}\n`);
    });
  });

program
  .command('status')
  .description('Show current configuration status')
  .action(() => {
    const allConfig = config.getAll();
    const providers = getAvailableProviders();
    
    console.log(chalk.blue('📋 Configuration Status:\n'));
    console.log(`AI Provider: ${chalk.cyan(allConfig.AI_PROVIDER)}`);
    console.log(`Model: ${chalk.cyan(allConfig.MODEL)}`);
    console.log(`API Key: ${allConfig.API_KEY ? chalk.green('✅ Set') : chalk.red('❌ Not set')}`);
    
    if (allConfig.AI_PROVIDER && providers[allConfig.AI_PROVIDER]) {
      const provider = providers[allConfig.AI_PROVIDER];
      console.log(`Provider Name: ${chalk.cyan(provider.name)}`);
      console.log(`Provider Description: ${chalk.gray(provider.description)}`);
    }
    
    console.log(`\nConfiguration file: ${chalk.gray(config.getConfigPath())}`);
    
    if (config.isComplete()) {
      console.log(chalk.green('\n✅ Configuration is complete and ready to use!'));
    } else {
      console.log(chalk.red('\n❌ Configuration is incomplete. Please run "prc config" to set up.'));
    }
  });

program
  .command('create')
  .description('Create a Pull Request with AI-generated description')
  .option('-d, --dry-run', 'Generate PR description without creating the PR')
  .action(async (options) => {
    setupEnvVars();
    
    // Check dependencies
    if (!checkDependencies()) {
      console.error(chalk.red('❌ Missing critical dependencies. Please ensure Git and GitHub CLI (gh) are installed.'));
      process.exit(1);
    }
    
    // Check configuration
    if (!config.isComplete()) {
      console.error(chalk.red('❌ Configuration is incomplete. Please run "prc config" to set up.'));
      process.exit(1);
    }
    
    try {
      console.log(chalk.blue('🔍 Detecting changed files...'));
      const files = getChangedFiles();
      
      if (files.length === 0) {
        console.log(chalk.green('✅ No changes detected compared to origin/main. Nothing to do.'));
        return;
      }
      
      console.log(chalk.cyan(`Detected ${files.length} changed file(s):`));
      files.forEach(file => console.log(chalk.gray(`  - ${file}`)));
      
      const allConfig = config.getAll();
      const prDetails = await generatePRDetails(
        files, 
        allConfig.AI_PROVIDER, 
        allConfig.API_KEY, 
        allConfig.MODEL
      );
      
      if (prDetails) {
        console.log(chalk.green('\n📝 Generated PR Details:'));
        console.log(chalk.cyan('Title:'), prDetails.title);
        console.log(chalk.cyan('Body Preview:'), prDetails.body.substring(0, 100) + '...');
        
        if (options.dryRun) {
          console.log(chalk.yellow('\n🔍 Dry run mode - PR not created'));
          console.log(chalk.cyan('Full PR Body:'));
          console.log(prDetails.body);
        } else {
          createPR(prDetails);
        }
      } else {
        console.error(chalk.red('❌ Failed to get PR content from AI. PR creation aborted.'));
        process.exit(1);
      }
      
    } catch (error) {
      console.error(chalk.red(`❌ An unexpected error occurred: ${error.message}`));
      process.exit(1);
    } finally {
      cleanup();
    }
  });

// Interactive configuration function
async function interactiveConfig() {
  const providers = getAvailableProviders();
  const providerNames = getProviderNames();
  
  console.log(chalk.blue('🤖 PR Automator Configuration\n'));
  
  const questions = [
    {
      type: 'list',
      name: 'AI_PROVIDER',
      message: 'Select AI Provider:',
      choices: providerNames.map(name => ({
        name: `${name} - ${providers[name].description}`,
        value: name
      })),
      default: config.get('AI_PROVIDER')
    },
    {
      type: 'password',
      name: 'API_KEY',
      message: 'Enter API Key:',
      default: config.get('API_KEY'),
      validate: (input) => {
        if (!input) return 'API Key is required';
        return true;
      }
    },
    {
      type: 'input',
      name: 'MODEL',
      message: 'Enter Model Name (leave empty for default):',
      default: config.get('MODEL'),
      filter: (input) => {
        if (!input) {
          const selectedProvider = config.get('AI_PROVIDER');
          return providers[selectedProvider]?.defaultModel || '';
        }
        return input;
      }
    }
  ];
  
  try {
    const answers = await inquirer.prompt(questions);
    
    // Update configuration
    Object.entries(answers).forEach(([key, value]) => {
      config.set(key, value);
    });
    
    console.log(chalk.green('\n✅ Configuration saved successfully!'));
    console.log(chalk.gray(`Configuration file: ${config.getConfigPath()}`));
    
  } catch (error) {
    console.error(chalk.red('❌ Configuration failed:', error.message));
  }
}

// Default command (when no subcommand is provided)
program
  .action(async () => {
    console.log(chalk.blue('🚀 PR Automator - AI-powered Pull Request generator\n'));
    console.log(chalk.gray('Use --help to see available commands'));
    
    if (!config.isComplete()) {
      console.log(chalk.yellow('\n⚠️  Configuration incomplete. Run "prc config" to set up.'));
    } else {
      console.log(chalk.green('\n✅ Ready to create PRs! Run "prc create" to get started.'));
    }
  });

// Handle errors
program.exitOverride();

try {
  program.parse();
} catch (err) {
  if (err.code === 'commander.help') {
    process.exit(0);
  } else {
    console.error(chalk.red('❌ Error:', err.message));
    process.exit(1);
  }
} 