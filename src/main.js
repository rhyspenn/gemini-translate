/**
 * Google Gemini Translation Plugin for Bob
 * 支持 Google Gemini API 格式的翻译插件
 *
 * Bob 语言代码列表 https://ripperhe.gitee.io/bob/#/plugin/addtion/language
 */

// 语言映射表
var items = [
    ['auto', 'auto'],
    ['zh-Hans', 'Chinese Simplified'],
    ['zh-Hant', 'Chinese Traditional'],
    ['en', 'English'],
    ['ja', 'Japanese'],
    ['ko', 'Korean'],
    ['fr', 'French'],
    ['de', 'German'],
    ['es', 'Spanish'],
    ['pt', 'Portuguese'],
    ['ru', 'Russian'],
    ['it', 'Italian'],
    ['ar', 'Arabic'],
    ['th', 'Thai'],
    ['vi', 'Vietnamese'],
    ['nl', 'Dutch'],
    ['pl', 'Polish'],
    ['tr', 'Turkish'],
    ['he', 'Hebrew'],
    ['hi', 'Hindi'],
    ['id', 'Indonesian'],
    ['ms', 'Malay'],
    ['sv', 'Swedish'],
    ['da', 'Danish'],
    ['no', 'Norwegian'],
    ['fi', 'Finnish'],
    ['cs', 'Czech'],
    ['hu', 'Hungarian'],
    ['el', 'Greek'],
    ['ro', 'Romanian'],
    ['bg', 'Bulgarian'],
    ['uk', 'Ukrainian'],
    ['sk', 'Slovak'],
    ['sl', 'Slovenian'],
    ['hr', 'Croatian'],
    ['lt', 'Lithuanian'],
    ['lv', 'Latvian'],
    ['et', 'Estonian'],
    ['fa', 'Persian']
];

var langMap = new Map(items);
var langMapReverse = new Map(items.map(([standardLang, lang]) => [lang, standardLang]));

function supportLanguages() {
    return items.map(([standardLang, lang]) => standardLang);
}

function translate(query, completion) {
    const { text, from, to } = query;

    // 获取配置
    const apiKey = $option.apiKey;
    const baseUrl = $option.baseUrl || 'https://generativelanguage.googleapis.com/v1beta';
    const model = $option.model || 'gemini-2.5-flash-lite';
    const temperature = parseFloat($option.temperature) || 0.1;
    const maxTokens = $option.maxTokens ? parseInt($option.maxTokens) : null;

    // 验证必要配置
    if (!apiKey) {
        completion({
            error: {
                type: 'param',
                message: '请先配置 API Key',
                addition: '请在插件设置中填入您的 API 密钥'
            }
        });
        return;
    }

    // 转换语言代码
    const fromLang = langMap.get(from) || from;
    const toLang = langMap.get(to) || to;

    // 构建翻译提示词
    let systemPrompt = "You are a professional translator. Rules: 1) Output only the translation result without any explanation or thinking process 2) Translate directly while maintaining the original format 3) For auto-detect, prioritize English-Chinese Simplified translation pairs 4) Preserve original formatting, line breaks, and spacing";

    let userPrompt = buildTranslatePrompt(text, fromLang, toLang);

    // 构建请求数据（Gemini API 格式）
    const requestData = {
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
        contents: [
            {
                role: "user",
                parts: [{ text: userPrompt }]
            }
        ],
        generationConfig: {
            temperature: temperature
        }
    };

    // 如果设置了 maxTokens，则添加到请求中
    if (maxTokens) {
        requestData.generationConfig.maxOutputTokens = maxTokens;
    } else {
        // 自动计算合适的 maxOutputTokens
        requestData.generationConfig.maxOutputTokens = Math.min(Math.max(text.length * 3, 128), 4096);
    }

    // 构建 Gemini API URL
    const apiUrl = buildApiUrl(baseUrl, model);

    // 调用 Gemini API
    $http.request({
        method: 'POST',
        url: apiUrl,
        header: {
            'x-goog-api-key': apiKey,
            'Content-Type': 'application/json'
        },
        body: requestData,
        handler: function (resp) {
            handleApiResponse(resp, text, from, to, completion);
        }
    });
}

