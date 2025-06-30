// EdgeOne Pages Function for /api/playrecords
// 从 src/app/api/playrecords/route.ts 迁移而来

export async function onRequest(context) {
  const { request } = context;
  
  if (request.method === 'GET') {
    try {
      // 简化版播放记录获取
      // 实际项目中需要实现数据库连接
      const records = [];
      
      return new Response(JSON.stringify(records), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { key, record } = body;

      if (!key || !record) {
        return new Response(JSON.stringify({ error: 'Missing key or record' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 验证播放记录数据
      if (!record.title || !record.source_name || record.index < 1) {
        return new Response(JSON.stringify({ error: 'Invalid record data' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 简化版保存逻辑
      // 实际项目中需要实现数据库保存
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
