import { createProxyMiddleware } from 'http-proxy-middleware';
try {
  console.log("Testing config...");
  const proxy = createProxyMiddleware({
    target: 'http://localhost:8888/api',
    changeOrigin: true,
  });
  console.log("Success");
} catch(e) {
  console.error(e);
}
