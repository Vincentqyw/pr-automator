# 部署配置指南

本指南将帮助您配置 GitHub Actions 来自动发布到 NPM。

## 🔧 配置步骤

### 1. 获取 NPM Token

1. 登录到 [NPM](https://www.npmjs.com/)
2. 点击右上角的头像，选择 "Access Tokens"
3. 点击 "Generate New Token"
4. 选择 "Automation" 类型
5. 复制生成的 token（注意：token 只会显示一次）

### 2. 配置 GitHub Secrets

1. 进入您的 GitHub 仓库
2. 点击 "Settings" 标签页
3. 在左侧菜单中选择 "Secrets and variables" → "Actions"
4. 点击 "New repository secret"
5. 添加以下 secret：

| Name | Value | 说明 |
|------|-------|------|
| `NPM_TOKEN` | 您的 NPM token | 用于发布到 NPM |

### 3. 版本管理

确保您的版本管理遵循语义化版本控制：

```bash
# 更新 package.json 中的版本
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

### 4. 发布流程

#### 方法一：通过 GitHub Release（推荐）

1. 更新 `package.json` 中的版本号
2. 提交并推送代码：
   ```bash
   git add .
   git commit -m "feat: bump version to 1.1.0"
   git push origin main
   ```
3. 创建并推送标签：
   ```bash
   git push origin v1.1.0
   ```
4. 在 GitHub 上创建 Release：
   - 进入 "Releases" 页面
   - 点击 "Create a new release"
   - 选择刚才推送的标签
   - 填写发布说明
   - 点击 "Publish release"

#### 方法二：直接推送标签

1. 更新 `package.json` 中的版本号
2. 提交代码：
   ```bash
   git add .
   git commit -m "feat: bump version to 1.1.0"
   git push origin main
   ```
3. 创建并推送标签：
   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   ```

## 📋 GitHub Actions 工作流

项目包含两个工作流文件：

### `npm-publish.yml`
- 触发条件：创建 GitHub Release
- 功能：发布到 NPM 并更新 Release 说明

### `npm-publish-on-tag.yml`
- 触发条件：推送标签（v* 格式）
- 功能：发布到 NPM 并创建/更新 Release

## 🔍 工作流检查项

每次发布时，GitHub Actions 会执行以下检查：

1. **版本一致性检查**：确保 `package.json` 中的版本与标签版本一致
2. **依赖安装**：安装项目依赖
3. **测试运行**：运行测试套件
4. **重复发布检查**：检查 NPM 上是否已存在相同版本
5. **发布到 NPM**：使用 NPM token 发布包
6. **更新 GitHub Release**：自动更新 Release 说明

## 🚨 故障排除

### 常见问题

1. **版本不匹配错误**
   ```
   ❌ Package version (1.0.0) does not match tag version (1.1.0)
   ```
   - 确保 `package.json` 中的版本与标签版本一致

2. **NPM Token 错误**
   ```
   npm ERR! code ENEEDAUTH
   npm ERR! need auth auth required for publishing
   ```
   - 检查 GitHub Secrets 中的 `NPM_TOKEN` 是否正确
   - 确保 NPM token 有发布权限

3. **包已存在错误**
   ```
   npm ERR! code EPERM
   npm ERR! publish failed PUT 403
   ```
   - 检查 NPM 上是否已存在相同版本
   - 使用 `npm version` 命令更新版本

### 调试步骤

1. 检查 GitHub Actions 日志
2. 验证 NPM token 权限
3. 确认版本号格式正确
4. 检查 `.npmignore` 文件配置

## 📝 最佳实践

1. **语义化版本控制**：遵循 `MAJOR.MINOR.PATCH` 格式
2. **测试覆盖**：确保所有测试通过后再发布
3. **发布说明**：在 GitHub Release 中提供详细的更新说明
4. **预发布测试**：使用 `npm version prerelease` 进行预发布测试

## 🔗 相关链接

- [NPM 发布指南](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [语义化版本控制](https://semver.org/) 