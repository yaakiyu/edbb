const SLUG_LENGTH = 7;
const SLUG_CHARS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomSlug(length = SLUG_LENGTH) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += SLUG_CHARS[Math.floor(Math.random() * SLUG_CHARS.length)];
  }
  return result;
}

async function generateUniqueSlug(env) {
  for (let i = 0; i < 5; i++) {
    const slug = randomSlug();
    const exists = await env.SHORT_KV.get("share:" + slug);
    if (!exists) return slug;
  }
  return randomSlug(10);
}

// ========= CORS 許可リスト =========
const allowedOrigins = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/himais0giiiin\.com$/,
  /^https?:\/\/([a-zA-Z0-9-]+\.)?himais0giiiin\.com$/,
  /^https?:\/\/([a-zA-Z0-9-]+\.)?edbb\.himaiso\.workers\.dev$/
];

// ========= CORS ヘッダ生成 =========
function buildCorsHeaders(request) {
  const origin = request.headers.get("Origin");
  let headers = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (origin && allowedOrigins.some(regex => regex.test(origin))) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = buildCorsHeaders(request);

    // ===== OPTIONS: CORSプリフライト =====
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: cors,
      });
    }

    // ===== 1. 短縮URL生成 =====
    if (request.method === "POST" && url.pathname === "/share/create") {
      try {
        const body = await request.json();
        const share = body?.share;

        if (!share || typeof share !== "string") {
          return new Response(JSON.stringify({ error: "share は必須です" }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...cors,
            },
          });
        }

        const slug = await generateUniqueSlug(env);
        await env.SHORT_KV.put("share:" + slug, share);

        const baseOrigin = `${url.protocol}//${url.host}`;
        const shortUrl = `${baseOrigin}/${slug}`;

        return new Response(JSON.stringify({ url: shortUrl }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...cors,
          },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: "JSON が不正です" }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...cors,
          },
        });
      }
    }

    // ===== 2. リダイレクト =====
    if (request.method === "GET") {
      const slug = url.pathname.replace(/^\/+/, "");

      if (!slug) {
        return new Response("Not Found", {
          status: 404,
          headers: cors,
        });
      }

      const share = await env.SHORT_KV.get("share:" + slug);
      if (!share) {
        return new Response("Not Found", {
          status: 404,
          headers: cors,
        });
      }

      const redirectUrl =
        "https://himais0giiiin.com/editor/?share=" +
        encodeURIComponent(share);

      return Response.redirect(redirectUrl, 302);
    }

    return new Response("Not Found", {
      status: 404,
      headers: cors,
    });
  },
};
