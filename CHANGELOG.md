# 变更日志

所有针对 KatelyaTV 项目的显著变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本管理遵循 [语义化版本 2.0.0](https://semver.org/spec/v2.0.0.html) 规范。

## [Unreleased]

### 新增
- 添加 GitHub Actions 配置，在 arm 分支提交或合并时编译 amd64、arm64、armv7 三种架构的镜像并发布到 GitHub 注册表
- 添加发布 release/tag 功能，包含所有提交描述

### 修改
- 更新 GitHub Actions 工作流程，使用最新版本的 action
- 优化 Docker 镜像构建流程

### 修复
- 修复搜索接口在发生 500 错误时的响应结构问题
- 在 SourceSearchInfo 接口中添加 error_details 字段以包含完整的错误对象信息

## [0.7.0-katelya] - 2025-09-04

### 新增
- 添加搜索接口的源搜索情况信息返回功能
- 在 JSON 响应中新增 `source_search_info` 字段，包含各个数据源的搜索情况
- 添加 `SourceSearchInfo` 接口定义，包含访问地址、返回状态、数据数量、错误描述和用时等信息

### 修改
- 修改搜索接口错误处理逻辑，确保在发生 500 错误时也能返回 `source_search_info` 结构
- 优化搜索接口的错误信息记录，包含异常的 cause 信息

### 修复
- 修复搜索接口在空结果情况下的错误处理

## [0.6.0-katelya] - 2025-08-20

### 新增
- 添加成人内容过滤功能
- 添加跳过片头片尾功能
- 添加 TVBox 兼容模式

### 修改
- 优化用户界面和用户体验
- 改进多设备数据同步功能

## [0.5.0-katelya] - 2025-08-05

### 新增
- 添加多架构 Docker 镜像支持
- 添加 GitHub Actions 自动化构建和发布流程

### 修改
- 优化视频播放器性能
- 改进搜索算法和结果展示

## [0.4.0-katelya] - 2025-07-15

### 新增
- 添加多用户支持
- 添加收藏和播放历史功能

### 修改
- 重构后端架构，支持多种存储后端
- 优化响应式设计

## [0.3.0-katelya] - 2025-06-30

### 新增
- 添加 PWA 支持
- 添加主题切换功能

### 修改
- 优化搜索性能
- 改进错误处理机制

## [0.2.0-katelya] - 2025-06-10

### 新增
- 添加聚合搜索功能
- 添加视频播放器

### 修改
- 优化用户界面
- 改进配置管理

## [0.1.0-katelya] - 2025-05-20

### 新增
- 初始化项目
- 添加基础框架和核心功能

[Unreleased]: https://github.com/katelya77/KatelyaTV/compare/v0.7.0-katelya...HEAD
[0.7.0-katelya]: https://github.com/katelya77/KatelyaTV/compare/v0.6.0-katelya...v0.7.0-katelya
[0.6.0-katelya]: https://github.com/katelya77/KatelyaTV/compare/v0.5.0-katelya...v0.6.0-katelya
[0.5.0-katelya]: https://github.com/katelya77/KatelyaTV/compare/v0.4.0-katelya...v0.5.0-katelya
[0.4.0-katelya]: https://github.com/katelya77/KatelyaTV/compare/v0.3.0-katelya...v0.4.0-katelya
[0.3.0-katelya]: https://github.com/katelya77/KatelyaTV/compare/v0.2.0-katelya...v0.3.0-katelya
[0.2.0-katelya]: https://github.com/katelya77/KatelyaTV/compare/v0.1.0-katelya...v0.2.0-katelya
[0.1.0-katelya]: https://github.com/katelya77/KatelyaTV/releases/tag/v0.1.0-katelya
