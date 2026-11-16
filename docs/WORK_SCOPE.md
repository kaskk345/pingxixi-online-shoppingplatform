# 分工说明 · 组长 / 配置主管 / 手动测试（何易）

- 分支：`topic/lead-heyi`
- 角色：组长、配置主管、手动测试
- 负责目录：`docs/`、仓库根目录文档
- 职责：分支管理、评审材料、手动测试、`topic → develop → master` 合并与发布

## 负责内容

### 文档（2 个）

- `README.md`
- `产品订单_ProductBacklog.md`

### 本分支已归档的团队资料

- `docs/git-flow.svg` — 团队 Git Flow 分支流程图（矢量版）
- `docs/git-flow.png` — 同一张图的 PNG 版（GitHub 可直接预览）

### 配置管理

- 维护 `master`（发布）、`develop`（开发）与 5 个 `topic/*` 分支
- 汇总：`topic/*` → Pull Request → `develop`
- 发布：`develop` 测试通过 → `master`

## 工作边界

- 不直接修改 `backend/`、`frontend/` 业务代码
- 手动测试发现的问题记录到 `docs/` 并分派给对应负责人
- 合并前确认各分支构建与测试通过

## 说明

上述文档已随提交 `4d6085b` 合入 `main`；本分支用于评审材料、流程图与合并记录留痕。
