# HAAVK · Linux 服务器部署手册

> **目标环境**：Ubuntu 22.04 + 宝塔面板
> **架构**：Nginx（静态前端 + 反向代理）→ Spring Boot jar（8080）→ MySQL 8
> **适用版本**：当前代码（含个人中心 / 注意力点数 / 论坛头像）
> **写在前面**：全程只需要在**本地电脑**打包两个产物（前端 `dist/`、后端 `*.jar`），服务器上不装 Node、不装 Maven。

---

## 0. 总览：要部署什么、放在哪

| 产物 | 本地位置 | 服务器位置 | 说明 |
|---|---|---|---|
| 前端静态文件 | `frontend/dist/` | `/www/wwwroot/haavk-web` | Nginx 托管 |
| 后端 jar | `backend/target/haavk-backend-0.1.0.jar` | `/www/haavk/haavk-backend.jar` | 宝塔 Java 项目管理器运行 |
| 数据库脚本 | `database/schema.sql` + `data.sql` | 只需导入一次 | 建表 + 种子数据 |
| 上传目录 | —— | `/www/haavk/uploads`（自动创建） | 用户上传的图片落这里 |

**端口规划**：80/443 对外（Nginx）；8080 只对本机（后端，**不要在防火墙放行**）；3306 只对本机。

**目录规划**（可自行调整，下文统一按此写）：

```text
/www/haavk/                 # 后端相关
├─ haavk-backend.jar        # 后端程序
├─ uploads/                 # 上传目录（后端自动创建，也可手动建）
└─ logs/                    # 后端日志（可选）
/www/wwwroot/haavk-web/     # 前端静态站点（dist 内容）
```

---

## 1. 本地打包（Windows 开发机）

### 1.1 前端

```bash
cd E:/Text/HFK/haavk/frontend
npm run build
```

- 产物在 `frontend/dist/`（构建已配置生产模式走相对路径 `/api`，无需改任何东西）。
- 把 `dist/` **整个目录**的内容先打成 zip 备用（如 `dist.zip`）。

### 1.2 后端

```bash
cd E:/Text/HFK/haavk/backend
mvn clean package -DskipTests
```

- 产物：`backend/target/haavk-backend-0.1.0.jar`
- （本机用 IDEA 内置 Maven：`E:/IDE/IntelliJ IDEA 2026.1.3/plugins/maven/lib/maven3/bin/mvn`）

---

## 2. 宝塔安装运行环境

宝塔面板 →【软件商店】依次安装：

| 软件 | 版本要求 | 说明 |
|---|---|---|
| **Nginx** | 1.22+ 任意 | 反代 + 静态托管 |
| **MySQL** | **8.0**（必须 8.x） | 项目用了 CTE/窗口函数兼容写法与 `utf8mb4`，5.7 不保证 |
| **Java 项目管理器** | 最新 | 用来托管 Spring Boot jar、开机自启、崩溃拉起 |

装好后，在【Java 项目管理器】→【JDK 管理】里安装/添加 **JDK 17**（面板可一键装 OpenJDK 17；也可以手动上传 Oracle/OpenJDK 17 的 Linux 包）。

> 验证：SSH 里 `java -version` 若面板装的 JDK 不在 PATH，不影响——Java 项目管理器会显式指定 JDK 路径。

---

## 3. 数据库：建库 + 导入

### 3.1 建库（注意 utf8mb4）

宝塔【数据库】→【添加数据库】：

- 数据库名：`haavk`
- 用户名：`haavk`（**别用 root 跑应用**）
- 密码：自己生成一个强密码（下文记作 `<DB_PASSWORD>`）
- 字符集：**utf8mb4**

### 3.2 导入脚本

宝塔【数据库】→ `haavk` →【导入】，按顺序导入两个文件：

1. `database/schema.sql`（建 7 张表）
2. `database/data.sql`（商品/员工/公告/admin 账号等种子数据）

> 导入后自带管理员账号 `admin / admin123`（**第 7 步必须改密码**）。

### 3.3 允许本机访问即可

数据库权限选「本地服务器」（不能选所有人，3306 不对外）。

---

## 4. 上传文件

宝塔【文件】里创建目录并上传：

```text
/www/haavk/haavk-backend.jar      ← 本地 target/haavk-backend-0.1.0.jar 改名上传
/www/haavk/uploads/               ← 手动建好（空目录，权限 755）
/www/wwwroot/haavk-web/           ← dist.zip 上传到这里后右键解压
```

