# ABAC数据权限设计案例

## 1. 系统概述

### 1.1 业务场景

本案例基于订单管理系统，主要功能包括：
- 订单列表展示（主订单信息、收货人信息）
- 完成客户备注
- 发货单号填写

### 1.2 角色与权限需求

| 角色         | 负责区域         | 权限需求                               |
|--------------|------------------|----------------------------------------|
| 运营主管     | 大区域（如西南） | 只能查看和操作自己负责大区域的订单     |
| 运营专员     | 小区域（如四川省）| 只能查看和操作自己负责小区域的订单     |

### 1.3 权限特点

- 数据权限基于服务区域划分
- 运营主管和运营专员的数据可见范围不同
- 权限控制需要精确到订单数据级别

## 2. ABAC模型设计

### 2.1 ABAC核心要素

| 要素         | 描述                                     |
|--------------|----------------------------------------|
| 主体（Subject） | 访问系统的用户，如运营主管、运营专员        |
| 客体（Object） | 被访问的资源，如订单数据                   |
| 操作（Action） | 对客体的操作，如查看、修改、删除             |
| 环境（Environment） | 访问时的上下文信息，如时间、地点等      |
| 策略（Policy） | 基于属性的访问控制规则                     |

### 2.2 ABAC架构设计

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  策略管理点       │     │  策略信息点       │     │  属性存储        │
│  (PAP)          │     │  (PIP)          │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
          ▲                        ▲                        ▲
          │                        │                        │
          └───────────┬────────────┘────────────┬────────────┘
                      │                         │
                      ▼                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  策略执行点       │────▶│  策略决策点       │────▶│  应用系统       │
│  (PEP)          │     │  (PDP)          │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 3. 属性定义

### 3.1 主体属性

| 属性名称     | 属性类型   | 示例值           | 描述                     |
|--------------|------------|------------------|--------------------------|
| userId       | String     | "user001"        | 用户唯一标识             |
| userName     | String     | "张三"           | 用户姓名                 |
| role         | String     | "运营主管"       | 用户角色                 |
| manageLevel  | String     | "LEVEL_1"        | 管理级别（1:主管，2:专员）|
| serviceArea  | Array      | ["西南"]        | 负责的大区域             |
| subServiceArea | Array    | ["四川省", "重庆市"] | 负责的小区域           |

### 3.2 客体属性

| 属性名称     | 属性类型   | 示例值           | 描述                     |
|--------------|------------|------------------|--------------------------|
| orderId      | String     | "order001"       | 订单唯一标识             |
| orderArea    | String     | "西南"           | 订单所属大区域           |
| orderSubArea | String     | "四川省"         | 订单所属小区域           |
| orderType    | String     | "online"         | 订单类型                 |
| sensitivity  | String     | "normal"         | 数据敏感度               |

### 3.3 环境属性

| 属性名称     | 属性类型   | 示例值           | 描述                     |
|--------------|------------|------------------|--------------------------|
| accessTime   | DateTime   | "2023-10-01T09:00:00" | 访问时间 |
| accessIP     | String     | "192.168.1.100" | 访问IP地址               |
| deviceType   | String     | "PC"            | 访问设备类型             |

## 4. 策略规则设计

### 4.1 策略规则定义

使用简洁的对象属性方式表示策略规则：

#### 4.1.1 运营主管订单访问策略

```json
{
  "policyId": "主管订单访问策略",
  "ruleCombiningAlg": "deny-unless-permit",
  "target": {
    "subjects": [{
      "role": "运营主管"
    }],
    "resources": [{
      "resourceType": "order"
    }],
    "actions": ["view", "edit"]
  },
  "rules": [{
    "ruleId": "主管订单访问规则",
    "effect": "Permit",
    "conditions": [{
      "type": "string-is-in",
      "leftOperand": "resource.orderArea",
      "rightOperand": "subject.serviceArea"
    }]
  }]
}
```

#### 4.1.2 运营专员订单访问策略

