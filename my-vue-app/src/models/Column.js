export class Column {
    constructor(data) {
      this.id = data?.id;
      this.title = data?.title;
      this.projectId = data?.projectId;
      this.tasks = data.tasks.$values || [];
    }
  }