解压后 `haavk-web` 下应直接是 `index.html`、`assets/` 等（**不要多套一层 dist 目录**）。

---

## 5. 宝塔部署后端（Java 项目管理器）

【Java 项目管理器】→【添加 Java 项目】：

| 配置项 | 值 |
|---|---|
| 项目类型 | Spring Boot / jar |
| 项目路径 | `/www/haavk/haavk-backend.jar` |
| JDK 版本 | **17** |
| 运行端口 | `8080` |
| 项目执行命令 | 见下方 |
| 开机自启 | ✓ |
| 崩溃自动重启 | ✓（若有此选项） |

**环境变量**（管理器里的「环境变量」或「JVM 参数/启动参数」处填写，生产**必须**覆盖这些）：

```bash
DB_USERNAME=haavk
DB_PASSWORD=<你的数据库密码>
JWT_SECRET=<换成 64 位以上随机字符串>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<首次启动后请立即在网页里改掉>
UPLOAD_DIR=/www/haavk/uploads
CORS_ORIGINS=https://你的域名
```

说明：

- `JWT_SECRET`：生产必改（泄漏即可伪造登录态）。可用 `openssl rand -base64 48` 生成。
- `CORS_ORIGINS`：前端实际访问的协议+域名；走 Nginx 同源反代时其实几乎用不到跨域，但配上更稳。
- `UPLOAD_DIR` 用**绝对路径**，避免「工作目录在哪 uploads 就在哪」的歧义。
- ⚠️ **不要**用环境变量 `SERVER_PORT` 或启动参数里乱传 `server.port`——Spring 松散绑定容易踩坑（本机曾因 `SERVER__PORT` 被绑定成 5712）。端口就用 yml 默认的 8080。

启动后在【Java 项目管理器】里看日志，出现 `Started HaavkBackendApplication` 即成功。

**验证**：

```bash
curl http://127.0.0.1:8080/api/auth/me
# 返回 {"code":401,...} 就是活的（未登录当然 401）
```

---

## 6. 宝塔部署前端（Nginx 静态站 + 反代）

【网站】→【添加站点】：

- 域名：你的域名（或服务器 IP）
- 根目录：`/www/wwwroot/haavk-web`
- PHP 版本：纯静态

### 6.1 伪静态 / 配置文件（关键）

站点设置 →【配置文件】，在 `server { }` 里确认有以下三段（宝塔默认生成的 `location` 等可保留）：

```nginx
# ① 前端是 history 路由：刷新子页面不能 404
location / {
    root /www/wwwroot/haavk-web;
    try_files $uri $uri/ /index.html;
}

# ② 后端接口反代
location /api/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    client_max_body_size 100m;   # 与后端 multipart 上限一致（单文件 50MB）
}

# ③ 上传的图片（后端静态资源）
location /uploads/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    expires 7d;
}
```

保存并重载 Nginx。

> ⚠️ 三段缺一不可：没有 ① 刷新 `/forum` 会 404；没有 ② 所有接口不通；没有 ③ 论坛/头像图片全部裂图。

---

## 7. 上线后安全清单（必做）

1. **改管理员密码**：登录 `/admin/login` → 右上角用户菜单 → 个人中心 → 修改密码（顺带会要求重新登录）。
2. **JWT_SECRET 已换**（第 5 步）。
3. **数据库密码**已是强密码，且只在 `DB_PASSWORD` 环境变量里出现。
4. 宝塔【安全】/ 云服务器安全组：**只放行 80、443、宝塔面板端口**；**不放行 8080 和 3306**。
5. 建议 SSL：站点设置 →【SSL】→ Let's Encrypt 一键证书 + 强制 HTTPS；若启用 HTTPS，`CORS_ORIGINS` 同步改成 `https://你的域名`。
6. 建议 MySQL 每日备份：宝塔【计划任务】→ 备份数据库 `haavk`；顺带加一条备份 `/www/haavk/uploads` 目录的任务。

---

## 8. 部署验证清单

浏览器逐项过一遍（`http://你的域名`）：

