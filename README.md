# HAAVK · 骇爪网上冲浪网页ai复刻

> [!IMPORTANT]  
> **免责声明 / Disclaimer**
>
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

| 模块                      | 说明                                                         |
| ----------------------- | ---------------------------------------------------------- |
| 关于我们 `/`                | 全宽 Hero 轮播、优秀员工卡（立绘出框）、员工之声                                |
| 员工论坛 `/forum`           | 帖子列表（置顶 / 未读 / 筛选 / 已读兜底）、帖子详情（点赞 / 回复 / 配图）               |
| 解决方案 `/solutions`       | 装备轮播横幅 + 商品列表（详情展开）                                        |
| 寻人启事 `/missing-persons` | 竖版海报卡 + 提交线索 / 重置                                          |
| 个人中心 `/profile`         | 改头像（点击即传）、改昵称、改密码（校验原密码）                                   |
| 注意力点数                   | 每日重置：普通用户 10,000 / 管理员 1,000,000；发帖 -100、回复 -50，不足拦截       |
| 后台 `/admin/**`          | 控制台、帖子 / 商品 / 寻人启事 / 员工管理、操作日志（含图上传）                       |
| 权限                      | 角色 `ADMIN` / `USER`（默认）；`/admin/**` 需登录 + 管理员；未登录写操作统一引导登录 |

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

## 接口文档

- 统一返回体：`{ code, message, data, timestamp }`，`code = 0` 为成功；
- **鉴权规则**：公开 `GET`（前台只读）匿名可访问；所有**写操作**与 `/api/me/**` 需要 `Authorization: Bearer <JWT>`（登录 / 注册 / 刷新除外）；
- 前端层：`frontend/src/api/*`（axios 封装：自动带 Token、统一解包、401 处理）。

### 认证与个人中心 `/api/auth`、`/api/me`

| 方法   | 路径                         | 鉴权 | 说明                                          |
| ---- | -------------------------- | -- | ------------------------------------------- |
| POST | `/api/auth/login`          | 公开 | 登录，返回 `{ token, username, nickname, role }` |
| POST | `/api/auth/register`       | 公开 | 注册（默认角色 USER），成功即返回 Token                   |
| GET  | `/api/auth/me`             | 登录 | 当前用户（含 role，用于刷新权限）                         |
| GET  | `/api/auth/profile`        | 登录 | 个人中心资料（不含密码）                                |
| PUT  | `/api/auth/profile`        | 登录 | 改昵称 / 头像（头像需先经 `/api/upload`）               |
| PUT  | `/api/auth/password`       | 登录 | 改密码（校验原密码，6~64 位）                           |
| GET  | `/api/me/attention-points` | 登录 | 我的注意力点数（每日重置后实时余额）                          |

### 帖子与回复 `/api/posts`、`/api/replies`

| 方法     | 路径                            | 鉴权 | 说明                                    |
| ------ | ----------------------------- | -- | ------------------------------------- |
| GET    | `/api/posts/published`        | 公开 | 前台列表（置顶优先，时间倒序）                       |
| GET    | `/api/posts`                  | 公开 | 后台分页（`page` / `pageSize` / `keyword`） |
| GET    | `/api/posts/{id}`             | 公开 | 详情（作者信息由 `employee` 表组装）              |
| POST   | `/api/posts`                  | 登录 | 发帖（**扣 100 注意力点数**，正文/配图至少其一）         |
| PUT    | `/api/posts/{id}`             | 登录 | 编辑帖子                                  |
| DELETE | `/api/posts/{id}`             | 登录 | 软删除                                   |
| PATCH  | `/api/posts/{id}/pin?pinned=` | 登录 | 置顶 / 取消（**query 参数**，非 body）          |
| GET    | `/api/posts/{postId}/replies` | 公开 | 回复列表（时间正序）                            |
| POST   | `/api/posts/{postId}/replies` | 登录 | 回复（**扣 50 注意力点数**，作者取 JWT）            |
| DELETE | `/api/replies/{id}`           | 登录 | 删除回复                                  |

### 商品 `/api/products`

| 方法     | 路径                                     | 鉴权 | 说明               |
| ------ | -------------------------------------- | -- | ---------------- |
| GET    | `/api/products` / `/on-sale` / `/{id}` | 公开 | 列表 / 前台上架列表 / 详情 |
| POST   | `/api/products`                        | 登录 | 新增（后台）           |
| PUT    | `/api/products/{id}`                   | 登录 | 编辑               |
| DELETE | `/api/products/{id}`                   | 登录 | 软删除              |
| PATCH  | `/api/products/{id}/status?status=`    | 登录 | 上下架（query 参数）    |

### 寻人启事 `/api/missing-persons`

| 方法     | 路径                                            | 鉴权 | 说明                                                  |
| ------ | --------------------------------------------- | -- | --------------------------------------------------- |
| GET    | `/api/missing-persons` / `/on-sale` / `/{id}` | 公开 | 分页（`page`/`pageSize`/`keyword`/`status`）/ 前台列表 / 详情 |
| POST   | `/api/missing-persons`                        | 登录 | 新增人物                                                |
| PUT    | `/api/missing-persons/{id}`                   | 登录 | 编辑                                                  |
| DELETE | `/api/missing-persons/{id}`                   | 登录 | 软删除                                                 |
| PATCH  | `/api/missing-persons/{id}/status?status=`    | 登录 | 上下架                                                 |
| PATCH  | `/api/missing-persons/{id}/submit`            | 登录 | 前台「提交线索」→ `submitted=true`（幂等）                      |
| DELETE | `/api/missing-persons/{id}/submit`            | 登录 | 后台重置提交态                                             |

### 其它

| 方法   | 路径                               | 鉴权 | 说明                                                                                           |
| ---- | -------------------------------- | -- | -------------------------------------------------------------------------------------------- |
| GET  | `/api/employees`、`/page`、`/{id}` | 公开 | 员工列表 / 分页 / 详情                                                                               |
| GET  | `/api/dashboard`                 | 登录 | 控制台统计（帖子/商品/寻人/员工数）                                                                          |
| GET  | `/api/logs?page=&pageSize=`      | 登录 | 操作日志分页                                                                                       |
| POST | `/api/upload`                    | 登录 | 图片上传（multipart 字段名 `file`，≤50MB），返回 `/uploads/yyyyMMdd/xxx.png`；图片本体存磁盘 `UPLOAD_DIR`，数据库只存地址 |

## 后端环境变量

| 变量                                                     | 默认                             | 说明                 |
| ------------------------------------------------------ | ------------------------------ | ------------------ |
| `DB_USERNAME` / `DB_PASSWORD`                          | `root` / `change-me`           | 数据库账号              |
| `JWT_SECRET`                                           | 开发默认值                          | **生产必改**（≥48 位随机串） |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `ADMIN_NICKNAME` | `admin` / `admin123` / `集团管理员` | 首次启动自动创建的管理员（表为空时） |
| `UPLOAD_DIR`                                           | `./uploads`                    | 上传图片目录（生产用绝对路径）    |
| `CORS_ORIGINS`                                         | `http://localhost:5173`        | 允许的跨域来源            |
