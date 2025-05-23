<template>
  <div v-if="isVisible" class="modal custom-modal" tabindex="-1" aria-modal="true" role="dialog">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isEditing ? 'Редактировать проект' : 'Создать новый проект' }}</h5>
          <button type="button" class="btn-close" @click="$emit('close')" aria-label="Закрыть"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="mb-3">
              <label for="projectName" class="form-label">Название проекта</label>
              <input
                type="text"
                id="projectName"
                class="form-control custom-input"
                v-model="localProjectForm.name"
                required
                placeholder="Введите название проекта"
                maxlength="100"
                autocomplete="off"
              />
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="$emit('close')">Отмена</button>
              <button type="submit" class="btn btn-primary">Сохранить</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isVisible: Boolean,
    isEditing: Boolean,
    projectForm: Object,
  },
  data() {
    return {
      localProjectForm: { name: this.projectForm.name || '' },
    };
  },
  watch: {
    projectForm(newVal) {
      this.localProjectForm = { name: newVal.name || '' };
    },
  },
  methods: {
    submitForm() {
      // Передаем название проекта в событии `save`
      this.$emit('save', { name: this.localProjectForm.name });
    },
  },
};
</script>

<style scoped>
.modal.custom-modal {
  display: block;
  background: rgba(44, 62, 80, 0.25);
  z-index: 1050;
  padding-top: 40px;
  min-height: 100vh;
}

.modal-dialog {
  max-width: 420px;
  margin: 2.5rem auto;
}

.modal-content {
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(60, 80, 180, 0.13), 0 2px 8px rgba(0, 0, 0, 0.07);
  border: none;
  background: #f9fafb;
  padding-bottom: 6px;
}

.modal-header {
  border-bottom: none;
  padding: 22px 28px 10px 28px;
  border-radius: 18px 18px 0 0;
  background: #f5f7fa;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3a4a;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.3rem;
  opacity: 0.7;
  transition: opacity 0.15s;
}
.btn-close:hover {
  opacity: 1;
}

.modal-body {
  padding: 18px 28px 18px 28px;
}

.form-label {
  font-weight: 600;
  color: #3a4a5d;
  margin-bottom: 6px;
}

.custom-input {
  border-radius: 10px;
  border: 1px solid #dbeafe;
  background: #fff;
  padding: 10px 14px;
  font-size: 1.05rem;
  color: #2d3a4a;
  transition: border-color 0.18s;
  box-shadow: 0 1px 4px rgba(60, 80, 180, 0.04);
}
.custom-input:focus {
  border-color: #3a7afe;
  outline: none;
  background: #f0f6ff;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 18px;
}

.btn {
  border-radius: 10px;
  font-weight: 600;
  font-size: 1.01rem;
  min-width: 100px;
  padding: 10px 0;
  box-shadow: 0 1px 4px rgba(60, 80, 180, 0.06);
  border: none;
  transition: background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.18s;
  outline: none;
}

.btn-primary {
  background: linear-gradient(90deg, #3a7afe 0%, #5cb6ff 100%);
  color: #fff;
}
.btn-primary:hover, .btn-primary:focus {
  background: linear-gradient(90deg, #255ed6 0%, #3a7afe 100%);
  color: #fff;
  transform: translateY(-1px) scale(1.03);
}

.btn-secondary {
  background: #e9ecef;
  color: #2d3a4a;
}
.btn-secondary:hover, .btn-secondary:focus {
  background: #d1d5db;
  color: #2d3a4a;
  transform: translateY(-1px) scale(1.03);
}
</style>
