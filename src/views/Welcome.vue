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
import { HomeFilled, Clock, Lock, Headset } from '@element-plus/icons-vue'
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

  .footer-info {
    padding: 30px 20px;
  }

  .info-item {
    flex-direction: column;
    gap: 5px;
  }
}
</style>
