# Portfolio Manager API Tests

这个目录包含了Portfolio Manager后端API的测试文件。

## 测试文件

### stock-operations.test.js
测试股票操作功能：
- ✅ 买入股票（指定价格）
- ✅ 卖出股票
- ✅ 验证持仓状态
- ✅ 检查现金余额变化

## 运行测试

### 前提条件
1. 确保后端服务器正在运行：
   ```bash
   npm run dev
   ```

2. 确保数据库已设置：
   ```bash
   npm run db:setup
   ```

### 运行测试
```bash
# 简单股票测试（推荐）
npm run test:simple

# Jest股票测试
npm run test:stocks
```

### 直接运行测试文件
```bash
# 使用Jest
npx jest tests/stock-operations.test.js --verbose
```

## 测试数据

测试使用默认用户ID (1)，使用现有数据库数据：
- 用户：john_doe
- 测试会修改现金余额和持仓数量
- 不会重置数据库数据

## 测试覆盖范围

### API端点测试
- `GET /api/portfolio/holdings` - 持仓列表
- `GET /api/portfolio/user` - 用户信息
- `POST /api/portfolio/buy` - 买入股票
- `POST /api/portfolio/sell` - 卖出股票

### 业务逻辑测试
- 股票买入/卖出
- 余额验证
- 错误处理
- 数据一致性

## 注意事项

1. **测试顺序**：测试会修改数据库状态，建议按顺序运行
2. **网络依赖**：部分测试需要访问Yahoo Finance API获取实时价格
3. **超时设置**：测试超时设置为30秒，适应网络延迟
4. **数据保护**：测试使用现有数据，不会重置数据库

## 故障排除

### 常见问题

1. **连接错误**：
   ```
   Error: connect ECONNREFUSED 127.0.0.1:3000
   ```
   解决方案：确保后端服务器正在运行

2. **数据库错误**：
   ```
   Error: ER_NO_SUCH_TABLE
   ```
   解决方案：运行 `npm run db:setup`

3. **网络超时**：
   ```
   Error: fetch failed
   ```
   解决方案：检查网络连接，可能需要VPN

## 扩展测试

要添加新的测试，请：
1. 在 `tests/` 目录下创建新的测试文件
2. 使用相同的测试结构和命名约定
3. 在 `package.json` 中添加新的测试脚本 