| # | 检查项 | 预期 |
|---|---|---|
| 1 | 打开首页 | Hero「天空属于哈夫克」+ 员工卡正常 |
| 2 | 右上角登录 → `admin / admin123` | 登录成功，右上角出现用户菜单与「注意力点数 1,000,000」 |
| 3 | `/forum` 列表 → 进任意帖子 → 发一条回复 | 回复成功、点数 -50、头像正常显示 |
| 4 | 发一帖（带图） | 成功跳详情、点数 -100、图片能显示 |
| 5 | 个人中心改头像 / 改昵称 | 导航栏立即生效；论坛新发言头像同步 |
| 6 | `/solutions`、`/missing-persons` | 商品 9 件、寻人 2 人正常渲染 |
| 7 | 进后台 `/admin` | 侧栏哈夫克 logo、控制台统计数字正常 |
| 8 | 后台改一条数据 → 刷新前台 | 改动生效 |
| 9 | 直接刷新 `/forum`、`/admin` 等子路径 | 不 404（伪静态生效） |
| 10 | 退出登录后访问 `/admin` | 跳回登录页 |

---

## 9. 日常运维

| 操作 | 方法 |
|---|---|
| 看后端日志 | 宝塔【Java 项目管理器】→ 项目日志；或 `/www/haavk/` 下项目输出的日志文件 |
| 重启后端 | Java 项目管理器 → 重启（**改了 jar 才需要**） |
| 更新后端 | 上传新 jar 覆盖 `/www/haavk/haavk-backend.jar` → 重启项目 |
| 更新前端 | 上传新 dist 解压覆盖 `/www/wwwroot/haavk-web/`（建议先清空旧文件再解压），浏览器强刷 Ctrl+F5 |
| 备份 | 宝塔计划任务：每日备份数据库 + `/www/haavk/uploads` |

> 更新后端 jar 前**先停项目再替换文件**，避免文件占用/半写入。

---

## 10. 常见问题（FAQ）

**Q1：页面能开，但一刷新 `/forum` 就 404？**
→ 伪静态没配 `try_files ... /index.html`（见 §6.1 ①）。

**Q2：所有接口都「网络连接失败」？**
→ `location /api/` 反代没配或 Nginx 没重载；`curl http://127.0.0.1:8080/api/auth/me` 先确认后端活着。

**Q3：帖子里/头像图片全裂？**
→ `location /uploads/` 没配；或 `UPLOAD_DIR` 与实际目录不一致。上传一张新图看文件落在哪。

**Q4：登录报「账号或密码错误」？**
→ 确认导入了 `data.sql`（admin 账号在种子里）；或用数据库重置：
`UPDATE admin_user SET role='ADMIN' WHERE username='admin';`（提权）／密码请走「注册新号+改库提权」或找回 BCrypt 生成。

**Q5：普通用户进不去后台？**
→ 设计如此。提权只能改库：
```sql
UPDATE admin_user SET role = 'ADMIN' WHERE username = 'xxx';
```
改完刷新页面即生效。

**Q6：后端起不来，日志报端口/绑定异常？**
→ 检查启动参数里是否误传了 `SERVER_PORT`/`SERVER__PORT` 之类变量（Spring 松散绑定会劫持 `server.port`）。8080 被占则先查：`ss -tlnp | grep 8080`。

**Q7：中文乱码？**
→ 建库时字符集必须 `utf8mb4`；连接串里已带 `characterEncoding=utf8`，不用改。

**Q8：服务器内存小，后端被 OOM 杀？**
→ 加 swap（`fallocate`/`dd` + `mkswap`，2G 足够），或在 Java 项目管理器限制 `-Xmx512m -Xms256m`（本项目很轻，512m 足够）。

**Q9：想改发帖/回复扣的点数或每日满额？**
→ 常量在后端 `EmployeeService`（`POST_COST=100` / `REPLY_COST=50` / `DEFAULT_POINTS_USER=10000` / `DEFAULT_POINTS_ADMIN=1000000`），改完重新打包部署。

---

## 附：一分钟速查（老手版）

```bash
# 本地
cd frontend && npm run build          # 产物 dist/
cd backend && mvn clean package -DskipTests   # 产物 target/haavk-backend-0.1.0.jar

# 服务器（宝塔）
# 1. 软件商店：Nginx + MySQL8.0 + Java项目管理器(JDK17)
# 2. 建库 haavk(utf8mb4)，按顺序导入 database/schema.sql、data.sql
# 3. /www/haavk/ 放 jar；环境变量 DB_USERNAME/DB_PASSWORD/JWT_SECRET/UPLOAD_DIR/CORS_ORIGINS
# 4. 站点根目录 /www/wwwroot/haavk-web（dist 内容），配置 try_files + /api/ + /uploads/ 反代 127.0.0.1:8080
# 5. 防火墙只开 80/443；登录后立刻改 admin 密码
```
