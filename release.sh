#!/bin/bash

# 发布脚本 - 用于快速创建新版本和标签

set -e

echo "🚀 Google Gemini 翻译插件发布脚本"
echo "=================================="

# 检查是否有未提交的更改
if [[ -n $(git status --porcelain) ]]; then
    echo "❌ 存在未提交的更改，请先提交或暂存所有更改"
    git status --short
    exit 1
fi

# 获取当前版本
CURRENT_VERSION=$(grep '"version"' src/info.json | sed 's/.*"version": "\(.*\)".*/\1/')
echo "📋 当前版本: $CURRENT_VERSION"

# 获取新版本
echo "请输入新版本号 (格式: x.y.z):"
read NEW_VERSION

if [[ ! $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "❌ 版本号格式错误，请使用 x.y.z 格式"
    exit 1
fi

echo "🔄 更新版本号到 $NEW_VERSION"

# 更新 src/info.json 中的版本号
sed -i.bak "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" src/info.json
rm src/info.json.bak

echo "✅ 版本号已更新"

# 提交更改
git add src/info.json
git commit -m "🔖 Bump version to $NEW_VERSION"

# 创建标签
git tag "v$NEW_VERSION"

echo "🏷️  已创建标签: v$NEW_VERSION"

# 推送到远程仓库
echo "📤 推送到远程仓库..."
git push origin main
git push origin "v$NEW_VERSION"

echo "🎉 发布完成！"
echo "📦 GitHub Actions 将自动构建并创建 Release"
