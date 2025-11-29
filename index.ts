const SLUG_LENGTH = 7;
const SLUG_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const SLUG_REGEX = /^[A-Za-z0-9_-]{3,32}$/;

type KVNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

interface AssetFetcher {
  fetch(request: Request): Promise<Response>;
}

interface Env {
  SHORT_KV: KVNamespace;
  ASSETS?: AssetFetcher;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

function randomSlug(length = SLUG_LENGTH): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += SLUG_CHARS[Math.floor(Math.random() * SLUG_CHARS.length)];
  }
  return result;
}

async function generateUniqueSlug(env: Env): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const slug = randomSlug();
    const exists = await env.SHORT_KV.get(`share:${slug}`);
    if (!exists) return slug;
  }
  return randomSlug(10);
}

// ========= CORS 許可リスト =========
const allowedOrigins: RegExp[] = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/himais0giiiin\.com$/,
  /^https?:\/\/([a-zA-Z0-9-]+\.)?himais0giiiin\.com$/,
  /^https?:\/\/([a-zA-Z0-9-]+\.)?edbb\.himaiso\.workers\.dev$/,
];

// ========= CORS ヘッダ生成 =========
function buildCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (origin && allowedOrigins.some((regex) => regex.test(origin))) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

function respondJson(status: number, data: unknown, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...cors,
    },
  });
}

function respondText(status: number, message: string, cors: Record<string, string>): Response {
  return new Response(message, {
    status,
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
      ...cors,
    },
  });
}

async function proxyAssets(
  request: Request,
  env: Env,
  cors: Record<string, string>,
): Promise<Response> {
  if (env.ASSETS?.fetch) {
    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse && assetResponse.status !== 404) {
      const headers = new Headers(assetResponse.headers);
      Object.entries(cors).forEach(([key, value]) => headers.set(key, value));
      return new Response(assetResponse.body, {
        status: assetResponse.status,
        headers,
      });
    }
  }
  return respondText(404, 'Not Found', cors);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const cors = buildCorsHeaders(request);

    // ===== OPTIONS: CORSプリフライト =====
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: cors,
      });
    }

    // ===== 1. 短縮URL生成 =====
    if (request.method === 'POST' && url.pathname === '/share/create') {
      let body: unknown;
      try {
        body = await request.json();
      } catch (error) {
        return respondJson(400, { error: 'JSON が不正です' }, cors);
      }

      const share = (body as Record<string, unknown>)?.share;
      if (!share || typeof share !== 'string') {
        return respondJson(400, { error: 'share は必須です' }, cors);
      }

      if (!env.SHORT_KV || typeof env.SHORT_KV.put !== 'function' || typeof env.SHORT_KV.get !== 'function') {
        return respondJson(503, { error: 'KV が設定されていません (SHORT_KV)' }, cors);
      }

      let slug: string;
      try {
        slug = await generateUniqueSlug(env);
        await env.SHORT_KV.put(`share:${slug}`, share);
      } catch (error) {
        console.error('KV write failed', error);
        return respondJson(500, { error: '短縮 URL の生成に失敗しました' }, cors);
      }

      const shortUrl = `${url.origin}/${slug}`;
      return respondJson(200, { url: shortUrl }, cors);
    }

    // ===== 2. リダイレクト =====
    if (request.method === 'GET') {
      const path = url.pathname.replace(/^\/+/, '');
      const isSlugCandidate = SLUG_REGEX.test(path);

      if (isSlugCandidate) {
        if (!env.SHORT_KV || typeof env.SHORT_KV.get !== 'function') {
          return respondText(503, 'KV が設定されていません (SHORT_KV)', cors);
        }
        try {
          const share = await env.SHORT_KV.get(`share:${path}`);
          if (share) {
            const redirectUrl = `https://himais0giiiin.com/editor/?share=${encodeURIComponent(share)}`;
            return new Response(null, {
              status: 302,
              headers: {
                Location: redirectUrl,
                ...cors,
              },
            });
          }
        } catch (error) {
          console.error('KV read failed', error);
          return respondText(500, 'Internal Error', cors);
        }
      }

      // 静的アセットへフォールバック
      return proxyAssets(request, env, cors);
    }

    return respondText(404, 'Not Found', cors);
  },
};
