# 酒店管理系统 · 前端

基于 **Vue 3 + Vite** 的酒店业务前端，采用 **npm workspaces** 拆成两套独立应用，并共用一套请求与工具代码。

---

## 项目结构

```
frontend/
├── apps/
│   ├── client/           # 住客端（预订、订单、服务、通知等）
│   └── staff-admin/      # 工作人员 / 管理员公用端（按角色显示菜单）
├── packages/
│   └── shared/           # 共享：HTTP API、常量、格式化、本地存储、WebSocket
├── package.json          # 根脚本与依赖
└── README.md
```

| 应用 | 说明 |
| --- | --- |
| `apps/client` | 住客：注册/登录、房态、下单、我的订单、客房服务、通知、账户 |
| `apps/staff-admin` | 内部：工作台、客房、订单、入住、人员管理、服务任务、通知、审计日志等 |
| `packages/shared` | `api.js` 封装 `/api/v1` 下接口；`createNotificationSocket` 连接实时通知 |

---

## 技术栈

- **Vue 3**（Composition API）
- **Vue Router 4**
- **Vite 4.5.x**（与 `@vitejs/plugin-vue` 4.x 配套）
- **lucide-vue-next**（图标）

Node.js 建议使用 **18 LTS**；**14+** 一般也可运行（与根目录锁定的 Vite 版本兼容）。

---

## 前置条件

1. **先启动后端**（默认 `http://localhost:8080`），并保证数据库、Redis 可用。详见仓库内 [`../hotel-backend-master/README.md`](../hotel-backend-master/README.md)。
2. 后端 API 前缀为：`http://localhost:8080/api/v1`。

开发环境下，两个应用的 Vite 均已配置 **代理**：浏览器请求 `http://localhost:5173` 或 `5174` 下的 `/api/...` 会转发到 `http://localhost:8080`，无需单独处理 CORS。

---

## 安装依赖

在 **`frontend` 根目录**执行（只需一次）：

```bash
cd frontend
npm install
```

Windows PowerShell 示例：

```powershell
cd D:\面向对象期末网站\frontend
npm install
```

> 不要提交 `node_modules/`、`dist/`、`.env`（已在 `.gitignore` 中忽略）。

---

## 本地开发

需 **两个终端** 分别启动住客端与内部端（端口不同，可同时运行）。

| 命令 | 应用 | 浏览器地址 |
| --- | --- | --- |
| `npm run dev:client` | 住客端 | **http://localhost:5173** |
| `npm run dev:staff` | 工作人员 / 管理员端 | **http://localhost:5174** |

默认管理员（用于内部端登录测试，与后端种子数据一致）：

- 用户名：`admin`
- 密码：`admin123`

住客端使用 **`/auth/register`** 与 **`/auth/login`**（`guest` 角色）；内部端使用 **`/auth/staff-login`**（`employee` / `admin` / `waiter`）。

---

## 构建与预览

```bash
npm run build              # 依次构建 client + staff-admin
npm run build:client       # 仅住客端
npm run build:staff        # 仅内部端
```

产物目录：

- `apps/client/dist`
- `apps/staff-admin/dist`

本地预览构建结果（需先 `build`）：

```bash
npm run preview:client       # 默认 http://localhost:4173
npm run preview:staff        # 默认 http://localhost:4174
```

生产部署时，请将 **同一域名** 下的 `/api` 反向代理到后端 `http://<后端主机>:8080`，以便前端继续通过相对路径 `/api/v1` 访问接口；WebSocket 地址为同源下的 **`/api/v1/ws?token=<access_token>`**（见 `packages/shared/src/api.js`）。

---

## 常用脚本一览

| 脚本 | 作用 |
| --- | --- |
| `npm run dev:client` | 住客端开发服务器（5173） |
| `npm run dev:staff` | 内部端开发服务器（5174） |
| `npm run build` | 构建两套前端 |
| `npm run build:client` / `build:staff` | 单独构建 |
| `npm run preview:client` / `preview:staff` | 预览构建产物 |

---

## 端口汇总

| 服务 | 地址 |
| --- | --- |
| 后端 API | `http://localhost:8080/api/v1` |
| 住客端（开发） | `http://localhost:5173` |
| 内部端（开发） | `http://localhost:5174` |
| 住客端（preview） | `http://localhost:4173` |
| 内部端（preview） | `http://localhost:4174` |

---

## 认证与实时通知

- 登录成功后，JWT 存于浏览器 **`localStorage`**（由各应用 `stores/session.js` 管理），请求头自动携带：`Authorization: Bearer <access_token>`。
- 通知推送通过 **`createNotificationSocket`** 建立 WebSocket；开发环境下经 Vite 代理到后端（`vite.config.js` 中 `server.proxy` 已开启 `ws: true`）。

---

## 相关文档

- 后端安装、配置、接口说明：[../hotel-backend-master/README.md](../hotel-backend-master/README.md)
- 接口字段明细：[../hotel-backend-master/api-docs/api.md](../hotel-backend-master/api-docs/api.md)
- 仓库总览：[../README.md](../README.md)