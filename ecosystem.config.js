// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "finmap",
      script: "web.js",
      env: {
        NODE_ENV: "production",
        TZ: "Asia/Seoul",
      },
    },
    {
      name: "finmap-crawler",
      script: "server/crawler/runner.js",
      env: {
        NODE_ENV: "production",
        TZ: "Asia/Seoul",
      },
      // 크롤러는 메모리 피크/누수 대비 리스타트 정책을 둡니다.
      max_memory_restart: "900M",
      kill_timeout: 15000,
      restart_delay: 5000,
    },
  ],
};