```json
{
  "policyId": "专员订单访问策略",
  "ruleCombiningAlg": "deny-unless-permit",
  "target": {
    "subjects": [{
      "role": "运营专员"
    }],
    "resources": [{
      "resourceType": "order"
    }],
    "actions": ["view", "edit"]
  },
  "rules": [{
    "ruleId": "专员订单访问规则",
    "effect": "Permit",
    "conditions": [{
      "type": "string-is-in",
      "leftOperand": "resource.orderSubArea",
      "rightOperand": "subject.subServiceArea"
    }]
  }]
}
```

### 4.2 策略规则说明

| 策略名称        | 适用角色   | 条件                             | 允许操作               |
|---------------|-----------|---------------------------------|-----------------------|
| 主管订单访问策略 | 运营主管   | 订单所属大区域在用户负责的大区域列表中 | 查看、修改订单           |
| 专员订单访问策略 | 运营专员   | 订单所属小区域在用户负责的小区域列表中 | 查看、修改订单           |

## 5. 实现架构

### 5.1 系统架构图

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  应用层          │     │  权限控制层       │     │  数据层          │
│  ┌───────────┐  │     │  ┌───────────┐  │     │  ┌───────────┐  │
│  │  订单管理   │  │────▶│  │  PEP      │   │────▶│  │  订单数据  │  │
│  └───────────┘  │     │  │           │  │     │  └───────────┘  │
│                 │     │  ├───────────┤  │     │  ┌───────────┐  │
│                 │     │  │  PDP      │  │◀────│  │  用户数据  │  │
│                 │     │  │           │  │     │  └───────────┘  │
│                 │     │  ├───────────┤  │     │  ┌───────────┐  │
│                 │     │  │  PAP      │  │◀────│  │  策略数据  │  │
│                 │     │  │           │  │     │  └───────────┘  │
│                 │     │  └───────────┘  │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 5.2 关键组件实现

#### 5.2.1 策略执行点（PEP）

在订单管理系统的API入口处实现PEP，拦截所有订单访问请求：

```java
@Aspect
@Component
public class OrderAccessAspect {
    
    @Autowired
    private PDPClient pdpClient;
    
    @Around("execution(* com.order.service.OrderService.*(..))")
    public Object checkOrderAccess(ProceedingJoinPoint joinPoint) throws Throwable {
        // 1. 收集主体属性
        Subject subject = SecurityContextHolder.getContext().getAuthentication().getDetails();
        
        // 2. 收集客体属性
        Object[] args = joinPoint.getArgs();
        Order order = getOrderFromArgs(args);
        
        // 3. 收集环境属性
        Environment env = new Environment();
        env.setAccessTime(new Date());
        env.setAccessIP(RequestContextHolder.getRequestAttributes().getRemoteAddress());
        
        // 4. 构建访问请求
        AccessRequest request = new AccessRequest(subject, order, "view", env);
        
        // 5. 调用PDP进行决策
        AccessDecision decision = pdpClient.evaluate(request);
        
        // 6. 根据决策结果执行
        if (decision.isPermitted()) {
            return joinPoint.proceed();
        } else {
            throw new AccessDeniedException("无权访问该订单数据");
        }
    }
}
```

#### 5.2.2 策略决策点（PDP）

```java
@Service
public class PDPService {
    
    @Autowired
    private PolicyRepository policyRepository;
    
    public AccessDecision evaluate(AccessRequest request) {
        // 1. 获取适用的策略
        List<Policy> policies = policyRepository.findApplicablePolicies(
            request.getSubject().getRole(),
            request.getResource().getResourceType(),
            request.getAction()
        );
        
        // 2. 评估每个策略
        for (Policy policy : policies) {
            if (evaluatePolicy(policy, request)) {
                return new AccessDecision(true);
            }
        }
        
        return new AccessDecision(false);
    }
    
    private boolean evaluatePolicy(Policy policy, AccessRequest request) {
        // 实现策略评估逻辑
        // 比较主体、客体、环境属性是否满足策略条件
        
        Subject subject = request.getSubject();
        Order order = (Order) request.getResource();
        
        if ("运营主管".equals(subject.getRole())) {
            // 主管策略：订单大区域在用户负责的大区域列表中
            return subject.getServiceArea().contains(order.getOrderArea());
        } else if ("运营专员".equals(subject.getRole())) {
            // 专员策略：订单小区域在用户负责的小区域列表中
            return subject.getSubServiceArea().contains(order.getOrderSubArea());
        }
        
        return false;
    }
}
```

