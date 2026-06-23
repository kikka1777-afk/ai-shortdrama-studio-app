// Vercel Serverless Function：把前端请求代理转发到 OpenAI 兼容接口或 Azure OpenAI。
// 好处：① 避开浏览器跨域(CORS)；② API Key 可放在 Vercel 环境变量，前端不暴露、同事免配置。
// 运行环境：Vercel Node.js（已内置全局 fetch）。

module.exports = async (req, res) => {
  // 只接受 POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed，请用 POST' });
    return;
  }

  try {
    // Vercel 会自动解析 application/json 的 body；兜底再解析一次
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    body = body || {};

    const {
      provider = 'openai',
      key,
      base,
      model = 'gpt-4o-mini',
      apiVersion = '2024-08-01-preview',
      system,
      user,
      wantJSON
    } = body;

    // Key 优先用前端传入；否则回退到 Vercel 环境变量 OPENAI_API_KEY
    const apiKey = (key && key.trim()) || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      res.status(400).json({
        error: '未配置 API Key：请在页面右上「设置接口」填入，或在 Vercel 项目 Settings → Environment Variables 里设置 OPENAI_API_KEY。'
      });
      return;
    }

    const messages = [
      { role: 'system', content: system || '' },
      { role: 'user', content: user || '' }
    ];
    const payload = { temperature: wantJSON ? 0.4 : 0.85, messages };
    if (wantJSON) payload.response_format = { type: 'json_object' };

    let url;
    const headers = { 'Content-Type': 'application/json' };

    if (provider === 'azure') {
      // Azure：endpoint + 部署名在 URL 里，key 用 api-key 头
      const ep = ((base && base.trim()) || process.env.OPENAI_BASE_URL || '').replace(/\/$/, '');
      if (!ep) {
        res.status(400).json({ error: 'Azure 模式需要填 Endpoint（如 https://xxx.openai.azure.com），可在页面填或设环境变量 OPENAI_BASE_URL。' });
        return;
      }
      url = `${ep}/openai/deployments/${encodeURIComponent(model)}/chat/completions?api-version=${apiVersion}`;
      headers['api-key'] = apiKey;
    } else {
      // OpenAI 兼容：base 默认 OpenAI 官方；key 用 Bearer
      let b = ((base && base.trim()) || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
      if (!/\/(?:v\d+|chat\/completions)$/.test(b)) b += '/v1';
      url = /\/chat\/completions$/.test(b) ? b : b + '/chat/completions';
      headers['Authorization'] = 'Bearer ' + apiKey;
      payload.model = model;
    }

    const upstream = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const text = await upstream.text();
    const trimmed = text.trim();
    const htmlHint = /^<!doctype html>|^<html[\s>]/i.test(trimmed);
    if (!upstream.ok) {
      if (htmlHint) {
        res.status(upstream.status).json({
          error: '上游返回了 HTML 页面而不是 JSON。请检查 API Base / OPENAI_BASE_URL：它应该是 OpenAI 兼容接口地址，例如 https://api.openai.com/v1，而不是网关首页或控制台页面。'
        });
        return;
      }
      res.status(upstream.status).json({ error: '上游接口错误 ' + upstream.status + '：' + text.slice(0, 500) });
      return;
    }

    let data;
    try { data = JSON.parse(text); }
    catch (e) {
      if (htmlHint) {
        res.status(502).json({
          error: '上游返回了 HTML 页面而不是 JSON。请检查 API Base / OPENAI_BASE_URL：它应该是 OpenAI 兼容接口地址，例如 https://api.openai.com/v1，而不是网关首页或控制台页面。'
        });
        return;
      }
      res.status(502).json({ error: '上游返回非 JSON：' + text.slice(0, 300) }); return;
    }

    const content = (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
    res.status(200).json({ content });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};