function buildTranslatePrompt(text, fromLang, toLang) {
    // 处理特殊情况：自动检测
    if (toLang === 'auto') {
        if (fromLang === 'auto') {
            // 优化：优先处理中英互译
            return `Intelligently translate the following text. Priority rules:
1. If the text is in English, translate to Chinese Simplified
2. If the text is in Chinese (Simplified or Traditional), translate to English
3. For other languages, translate to the most appropriate target language
Text to translate:\n${text}`;
        } else {
            return `Translate from ${fromLang} to the most appropriate language:\n${text}`;
        }
    }

    // 正常翻译请求
    if (fromLang === 'auto') {
        return `Translate to ${toLang}:\n${text}`;
    } else {
        return `Translate from ${fromLang} to ${toLang}:\n${text}`;
    }
}

function handleApiResponse(resp, originalText, from, to, completion) {
    // 处理网络错误
    if (resp.error) {
        completion({
            error: {
                type: 'network',
                message: '网络请求失败',
                addition: resp.error.localizedDescription || '请检查网络连接和 API 地址是否正确'
            }
        });
        return;
    }

    const data = resp.data;

    // 检查 API 错误
    if (data.error) {
        let errorMessage = 'API 错误';
        let errorAddition = data.error.message || '未知错误';
        let errorStatus = data.error.status || '';

        if (errorStatus === 'UNAUTHENTICATED' || errorStatus === 'PERMISSION_DENIED') {
            errorMessage = 'API Key 无效';
            errorAddition = '请检查您的 API 密钥是否正确';
        } else if (errorStatus === 'RESOURCE_EXHAUSTED') {
            errorMessage = 'API 配额不足';
            errorAddition = '请检查您的账户配额或用量限制';
        } else if (errorStatus === 'NOT_FOUND') {
            errorMessage = '模型不存在';
            errorAddition = `模型 "${$option.model || 'gemini-2.5-flash-lite'}" 不存在或无权限访问，请检查模型名称`;
        } else if (errorStatus === 'INVALID_ARGUMENT') {
            errorMessage = '请求参数错误';
            errorAddition = data.error.message || '请检查模型名称、Base URL 和参数设置';
        }

        completion({
            error: {
                type: 'api',
                message: errorMessage,
                addition: errorAddition
            }
        });
        return;
    }

    // 安全策略拦截
    if (data.promptFeedback && data.promptFeedback.blockReason) {
        completion({
            error: {
                type: 'api',
                message: '内容被安全策略拦截',
                addition: `拦截原因：${data.promptFeedback.blockReason}`
            }
        });
        return;
    }

    // 解析翻译结果
    if (data.candidates && data.candidates.length > 0) {
        const candidate = data.candidates[0];
        const parts = candidate.content && candidate.content.parts ? candidate.content.parts : [];
        let translatedText = parts.map(part => part.text || '').join('');

        if (translatedText) {
            translatedText = translatedText.trim();

            completion({
                result: {
                    from: from,
                    to: to,
                    toParagraphs: [translatedText],
                    fromParagraphs: [originalText]
                }
            });
        } else {
            completion({
                error: {
                    type: 'api',
                    message: '翻译结果为空',
                    addition: 'API 返回了空的翻译结果'
                }
            });
        }
    } else {
        completion({
            error: {
                type: 'api',
                message: '响应格式错误',
                addition: 'API 返回的数据格式不正确'
            }
        });
    }
}

function buildApiUrl(baseUrl, model) {
    let apiUrl = baseUrl.trim();

    const hasQuery = apiUrl.includes('?');
    const splitUrl = apiUrl.split('?');
    let path = splitUrl[0];
    const query = splitUrl.length > 1 ? splitUrl.slice(1).join('?') : '';

    if (path.endsWith('/')) {
        path = path.slice(0, -1);
    }

    if (!path.includes('/models/')) {
        let safeModel = model.trim();
        if (safeModel.startsWith('models/')) {
            safeModel = safeModel.slice('models/'.length);
        }
        path += `/models/${encodeURIComponent(safeModel)}`;
    }

    if (!path.endsWith(':generateContent')) {
        path += ':generateContent';
    }

    if (hasQuery && query) {
        return `${path}?${query}`;
    }

    return path;
}