## 6. 具体案例演示

### 6.1 场景设置

#### 6.1.1 用户信息

| 用户ID  | 姓名   | 角色         | 管理级别 | 负责大区域 | 负责小区域         |
|---------|--------|--------------|----------|------------|--------------------|
| user001 | 张三   | 运营主管     | LEVEL_1  | ["西南"]   | []                 |
| user002 | 李四   | 运营主管     | LEVEL_1  | ["华北"]   | []                 |
| user003 | 王五   | 运营专员     | LEVEL_2  | []         | ["四川省"]        |
| user004 | 赵六   | 运营专员     | LEVEL_2  | []         | ["北京市"]        |

#### 6.1.2 订单信息

| 订单ID  | 订单大区域 | 订单小区域 | 订单金额 | 订单状态   |
|---------|------------|------------|----------|------------|
| order001| 西南       | 四川省     | 100.00   | 已支付     |
| order002| 西南       | 重庆市     | 200.00   | 已发货     |
| order003| 华北       | 北京市     | 150.00   | 已支付     |
| order004| 华北       | 天津市     | 300.00   | 待发货     |

### 6.2 访问控制演示

#### 6.2.1 运营主管张三访问订单

- 用户：张三（运营主管，负责西南区域）
- 访问请求：查看所有订单
- 决策过程：
  1. 收集主体属性：role=运营主管，serviceArea=["西南"]
  2. 收集客体属性：orderArea=西南/华北
  3. 应用主管订单访问策略
  4. 评估条件：orderArea是否在serviceArea中
- 访问结果：
  - 允许访问：order001, order002
  - 拒绝访问：order003, order004

#### 6.2.2 运营专员王五访问订单

- 用户：王五（运营专员，负责四川省）
- 访问请求：查看所有订单
- 决策过程：
  1. 收集主体属性：role=运营专员，subServiceArea=["四川省"]
  2. 收集客体属性：orderSubArea=四川省/重庆市/北京市/天津市
  3. 应用专员订单访问策略
  4. 评估条件：orderSubArea是否在subServiceArea中
- 访问结果：
  - 允许访问：order001
  - 拒绝访问：order002, order003, order004

#### 6.2.3 运营主管李四访问订单

- 用户：李四（运营主管，负责华北区域）
- 访问请求：查看所有订单
- 决策过程：
  1. 收集主体属性：role=运营主管，serviceArea=["华北"]
  2. 收集客体属性：orderArea=西南/华北
  3. 应用主管订单访问策略
  4. 评估条件：orderArea是否在serviceArea中
- 访问结果：
  - 允许访问：order003, order004
  - 拒绝访问：order001, order002

## 7. 优势与总结

### 7.1 ABAC模型的优势

1. **灵活性**：支持复杂的访问控制场景，能够根据多种属性组合进行权限判断
2. **可扩展性**：可以轻松添加新的属性和策略，无需修改现有架构
3. **细粒度控制**：能够实现对单个数据项的精确访问控制
4. **动态调整**：可以根据环境变化动态调整访问权限
5. **易于管理**：集中管理属性和策略，减少权限配置的复杂度

### 7.2 本案例总结

本案例基于ABAC模型设计了订单管理系统的数据权限控制方案，实现了：

1. 运营主管按大区域（西南、华北等）控制订单数据访问
2. 运营专员按小区域（四川省、北京市等）控制订单数据访问
3. 精确到单个订单的数据权限控制
4. 灵活可扩展的权限策略管理

通过ABAC模型的应用，系统能够满足复杂的业务场景需求，同时保持良好的可维护性和可扩展性。