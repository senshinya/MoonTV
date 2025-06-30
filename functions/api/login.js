// EdgeOne Pages Function for /api/login
// 从 src/app/api/login/route.ts 迁移而来

export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // 检查环境变量中的密码设置
    const envPassword = env.PASSWORD;

    if (!envPassword) {
      // 如果没有设置密码，直接返回成功
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { password } = await request.json();
    if (typeof password !== 'string') {
      return new Response(JSON.stringify({ error: '密码不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const matched = password === envPassword;

    if (!matched) {
      return new Response(
        JSON.stringify({ ok: false, error: '密码错误' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '服务器错误' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
