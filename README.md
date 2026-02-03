# Google Gemini 翻译插件

这是一个支持 Google Gemini API 格式的 Bob 翻译插件，可使用 Gemini 模型进行高质量文本翻译。

## 功能特点

- ⚡ **原生 Gemini API**：使用 Google Gemini 官方 API 格式
- 🔧 **自定义 Base URL**：可配置 Gemini API 端点地址
- 🤖 **灵活模型选择**：支持自定义模型名称，默认使用 `gemini-2.5-flash-lite`
- 🌍 **多语言支持**：支持 35+ 种语言互译
- ⚙️ **参数可调**：可自定义 temperature 和 maxOutputTokens 参数
- 📝 **智能翻译**：基于上下文提供自然流畅的翻译结果
- 🔒 **安全存储**：API Key 安全加密存储

## 支持的服务

- ✅ Google Gemini API（Google AI Studio / Generative Language API）

## 安装配置

### 🔥 快速安装

1. 构建生成 `gemini-translate.bobplugin`
2. 双击文件自动安装到 Bob

### 配置步骤

1. **设置 API Base URL**
   - 默认：`https://generativelanguage.googleapis.com/v1beta`
   - 若使用代理或自建网关，请填写对应地址

2. **输入 API Key**
   - 在插件设置中填入您的 API 密钥
   - 密钥将被安全加密存储

3. **配置模型名称**
   - 默认为 `gemini-2.5-flash-lite`
   - 可根据需求修改为其他模型（例如 `gemini-1.5-pro`）

4. **调整参数（可选）**
   - **Temperature**: 控制输出随机性（0-2），默认 0.1，值越小翻译越精确
   - **Max Output Tokens**: 最大输出 token 数，留空则自动计算

## 使用说明

1. 选择文本后使用 Bob 的快捷键进行翻译
2. 插件会自动检测源语言并翻译到目标语言
3. 支持 Bob 的所有翻译功能：
   - 划词翻译
   - 截图翻译
   - 输入翻译
   - 剪贴板翻译

## 配置示例

### Google Gemini API（推荐）
```
Base URL: https://generativelanguage.googleapis.com/v1beta
API Key: YOUR_GEMINI_API_KEY
Model: gemini-2.5-flash-lite
```

### 自定义网关（如企业代理）
```
Base URL: https://your-gateway.example.com/v1beta
API Key: YOUR_GEMINI_API_KEY
Model: gemini-2.5-flash-lite
```

## 支持的语言

中文简体、中文繁体、英语、日语、韩语、法语、德语、西班牙语、葡萄牙语、俄语、意大利语、阿拉伯语、泰语、越南语、荷兰语、波兰语、土耳其语、希伯来语、印地语、印尼语、马来语、瑞典语、丹麦语、挪威语、芬兰语、捷克语、匈牙利语、希腊语、罗马尼亚语、保加利亚语、乌克兰语、斯洛伐克语、斯洛文尼亚语、克罗地亚语、立陶宛语、拉脱维亚语、爱沙尼亚语、波斯语

## 常见问题

### Q: 翻译失败显示"API Key 无效"
A: 请检查：
- API Key 是否正确填写
- Base URL 是否正确
- 确保没有多余的空格

### Q: 翻译失败显示"模型不存在"
A: 请检查模型名称是否正确，不同模型名称可能随 API 版本变化

### Q: 翻译速度较慢
A: 可以尝试：
- 使用更快的模型（如 `gemini-2.5-flash-lite`）
- 检查网络连接

## 注意事项

- ⚠️ 需要稳定的网络连接
- ⚠️ API 调用可能产生费用，请合理使用
- ⚠️ 请妥善保管您的 API Key

## 开发文档

详细的开发说明请参见：[DEVELOPMENT.md](DEVELOPMENT.md)

## 版本历史

### v1.0.0
- 🎉 初始版本
- ✨ 支持 Google Gemini API 格式
- ✨ 支持自定义 Base URL
- ✨ 支持温度与输出长度参数

## 许可证

MIT License
