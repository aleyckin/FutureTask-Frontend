<template>
  <div v-if="visible" class="notification" :class="type">
    {{ message }}
  </div>
</template>

<script>
export default {
  props: {
    message: String,
    type: {
      type: String,
      default: "success",
    },
  },
  data() {
    return {
      visible: false,
      hideTimeout: null,
    };
  },
  watch: {
    // Отслеживаем изменения в `message`, чтобы показывать уведомление каждый раз при изменении текста
    message(newValue) {
      if (newValue) {
        this.show();
      }
    }
  },
  methods: {
    show() {
      this.visible = true;
      
      // Сбросить предыдущий таймер скрытия, если он активен
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
      }

      // Устанавливаем таймер для автоматического скрытия через 3 секунды
      this.hideTimeout = setTimeout(() => {
        this.visible = false;
      }, 3000);
    },
  },
  beforeUnmount() {
    // Очищаем таймер при уничтожении компонента
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
  },
};
</script>

<style scoped>
.notification {
  top: 80px;
  position: fixed;
  right: 20px;
  padding: 10px 20px;
  border-radius: 4px;
  color: white;
  opacity: 0.9;
}
.success {
  background-color: #4caf50;
}
.error {
  background-color: #f44336;
}
.info {
  background-color: #2196f3;
}
</style>

  
  <style scoped>
  .notification {
    top: 80px;
    position: fixed;
    right: 20px;
    padding: 10px 20px;
    border-radius: 4px;
    color: white;
    opacity: 0.9;
  }
  .success {
    background-color: #4caf50;
  }
  .error {
    background-color: #f44336;
  }
  .info {
    background-color: #2196f3;
  }
  </style>
  