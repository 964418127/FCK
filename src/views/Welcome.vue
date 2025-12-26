<template>
  <div class="welcome-page">
    <div class="welcome-header">
      <div class="welcome-content">
        <div class="welcome-icon">
          <el-icon size="64" :style="{ color: 'hsl(var(--primary-foreground))' }"><HomeFilled /></el-icon>
        </div>
        <h1 class="welcome-title">欢迎使用 TLZJ 平台</h1>
        <p class="welcome-subtitle">推拿之家 · 数字化平台</p>
        <div class="welcome-description">
          <p>这里是您的数据校验工作台，提供专业的差异数据确认和管理服务。</p>
        </div>
      </div>
    </div>

    <div class="welcome-actions">
      <el-card class="action-card" shadow="hover">
        <div class="action-content">
          <div class="action-icon">
            <el-icon size="48" color="#67C23A"><Calendar /></el-icon>
          </div>
          <div class="action-text">
            <h3>月差异确认</h3>
            <p>查看与确认周期内的差异数据，决定是否继续发放工资</p>
          </div>
          <el-button type="primary" @click="goToDiffConfirm" size="large">
            进入数据校验
            <el-icon class="el-icon--right"><ArrowRight /></el-icon>
          </el-button>
        </div>
      </el-card>
    </div>

    <div class="welcome-footer">
      <div class="footer-info">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <el-icon size="24" :style="{ color: 'hsl(var(--primary-foreground) / 0.8)' }"><Clock /></el-icon>
              <span>实时数据</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <el-icon size="24" :style="{ color: 'hsl(var(--primary-foreground) / 0.8)' }"><Lock /></el-icon>
              <span>安全可靠</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <el-icon size="24" :style="{ color: 'hsl(var(--primary-foreground) / 0.8)' }"><Headset /></el-icon>
              <span>专业服务</span>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { HomeFilled, Calendar, ArrowRight, Clock, Lock, Headset } from '@element-plus/icons-vue'

const router = useRouter()

const goToDiffConfirm = () => {
  router.push({ name: 'monthly-diff-confirm' })
}
</script>

<style scoped>
.welcome-page {
  min-height: 100vh;
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-hover)) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.welcome-header {
  text-align: center;
  margin-bottom: 60px;
}

.welcome-content {
  max-width: 600px;
  color: white;
}

.welcome-icon {
  margin-bottom: 20px;
}

.welcome-title {
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 10px 0;
  color: hsl(var(--primary-foreground));
  text-shadow: 0 2px 4px hsl(var(--primary) / 0.3);
}

.welcome-subtitle {
  font-size: 24px;
  font-weight: 300;
  margin: 0 0 30px 0;
  color: hsl(var(--primary-foreground) / 0.9);
  opacity: 0.95;
}

.welcome-description {
  font-size: 18px;
  line-height: 1.6;
  color: hsl(var(--primary-foreground) / 0.8);
  opacity: 0.9;
}

.welcome-actions {
  width: 100%;
  max-width: 800px;
  margin-bottom: 60px;
}

.action-card {
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.action-content {
  display: flex;
  align-items: center;
  padding: 40px;
  background: white;
  gap: 30px;
}

.action-icon {
  flex-shrink: 0;
}

.action-text {
  flex: 1;
}

.action-text h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #303133;
}

.action-text p {
  margin: 0;
  color: #606266;
  line-height: 1.5;
}

.welcome-footer {
  width: 100%;
  max-width: 600px;
}

.footer-info {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 40px;
  border: 1px solid hsl(var(--primary-foreground) / 0.1);
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: hsl(var(--primary-foreground));
  font-size: 16px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .welcome-title {
    font-size: 36px;
  }

  .welcome-subtitle {
    font-size: 18px;
  }

  .action-content {
    flex-direction: column;
    text-align: center;
    padding: 30px 20px;
  }

  .action-text h3 {
    font-size: 20px;
  }

  .footer-info {
    padding: 30px 20px;
  }

  .info-item {
    flex-direction: column;
    gap: 5px;
  }
}
</style>
