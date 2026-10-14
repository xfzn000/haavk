# HAAVK · 哈夫克集团企业内部系统

> [!IMPORTANT]
> **免责声明 / Disclaimer**
> - 本项目为 **AI 辅助复刻的练手作品**，仅用于**个人学习与技术练习**，**不进行任何商业用途**。
> - 项目中的世界观、名称（如「哈夫克」）及相关素材元素源自游戏《三角洲行动》（Delta Force），版权归**官方原版权方所有**；部分示意素材来自公开网络，仅作学习演示。
> - 本项目与腾讯/《三角洲行动》官方**没有任何关联**，也不是官方产品或官方复刻。
> - 若您是版权方且认为本仓库内容构成侵权，请提出 issue 或联系我，我会第一时间删除相关内容。
> - 请勿将本项目或其代码用于任何商业场景；如需商用，请联系原版权方获得授权。

> 科幻战术 / 军工 HUD 风格的企业内部系统。前台面向员工（关于我们 / 员工论坛 / 解决方案 / 寻人启事 / 个人中心），后台用于管理前台内容，前后端分离、数据打通。

- **前端**：Vue 3 + TypeScript + Vite + Tailwind CSS + Pinia + Vue Router + Axios + lucide-vue-next
- **后端**：Java 17 + Spring Boot 3.2 + Maven + MySQL 8 + MyBatis-Plus + Spring Security + JWT（jjwt）
- **视觉**：军事 / 游戏化 HUD 冷色系（浅灰蓝底 + 蓝主色 + 深色 Hero + 底部 HUD 状态条）

---

## 功能一览

| 模块 | 说明 |
|---|---|
| 关于我们 `/` | 全宽 Hero 轮播、优秀员工卡（立绘出框）、员工之声 |
| 员工论坛 `/forum` | 帖子列表（置顶 / 未读 / 筛选 / 已读兜底）、帖子详情（点赞 / 回复 / 配图） |
| 解决方案 `/solutions` | 装备轮播横幅 + 商品列表（详情展开） |
| 寻人启事 `/missing-persons` | 竖版海报卡 + 提交线索 / 重置 |
| 个人中心 `/profile` | 改头像（点击即传）、改昵称、改密码（校验原密码） |
| 注意力点数 | 每日重置：普通用户 10,000 / 管理员 1,000,000；发帖 -100、回复 -50，不足拦截 |
| 后台 `/admin/**` | 控制台、帖子 / 商品 / 寻人启事 / 员工管理、操作日志（含图上传） |
| 权限 | 角色 `ADMIN` / `USER`（默认）；`/admin/**` 需登录 + 管理员；未登录写操作统一引导登录 |

## 目录结构

```text
Aa/
├─ frontend/                 # Vue 3 前端
│  ├─ src/
│  │  ├─ assets/             # 素材解析注册表 / 格式化工具
│  │  ├─ components/         # 公共组件（导航 / 背景 / 状态栏 / 弹窗 / 上传器 …）
│  │  ├─ layouts/            # AppShell（前台）、AdminShell（后台）
│  │  ├─ pages/              # 用户端 6 页 + pages/admin/* 后台 6 页
│  │  ├─ router/             # 路由表 + 登录守卫
│  │  ├─ stores/             # Pinia（auth / forum / session / toast …）
│  │  ├─ mock/               # Mock 数据（离线自测可切换）
│  │  ├─ api/                # Axios API 层
│  │  └─ types/              # 全局 TS 类型
│  └─ package.json
├─ backend/                  # Spring Boot 后端
│  ├─ src/main/java/com/haavk/
│  │  ├─ common/ config/ security/
│  │  ├─ entity/ mapper/ service/ dto/ vo/ controller/
│  └─ pom.xml
├─ database/
│  ├─ schema.sql             # 建库建表（7 张表，纯结构）
│  └─ data.sql               # 有意留空 —— 不附带业务数据
├─ docker-compose.yml        # 可选：MySQL + 后端
├─ 启动说明.md                # 本地开发环境
├─ 部署手册-Linux.md          # Ubuntu 22 + 宝塔面板生产部署
└─ 论坛数据接口契约.md / 寻人启事数据接口契约.md
```

## 快速开始（本地开发）

环境：Node 18+ / JDK 17 / Maven 3.8+ / MySQL 8

```bash
# 1. 数据库：创建 utf8mb4 库 haavk，导入 database/schema.sql
# 2. 后端（默认 8080，可用环境变量 DB_USERNAME / DB_PASSWORD 覆盖）
cd backend && mvn spring-boot:run
# 3. 前端
cd frontend && npm install && npm run dev    # http://localhost:5173
```

- 离线自测：`frontend/.env` 设 `VITE_USE_MOCK=true`（不依赖后端）。
- 后端首次启动（`admin_user` 为空）会自动创建默认管理员 `admin / admin123`（环境变量 `ADMIN_USERNAME` / `ADMIN_PASSWORD` 可覆盖，**上线必改**）。
- 其它账号注册后默认普通用户（USER），提权请手动执行：

```sql
UPDATE admin_user SET role = 'ADMIN' WHERE username = '你的账号';
```

## 生产部署

见 **[部署手册-Linux.md](./部署手册-Linux.md)**（Ubuntu 22 + 宝塔面板：Nginx 静态托管 + 反向代理 + Spring Boot jar + MySQL 8）。

## 上传文件说明

用户上传的图片保存在服务器磁盘 `UPLOAD_DIR`（按日期分目录），数据库仅存地址字符串（如 `/uploads/20261014/xxx.png`）。备份 / 迁移时请「数据库 + uploads 目录」一起处理。

## 接口约定

后端统一返回 `{ code, message, data, timestamp }`，`code = 0` 为成功。接口清单见两份契约文档。
