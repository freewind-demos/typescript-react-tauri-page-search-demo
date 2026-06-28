# Tauri 页内搜索 Demo

## 简介

这个 Demo 使用 `Tauri + React + TypeScript + Ant Design` 实现一个桌面页面搜索界面。

核心交互：

- 页面内放置较长中文内容
- 按 `Command + F` 或 `Ctrl + F` 打开自定义搜索框
- 输入关键词时实时高亮命中内容
- 支持查看结果计数、上一条、下一条

## 快速开始

### 环境要求

- Node.js 18+
- `pnpm`
- Rust / Cargo

### 运行

```bash
pnpm install
pnpm tauri dev
```

## 当前已实现

- 拦截系统默认页内搜索快捷键
- 自定义搜索框聚焦
- 边输入边搜索与高亮
- 当前命中自动滚动到可视区

## 后续可扩展

- `Esc` 关闭时清空搜索态
- `Shift + Enter` 跳上一条
- 与 Tauri 菜单栏 Search 菜单联动
