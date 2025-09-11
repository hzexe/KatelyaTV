# KatelyaTV

KatelyaTV 是一个基于 Next.js 的 IPTV 播放器项目，支持多种部署方式和架构。

## GitHub Actions 工作流程

本项目包含多个 GitHub Actions 工作流程，用于自动化构建、测试和发布：

### 1. Build and Push Multi-Arch Docker Images (`.github/workflows/docker-image.yml`)

在 `arm` 分支提交或合并时自动触发，执行以下操作：
- 构建 amd64、arm64 和 armv7 三种架构的 Docker 镜像
- 推送镜像到 GitHub Container Registry (GHCR)
- 创建包含所有提交描述的 Release/Tag

### 2. Release (`.github/workflows/release.yml`)

在创建带有 `v` 前缀的 tag 时触发，用于发布新版本。

### 3. Docker Build & Test (`.github/workflows/docker-build.yml`)

在 `main` 分支推送到仓库时触发，用于构建和测试 Docker 镜像。

### 4. Upstream Sync (`.github/workflows/sync.yml`)

定期同步上游仓库的更改（仅适用于 fork 的仓库）。

## Docker 镜像

项目提供多架构 Docker 镜像，支持以下平台：
- linux/amd64
- linux/arm64
- linux/arm/v7

### 镜像拉取命令

```bash
# 拉取最新多架构镜像
docker pull ghcr.io/katelya77/katelyatv:arm

# 拉取特定架构镜像
docker pull ghcr.io/katelya77/katelyatv:VERSION-amd64
docker pull ghcr.io/katelya77/katelyatv:VERSION-arm64
docker pull ghcr.io/katelya77/katelyatv:VERSION-armv7
```

## 开发

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

## 部署

项目支持多种部署方式：
1. Docker 部署（推荐）
2. Cloudflare Pages 部署
3. Vercel 部署
4. 独立服务器部署

详细部署说明请参考 [DEPLOYMENT_SUCCESS_GUIDE.md](DEPLOYMENT_SUCCESS_GUIDE.md)。
