<template>
    <div v-if="isVisible" class="modal" tabindex="-1" style="display: block;" aria-modal="true" role="dialog">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Редактировать проект' : 'Создать новый проект' }}</h5>
            <button type="button" class="btn-close" @click="$emit('close')"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitForm">
              <div class="mb-3">
                <label for="projectName" class="form-label">Название проекта</label>
                <input
                  type="text"
                  id="projectName"
                  class="form-control"
                  v-model="localProjectForm.name"
                  required
                />
              </div>
              <button type="submit" class="btn btn-primary">Сохранить</button>
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
  .modal {
    display: block;
    background-color: rgba(0, 0, 0, 0.5);
  }
  .modal-dialog {
    max-width: 500px;
    margin: 1.75rem auto;
  }
  </style>
  